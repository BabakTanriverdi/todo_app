import React from "react";
import "./style.css";

const Header = () => {
  return (
    <div className="header-wrap">
      <div className="header-logo">
        <svg viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>
      <h1 className="header-title">Clarus Todos</h1>
      <p className="header-sub">✨ Built by Clarusway Developers</p>
    </div>
  );
};

export default Header;
