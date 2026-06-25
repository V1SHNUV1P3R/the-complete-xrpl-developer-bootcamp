import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTurnUp, faArrowTurnDown } from "@fortawesome/free-solid-svg-icons";

import { useAccounts } from "../contexts/AccountContext";
import Transactions from "../components/Transactions";
import Balance from "../components/Balance";

import "./main.scss";

function Main() {
  const { selectedWallet } = useAccounts();
  const [showReceiveXRP, setShowReceiveXRP] = useState(false);

  // The home screen is a simple dashboard: actions first, then balance, then history.
  const openReceiveModal = () => setShowReceiveXRP(true);
  const closeReceiveModal = () => setShowReceiveXRP(false);

  return (
    <>
      <div className="main">
        <section className="action-buttons">
          <Link to="/send">
            <Button variant="primary">
              <FontAwesomeIcon icon={faArrowTurnUp} />
              <span>Send</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            onClick={openReceiveModal}
          >
            <FontAwesomeIcon icon={faArrowTurnDown} />
            <span>Receive</span>
          </Button>
        </section>

        <section className="balance-container">
          <Balance />
        </section>

        <section className="transactions-container">
          <Transactions />
        </section>
      </div>

      <Modal
        show={showReceiveXRP}
        onHide={closeReceiveModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Receive XRP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Give the sender this address</strong>
          </p>
          <p>{selectedWallet?.address}</p>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Main;
