import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Tg from '../components/toggle';
import { notification } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { marketplaceAddress } from "../config";
import {Web3} from 'web3';
import $ from 'jquery'; 
import ABI from "../SmartContract/artifacts/contracts/InvestmentClub.sol/InvestmentClub.json"
const ethers = require("ethers")
const web3 = new Web3(new Web3.providers.HttpProvider("https://evmtestnet.confluxrpc.com"));



const provider = new ethers.providers.Web3Provider(window.ethereum);



var contractPublic = null;


const owneraddress = localStorage.getItem("filWalletAddress");


function CreateClub() {

  
  
 
  const [clubName, setClubName] = useState('');
  const [password, setPassword] = useState('');


  async function checkBalance() {
  
    try {
      const myWallet = localStorage.getItem("filWalletAddress");
      if (!myWallet) {
        // Handle the case where the wallet address is not available in localStorage
        return;
      }
      
      // Assuming you've properly initialized the web3 instance before this point
      const balanceWei = await web3.eth.getBalance(myWallet);
      
      // Convert Wei to Ether (assuming Ethereum)
      const balanceEther = web3.utils.fromWei(balanceWei, "ether");
      
      // Update the balance on the page
      $('.view_balance_address').text(balanceEther);
    } catch (error) {
      console.error("Error:", error);
    }
  }



  async function createClub() {
    toast.info('DAO Creation intiated ...', {
      position: "top-right",
      autoClose: 15000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      });
    async function getContract(userAddress) {
      contractPublic =  new web3.eth.Contract(ABI.abi,marketplaceAddress);
      console.log(contractPublic)
      if(userAddress != null && userAddress != undefined) {
        // alert("inside")
        contractPublic.defaultAccount = userAddress;
      }
    }

    var walletAddress = localStorage.getItem("filWalletAddress");

    var password = $('#trx_password').val();
    await getContract(walletAddress);
    // alert("password showing sucessfull") //
    if(contractPublic != null) {
      var clubName = $('#club_name').val();
      // alert("clubName showing sucessfully") //
      if(clubName == '') {
        $('#errorCreateClub').css("display","block");
        $('#errorCreateClub').text("Club name is invalid");
        return;
      }
      if(password == '') {
        $('#errorCreateClub').css("display","block");
        $('#errorCreateClub').text("Password is invalid");
        return;
      }
      const my_wallet = await web3.eth.accounts.wallet.load(password);
      // alert(my_wallet)
      
      if(my_wallet !== undefined)
      {
        toast.success('Generating random CID', {
          position: "top-right",
          autoClose: 15000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          });
        
        // Generate a random CID-like string
        const generateRandomCID = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let result = 'Qm';
          for (let i = 0; i < 44; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };

        const cid1 = generateRandomCID();
        console.log("The generated CID is ", cid1);
        // await register_job(cid1);


      try
      {
        
          $('.loading_message_creating').css("display","block");
          console.log("The contractPublic is ",contractPublic)
          const query = contractPublic.methods.createClub(clubName,cid1);
  
          const encodedABI = query.encodeABI();
          // alert(this.contractPublic.options.address)


          // console.log(encodedABI);

          console.log("The addrtess  is",owneraddress);

        const abi = ABI.abi;
            const iface = new ethers.utils.Interface(abi);
            const encodedData = iface.encodeFunctionData("createClub", [clubName,cid1]);
            const GAS_MANAGER_POLICY_ID = "479c3127-fb07-4cc6-abce-d73a447d2c01";


            await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
            const signer = provider.getSigner();
             

              console.log("singer",signer);
              const tx = {
                to: marketplaceAddress,
                data: encodedData,
                
              };
              const txResponse = await signer.sendTransaction(tx);
              const txReceipt = await txResponse.wait();

              notification.success({
                message: 'Transaction Successful',
                description: (
                  <div>
                   Transaction Hash: <a href={`https://evmtestnet.confluxscan.io/tx/${txReceipt.transactionHash}`} target="_blank" rel="noopener noreferrer">{txReceipt.transactionHash}</a>
                  </div>
                )
              });
              console.log(txReceipt.transactionHash);


   
        $('#club_name').val('');
        $('#errorCreateClub').css("display","none");
        $('.loading_message_creating').css("display","none");
        $('#successCreateClub').css("display","block");
        toast.success("Club created successfully with the name: " + clubName);
        $('#successCreateClub').text("Club created successfully with the name: " + clubName);
      } catch(e) {
        console.log(e)
        $('.valid-feedback').css('display','none');
          $('.invalid-feedback').css('display','block');
          $('.loading_message_creating').css("display","none");
          $('.invalid-feedback').text(e);
      }
      
      }
    } else {
      $('.valid-feedback').css('display','none');
            $('.invalid-feedback').css('display','block');
            $('.loading_message_creating').css("display","none");
            $('.invalid-feedback').text('The password is invalid');
      }
  }

  const navigate = useNavigate();
  function Logout(){
    web3.eth.accounts.wallet.clear();
    localStorage.clear();
    navigate('/login');
  
  }

  useEffect(() => {
    {
      
      
      if(localStorage.getItem('filWalletAddress') != null) {
        checkBalance();

        const myWallet = localStorage.getItem("filWalletAddress")
        $('.current_account_text').text(myWallet);
      }
    }
  }, []);
  

  return (
    <div id="page-top">
          <div id="wrapper">
    {/* Sidebar */}
    <ul
      className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
      id="accordionSidebar"
    >
      {/* Sidebar - Brand */}
      <a
        className="sidebar-brand d-flex align-items-center justify-content-center"
        href="/"
      >
        <div className="sidebar-brand-icon rotate-n-15">
          <i className="fas fa-laugh-wink" />
        </div>
        <div className="sidebar-brand-text mx-3">🤖 AI Treasury DAO</div>
      </a>
      {/* Divider */}
      <hr className="sidebar-divider my-0" />
      {/* Nav Item - Dashboard */}
      <li className="nav-item active">
      <Link  className="nav-link" to="/">
          <i className="fas fa-fw fa-tachometer-alt" />
          <span>Dashboard</span>
        </Link>
      </li>
      <li className="nav-item">
        <Link  className="nav-link" to="/joinclub">
          <i className="fas fa-fw fa-file-image-o" />
          <span>Available clubs</span>
          </Link>
        
      </li>
      <li className="nav-item">
      <Link  className="nav-link" to="/createclub">
          <i className="fas fa-fw fa-file-image-o" />
          <span>Create club</span>
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/ai-dashboard">
          <i className="fas fa-fw fa-robot" />
          <span>AI Dashboard</span>
        </Link>
      </li>
      {/* Divider */}
      <hr className="sidebar-divider d-none d-md-block" />
      {/* Sidebar Toggler (Sidebar) */}
      <div className="text-center d-none d-md-inline">
        <button  onClick={Tg} className="rounded-circle border-0" id="sidebarToggle" />
      </div>
    </ul>
    {/* End of Sidebar */}
    {/* Content Wrapper */}
    <div id="content-wrapper" className="d-flex flex-column">
      {/* Main Content */}
      <div id="content">
        {/* Topbar */}
        
        {/* End of Topbar */}
        {/* Begin Page Content */}
        <div className="container-fluid">
          {/* Page Heading */}
          <div className="d-sm-flex align-items-center justify-content-between mb-4">
            <h1 className="h3 mb-0 text-gray-800">
              Create a new investment club
            </h1>
          </div>
          {/* Content Row */}
          <div className="row">
            {/* Earnings (Monthly) Card Example */}
            <div className="col-xl-2 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Balance (CFX)
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800 view_balance_address">
                        -
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-calendar fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-secondary text-uppercase mb-1">
                        Dashboard
                      </div>
                      
                      <Link  className="btn btn-primary" to="/">
                        Go to Dashboard
                      </Link>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-clipboard-list fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-secondary text-uppercase mb-1">
                        Clubs{" "}
                      </div>
                      <Link  className="btn btn-secondary" to="/joinclub">
                        See available clubs
                      </Link>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-clipboard-list fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Content Row */}
          <div className="row">
            {/* Area Chart */}
            <div className="col-xl-12 col-lg-9">
              <div className="card shadow mb-4">
                {/* Card Header - Dropdown */}
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">
                    Create your own investment club
                  </h6>
                </div>
                {/* Card Body */}
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      Club Name:{" "}
                      <input
                        type="text"
                        id="club_name"
                        className="form-control form-control-user"
                        placeholder="Give a name for this Investment Club"
                        value={clubName}
                        onChange={(e) => setClubName(e.target.value)}
                      />{" "}
                      <br />
                      Club Description:{" "}
                      <input
                        type="text"
                        id="club_name"
                        className="form-control form-control-user"
                        placeholder="Give a Description for this Investment Club"
                        
                      />{" "}
                      <br />
                      <br />
                      <br />
                      <br />
                      <input
                      onClick={() => {
                        createClub();
                      }}
                        type="button"
                        id="createClubButton"
                        defaultValue="Create"
                        className="btn btn-primary btn-block"
                      />
                      <span
                        className="loading_message_creating"
                        style={{ display: "none" }}
                      >
                        Creating the club...
                      </span>
                      <p
                        className="valid-feedback"
                        id="successCreateClub"
                        style={{ display: "none" }}
                      />
                      <p
                        className="invalid-feedback"
                        id="errorCreateClub"
                        style={{ display: "none" }}
                      >
                        Error
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Content Row */}
          <div className="row">
            <div className="col-lg-6 mb-4"></div>
          </div>
        </div>
        {/* /.container-fluid */}
      </div>
      {/* End of Main Content */}
      {/* Footer */}
      <footer className="sticky-footer bg-white"></footer>
      {/* End of Footer */}
    </div>
    {/* End of Content Wrapper */}
  </div>
  {/* End of Page Wrapper */}
  {/* Scroll to Top Button*/}
  <a className="scroll-to-top rounded" href="#page-top">
    <i className="fas fa-angle-up" />
  </a>
  {/* Logout Modal*/}
  <div
    className="modal fade"
    id="seeAccountModal"
    tabIndex={-1}
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">
            Account
          </h5>
          <button
            className="close"
            type="button"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-body">
          Address: <br /> <div className="current_account" />
          <br />
          <span
            style={{ fontSize: "x-small" }}
            className="current_account_text"
          />
        </div>
        <div className="modal-footer"></div>
      </div>
    </div>
  </div>
  {/* Logout Modal*/}
  <div
    className="modal fade"
    id="logoutModal"
    tabIndex={-1}
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">
            Ready to Leave?
          </h5>
          <button
            className="close"
            type="button"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-body">
          Select "Logout" below if you are ready to end your current session in
          this browser.
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            type="button"
            data-dismiss="modal"
          >
            Cancel
          </button>
          <div className="btn btn-primary" onClick={Logout} id="btnLogout">
            Logout
          </div>
        </div>
      </div>
    </div>
  </div>
    </div>
  )
}

export default CreateClub