import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet } from "xrpl";

import { useAccounts } from "../contexts/AccountContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import "./import-account.scss";

function ImportAccount() {
  const [seed, setSeed] = useState("");
  const { addAccount } = useAccounts();
  const navigate = useNavigate();

  // Step 1: turn the family seed into a wallet.
  // Step 2: save that wallet into the app state.
  const createAccountFromSeed = (familySeed) => {
    const wallet = Wallet.deriveWallet(familySeed);
    return {
      address: wallet.classicAddress,
      seed: wallet.seed,
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addAccount(createAccountFromSeed(seed));
    navigate("/manage-account");
  };

  return (
    <div className="import-account">
      <Form onSubmit={handleSubmit}>
        <h1>
          <FontAwesomeIcon icon={faFileImport} />
          <span>Import Account</span>
        </h1>

        <Form.Group
          className="seed-container"
          controlId="formImportSeed"
        >
          <Form.Label>Family Seed</Form.Label>
          <Form.Control
            type="text"
            onChange={(event) => setSeed(event.target.value)}
            value={seed}
            required
          ></Form.Control>
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
        >
          Import
        </Button>
      </Form>
    </div>
  );
}

export default ImportAccount;
