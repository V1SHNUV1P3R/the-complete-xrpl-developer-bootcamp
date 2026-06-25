import { useState } from "react";
import { Wallet } from "xrpl";
import { useNavigate } from "react-router-dom";

import { useAccounts } from "../contexts/AccountContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";

import "./generate-account.scss";

function GenerateAccount() {
  const [seed, setSeed] = useState("");
  const [address, setAddress] = useState("");
  const { addAccount } = useAccounts();
  const navigate = useNavigate();

  // Step 1: create a brand new wallet.
  // Step 2: show it to the user so they can decide whether to save it.
  const createNewWallet = () => {
    const newWallet = Wallet.generate();
    setSeed(newWallet.seed);
    setAddress(newWallet.classicAddress);
  };

  const saveWallet = () => {
    addAccount({ address, seed });
    navigate("/manage-account");
  };

  const cancelSave = () => setSeed("");

  return (
    <div className="generate-account">
      {seed ? (
        <>
          <h1>
            <FontAwesomeIcon icon={faFloppyDisk} />
            <span>Save Account</span>
          </h1>

          <div className="account-container">
            <label>Address</label>
            <div>{address}</div>
            <label>Family Seed</label>
            <div>{seed}</div>
          </div>

          <div className="action-buttons">
            <Button
              variant="primary"
              onClick={saveWallet}
            >
              Save to wallet
            </Button>
            <Button
              variant="secondary"
              onClick={cancelSave}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1>
            <FontAwesomeIcon icon={faCirclePlus} />
            <span>Generate Account</span>
          </h1>
          <p>
            Clicking generate will create a new seed and address, but you&rsquo;ll need to click
            save to add it to your account and it won&rsquo;t become active until you send it some
            XRP.
          </p>
          <Button
            variant="primary"
            onClick={createNewWallet}
          >
            Generate
          </Button>
        </>
      )}
    </div>
  );
}

export default GenerateAccount;
