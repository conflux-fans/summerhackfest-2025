import React from 'react'
import { BrowserRouter, Routes, Route,Navigate, Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { marketplaceAddress } from "../config";
import {Web3} from 'web3';
import $ from 'jquery'; 
import ABI from "../SmartContract/artifacts/contracts/InvestmentClub.sol/InvestmentClub.json"

const web3 = new Web3(new Web3.providers.HttpProvider("https://node.botanixlabs.dev"));
var contractPublic = null;




function Register() {
    const navigate = useNavigate();
    async function generateWallet()
{
  $('#creatingwallet').show();
  const my_wallet = web3.eth.accounts.create();
  if (my_wallet != null) {
    $('#new_address_generated').show();
      $('#filAccount').text(my_wallet.address);
      $('#filPrivateKey').text(my_wallet.privateKey);
      $('#creatingwallet').hide();
      $('.newWalletData').css('display', 'block');

  }
  $('.loadingNewWalletDiv').css('display', 'none');
}


function saveWallet() {
    var address = $('#filAccount').text();
    var secret = $('#filPrivateKey').text();
    var password = $('#passwordRegisterAccount').val();
    //var encryptedAddress = CryptoJS.AES.encrypt(address, password);
    web3.eth.accounts.wallet.clear();
    web3.eth.accounts.wallet.add(secret);
    web3.eth.accounts.wallet.save(password);
    localStorage.setItem('filWalletAddress', address);
    
    confirmKeySaved();
  }
  
  function confirmKeySaved() {
    localStorage.authenticated = "true";
    
  navigate('/');
    
  }
  return (
    <div className="bg-gradient-primary">
    <div className="container">
  <div className="card o-hidden border-0 shadow-lg my-5">
    <div className="card-body p-0">
      {/* Nested Row within Card Body */}
      <div className="row">
        <div className="col-lg-5 d-none d-lg-block bg-register-image" />
        <div className="col-lg-7">
          <div className="p-5">
            <div className="text-center">
              <h1 className="h4 text-gray-900 mb-4">Botanix CLUB - Create an Account!</h1>
            </div>
            <div className="text-center">
            Botanix  is a light web wallet and platform that allows you to: 
              <ul>
                <li><b>Create investment clubs.</b></li> 
                <li><b>Join and contribute to investment clubs.</b></li> 
                <li><b>Create, vote, and execute proposals. on Chain</b></li>
              </ul>
            </div>
            <form className="user">
              <div className="alert alert-warning" id="creatingwallet" style={{display: 'none'}}>Creating wallet....</div>
              <div className="form-group">
                <a id="generateWalletButton"  onClick={generateWallet} className="btn btn-primary btn-user btn-block">
                  Generate address
                </a>
              </div>
              <div className="form-group row" style={{display: 'none'}} id="new_address_generated">
                <h3 className="h4 text-gray-900 mb-4">Save this data and try to login with a new password</h3>
                <div className="col-sm-12 mb-6 mb-sm-0">
                  <input type="hidden" id="hidden_new_wallet_address" />
                  <input type="hidden" id="hidden_new_wallet_secret" />
                  Address: <b><span id="filAccount" /></b> <br />
                  Private Key: <b><span id="filPrivateKey" /></b> <br />
                </div>
                <div className="col-sm-12 mb-6 mb-sm-0">
                  Request some BTC TESNET from the faucet: <a href="https://botanixlabs.xyz/en/testnet" target="_blank" className="btn btn-success btn-user btn-block">Faucet</a>
                </div>
                <div className="col-sm-12 mb-6 mb-sm-0">
                  Create a password for your wallet: 
                  <input type="password" id="passwordRegisterAccount" className="form-control" />
                  <a id="saveWallet"  onClick={saveWallet} className="btn btn-secondary btn-user btn-block">Save wallet and login</a>
                </div>
              </div>
              <hr />
            </form>
            <hr />
            <div className="text-center">
              <a className="small" href="/login">Already have an account? Login!</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div></div>
  )
}

export default Register
