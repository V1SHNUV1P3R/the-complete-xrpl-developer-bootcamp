import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Client, dropsToXrp, Wallet, xrpToDrops } from "xrpl";
import { ToastManager } from "../components/Toast";

const AccountContext = createContext();

const STORAGE_KEYS = {
  accounts: "accounts",
  selectedAccount: "selectedAccount",
};

// This provider acts as the main wallet controller.
// It keeps the wallet state in one place and exposes simple actions for the pages.
export const AccountProvider = ({ children }) => {
  const clientRef = useRef(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState();
  const [balance, setBalance] = useState();
  const [transactions, setTransactions] = useState([]);
  const [reserve, setReserve] = useState();

  const network = process.env.REACT_APP_NETWORK;

  // One small helper keeps the XRPL client creation consistent.
  const createClient = useCallback(() => new Client(network), [network]);

  // Step 1: read the current balance from the ledger.
  const getAccountBalance = useCallback(
    async (account) => {
      if (!account) {
        setBalance(undefined);
        return;
      }

      const ledgerClient = createClient();

      try {
        await ledgerClient.connect();
        const response = await ledgerClient.request({
          command: "account_info",
          account: account.address,
          ledger_index: "validated",
        });

        setBalance(dropsToXrp(response.result.account_data.Balance));
      } catch (error) {
        console.log(error);
        setBalance(undefined);
      } finally {
        await ledgerClient.disconnect();
      }
    },
    [createClient]
  );

  // Step 2: read the last transactions for the selected account.
  const getAccountTransactions = useCallback(
    async (account) => {
      if (!account) {
        setTransactions([]);
        return;
      }

      const ledgerClient = createClient();

      try {
        await ledgerClient.connect();
        const response = await ledgerClient.request({
          command: "account_tx",
          account: account.address,
          ledger_index_min: -1,
          ledger_index_max: -1,
          limit: 20,
          forward: false,
        });

        const filteredTransactions = response.result.transactions
          .filter(({ tx }) => tx.TransactionType === "Payment" && typeof tx.Amount === "string")
          .map(({ tx, meta }) => ({
            account: tx.Account,
            destination: tx.Destination,
            hash: tx.hash,
            direction: tx.Account === account.address ? "Sent" : "Received",
            date: new Date((tx.date + 946684800) * 1000),
            transactionResult: meta.TransactionResult,
            amount:
              meta.TransactionResult === "tesSUCCESS" ? dropsToXrp(meta?.delivered_amount) : 0,
          }));

        setTransactions(filteredTransactions);
      } catch (error) {
        console.log(error);
        setTransactions([]);
      } finally {
        await ledgerClient.disconnect();
      }
    },
    [createClient]
  );

  // Step 3: refresh the balance and transaction list together.
  const refreshAccountData = useCallback(
    async (account) => {
      await Promise.all([getAccountBalance(account), getAccountTransactions(account)]);
    },
    [getAccountBalance, getAccountTransactions]
  );

  // On first load, restore saved wallets and the last selected wallet.
  useEffect(() => {
    const storedAccounts = localStorage.getItem(STORAGE_KEYS.accounts);
    const storedDefault = localStorage.getItem(STORAGE_KEYS.selectedAccount);

    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    }

    if (storedDefault) {
      setSelectedWallet(JSON.parse(storedDefault));
    }

    const loadReserve = async () => {
      const ledgerClient = createClient();

      try {
        await ledgerClient.connect();
        const response = await ledgerClient.request({ command: "server_info" });
        setReserve(response.result.info.validated_ledger.reserve_base_xrp);
      } catch (error) {
        console.log(error);
      } finally {
        await ledgerClient.disconnect();
      }
    };

    loadReserve();
  }, [createClient]);

  // Keep listening to the selected wallet so the UI updates when new transactions arrive.
  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = createClient();
    }

    const onTransaction = async (event) => {
      if (!selectedWallet) return;

      const amount = dropsToXrp(event.transaction.Amount || 0);

      if (event.meta.TransactionResult === "tesSUCCESS") {
        if (event.transaction.Account === selectedWallet.address) {
          ToastManager.addToast(`Successfully sent ${amount} XRP`);
        } else if (event.transaction.Destination === selectedWallet.address) {
          ToastManager.addToast(`Successfully received ${amount} XRP`);
        }
      } else {
        ToastManager.addToast("Failed");
      }

      await refreshAccountData(selectedWallet);
    };

    const subscribeToWallet = async () => {
      if (!selectedWallet) return;

      try {
        if (!clientRef.current.isConnected()) {
          await clientRef.current.connect();
        }

        clientRef.current.on("transaction", onTransaction);

        await clientRef.current.request({
          command: "subscribe",
          accounts: [selectedWallet.address],
        });
      } catch (error) {
        console.error(error);
      }
    };

    subscribeToWallet();
    refreshAccountData(selectedWallet);

    return () => {
      if (clientRef.current?.isConnected() && selectedWallet?.address) {
        clientRef.current.removeListener("transaction", onTransaction);
        clientRef.current.request({
          command: "unsubscribe",
          accounts: [selectedWallet.address],
        });
      }
    };
  }, [selectedWallet, refreshAccountData, createClient]);

  const refreshBalance = () => {
    getAccountBalance(selectedWallet);
  };

  const refreshTransactions = () => {
    getAccountTransactions(selectedWallet);
  };

  const selectWallet = (account) => {
    localStorage.setItem(STORAGE_KEYS.selectedAccount, JSON.stringify(account));
    setSelectedWallet(account);
  };

  // Add a wallet to the list, but avoid duplicates.
  const addAccount = (account) => {
    setAccounts((prevAccounts) => {
      const isDuplicate = prevAccounts.some((existingAccount) => existingAccount.address === account.address);

      if (isDuplicate) {
        console.log("Account duplication: not added");
        return prevAccounts;
      }

      const updatedAccounts = [...prevAccounts, account];
      localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(updatedAccounts));
      return updatedAccounts;
    });
  };

  // Remove a wallet from the saved list.
  const removeAccount = (account) => {
    setAccounts((prevAccounts) => {
      const updatedAccounts = prevAccounts.filter((existingAccount) => existingAccount !== account);
      localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(updatedAccounts));
      return updatedAccounts;
    });
  };

  // Send XRP by building a payment, signing it, and submitting it to the ledger.
  const sendXRP = async (amount, destination, destinationTag) => {
    if (!selectedWallet) throw new Error("No wallet selected");

    const wallet = Wallet.fromSeed(selectedWallet.seed);
    const ledgerClient = createClient();

    try {
      await ledgerClient.connect();

      const payment = {
        TransactionType: "Payment",
        Account: wallet.classicAddress,
        Amount: xrpToDrops(amount),
        Destination: destination,
      };

      if (destinationTag) {
        payment.DestinationTag = parseInt(destinationTag);
      }

      const prepared = await ledgerClient.autofill(payment);
      const signed = wallet.sign(prepared);
      await ledgerClient.submitAndWait(signed.tx_blob);
    } catch (error) {
      console.error(error);
    } finally {
      await ledgerClient.disconnect();
      refreshBalance();
      refreshTransactions();
    }
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        addAccount,
        removeAccount,
        selectWallet,
        balance,
        transactions,
        reserve,
        refreshBalance,
        refreshTransactions,
        sendXRP,
        selectedWallet,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);
