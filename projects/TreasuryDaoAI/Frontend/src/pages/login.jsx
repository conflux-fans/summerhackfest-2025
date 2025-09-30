import React from 'react'
import { useNavigate } from 'react-router-dom';
import {Web3} from 'web3';
import $ from 'jquery'; 


import Register from './register'
const web3 = new Web3(new Web3.providers.HttpProvider("https://node.botanixlabs.dev"));
var contractPublic = null;
function Regis(){

  return <Register/>

}

function Login() {
  const navigate = useNavigate();



function generateWalletFromPrivateKey()
{
  
    const privateKey = $('#pvKeyValue').val();
    const password = $('#pvKeyNewPasswordValue').val();
    
    if(privateKey != '' && password != '') {
      // alert(privateKey)
      
      web3.eth.accounts.wallet.clear();
      web3.eth.accounts.wallet.add(privateKey);
      web3.eth.accounts.wallet.save(password);
      localStorage.setItem('filWalletAddress', web3.eth.accounts.privateKeyToAccount(privateKey).address);
      confirmKeySaved();
    }
    else {
      $('#errorLogin').css("display","block");
      $('#errorLogin').text('The private key and password must not be empty.');
        
    }
}
function confirmKeySaved() {
  localStorage.authenticated = "true";
  
navigate('/');
  
}



  return (
    <div className="bg-gradient-primary">
    <div className="container">
  {/* Outer Row */}
  <div className="row justify-content-center">
    <div className="col-xl-10 col-lg-12 col-md-9">
      <div className="card o-hidden border-0 shadow-lg my-5">
        <div className="card-body p-0">
          {/* Nested Row within Card Body */}
          <div className="row">
            <div className="col-lg-6 d-none d-lg-block bg-login-image " />
            <div className="col-lg-6">
              <div className="p-5">
                <div className="text-center">
                  <h1 className="h4 text-gray-900 mb-4">Botanix CLUB - Welcome Back!</h1>
                </div>
                <form className="user">
                  <div className="form-group">
                    <input type="password" className="form-control form-control-user" id="pvKeyValue" aria-describedby="emailHelp" placeholder="Enter your private key" />
                    <input type="password" className="form-control form-control-user" id="pvKeyNewPasswordValue" aria-describedby="emailHelp" placeholder="Enter a new password" />
                  </div>
                  <div id="generateWalletPrivKeyButton" onClick={generateWalletFromPrivateKey} className="btn btn-primary btn-user btn-block">
                    Login with your private key
                  </div>
                  <p className="invalid-feedback" id="errorLogin" />
                  <hr />
                </form>
                <hr />
                <div className="text-center">
                  <a className="small"  onClick={Regis} href="/register" >Create an Account!</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div></div>

  )
}

export default Login