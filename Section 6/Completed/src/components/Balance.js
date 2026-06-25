import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

import { useAccounts } from "../contexts/AccountContext";

import "./balance.scss";

function Balance() {
  const { balance, reserve, refreshBalance } = useAccounts();

  // The visible balance is the account balance minus the reserve amount required by the ledger.
  const numericBalance = Number(balance);
  const numericReserve = Number(reserve);
  const visibleBalance = Number.isNaN(numericBalance) ? "-" : (numericBalance - numericReserve).toLocaleString();

  return (
    <div className="balance">
      <label>
        Balance (XRP)
        <FontAwesomeIcon
          icon={faRefresh}
          onClick={refreshBalance}
        />
      </label>
      <div className="amount">{visibleBalance}</div>
      <div className="reserve">Reserve: {reserve} xrp</div>
    </div>
  );
}

export default Balance;
