import { useNavigate } from "react-router-dom";

import "./header.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faGear } from "@fortawesome/free-solid-svg-icons";

function Header() {
  const navigate = useNavigate();

  // The header is just a simple route switcher for the main parts of the app.
  const goHome = () => navigate("/");
  const openAccounts = () => navigate("/manage-account");

  return (
    <header>
      <div
        className="header-logo"
        onClick={goHome}
      >
        <FontAwesomeIcon icon={faWallet} />
        <span className="project-name">XRPL Wallet 1.0</span>
      </div>
      <div
        className="header-settings"
        onClick={openAccounts}
      >
        <FontAwesomeIcon icon={faGear} />
      </div>
    </header>
  );
}

export default Header;
