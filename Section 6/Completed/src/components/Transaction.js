import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";

import "./transaction.scss";

function Transaction({ transaction }) {
  // Helper functions keep the JSX readable and make the status formatting easy to follow.
  const truncateAddress = (address) => {
    if (typeof address !== "string") return "";
    if (address.length <= 22) return address;
    return `${address.substring(0, 6)}....${address.substring(address.length - 16)}`;
  };

  const friendlyWarning = (message) => {
    switch (message) {
      case "tecUNFUNDED_PAYMENT":
        return "Insufficient funds";
      default:
        return message;
    }
  };

  const renderStatus = (result) => {
    if (result === "tesSUCCESS") {
      return (
        <FontAwesomeIcon
          icon={faThumbsUp}
          className="status-ok"
        />
      );
    }

    return <span className="status-warning">{friendlyWarning(result)}</span>;
  };

  return (
    <div className="row">
      <div className="col-3">{transaction.direction}</div>
      <div className="col-9">{transaction.amount} XRP</div>

      <div className="col-3">{transaction.direction === "Sent" ? "To" : "From"}</div>
      <div className="col-9">{truncateAddress(transaction.destination)}</div>

      <div className="col-3">On</div>
      <div className="col-9">{transaction.date.toLocaleString()}</div>

      <div className="col-3">Status</div>
      <div className="col-9">{renderStatus(transaction.transactionResult)}</div>

      <div className="col-3"></div>
      <div className="col-9">
        <Button
          href={`https://testnet.xrpl.org/transactions/${transaction.hash}`}
          target="_blank"
          className="view-on-explorer"
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </Button>
      </div>
    </div>
  );
}

export default Transaction;
