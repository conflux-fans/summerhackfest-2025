import React from "react";
import { useAuth } from "./Auth"

import "./Auth.css"
function LoggedOut() {
  const { login } = useAuth();

  return (
  
    <div className="container">
      <div className="h1">IC - CLUB</div>
      <div className="h2">One platform for Investment</div>
      <div className="p">To log in, click this button!</div>
      <button className="button1" type="button" id="loginButton" onClick={login}>
        Log in
      </button>
    </div>
  );
}


export default LoggedOut;
