import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { marketplaceAddress } from "../config";
import {Web3} from 'web3';
import $, { error } from 'jquery'; 
import { useNavigate } from 'react-router-dom';
import ABI from "../SmartContract/artifacts/contracts/InvestmentClub.sol/InvestmentClub.json"
import { notification } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GetClub from "../getclub";

import GetProposals from "../getProposals";
import axios from 'axios';
import Tg from "../components/toggle";
const ethers = require("ethers")
const web3 = new Web3(new Web3.providers.HttpProvider("https://evmtestnet.confluxrpc.com"));
var contractPublic = null;

var hash = null;
async function getContract(userAddress) {
    contractPublic = await new web3.eth.Contract(ABI.abi,marketplaceAddress);
    console.log(contractPublic)
    if(userAddress != null && userAddress != undefined) {
      contractPublic.defaultAccount = userAddress;
    }
  }



const provider = new ethers.providers.Web3Provider(window.ethereum);

async function contributeClub() {
 
  toast.info('Contribution intiated ...', {
    position: "top-right",
    autoClose: 15000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    });
  var walletAddress = localStorage.getItem("filWalletAddress");
  // alert(walletAddress) /// /////
  await getContract(walletAddress);
  $('.successContributeClub').css('display','none');
  $('.errorContributeClub').css('display','none');
  var clubId = localStorage.getItem("clubId");
  var amountAE = $('#aeAmount').val();
  // alert(amountAE)
  var password = $('#passwordShowPVContribute').val();
  if(amountAE == '' || amountAE <= 0) {
    $('.successContributeClub').css('display','none');
    $('.errorContributeClub').css("display","block");
    $('.errorContributeClub').text("Amount must be more than 0.");
    return;
  }
  if(password == '') {
    $('.successContributeClub').css('display','none');
    $('.errorContributeClub').css("display","block");
    $('.errorContributeClub').text("Password is invalid");
    return;
  }
  // var my_wallet = web3.eth.accounts.wallet.load(password)[0];
  const my_wallet = await web3.eth.accounts.wallet.load(password);
 
  
  if(my_wallet !== undefined)
  {
    if(clubId != null) {
      $('.successContributeClub').css("display","block");
      $('.successContributeClub').text("Contributing to the club...");
      
      if(contractPublic != undefined) {
        amountAE  = web3.utils.toWei(amountAE.toString(), 'ether');

        
        // alert(amountAE)
        //await contractPublic.$call('contributeToClub', [clubId])
        try {
          // alert("Yes");
          const query = contractPublic.methods.contributeToClub(clubId);
          const encodedABI = query.encodeABI();
          const accounts1 = web3.eth.accounts;
          


            if (web3 && web3.eth) {
              try {
                const abi = ABI.abi;
                    const iface = new ethers.utils.Interface(abi);
                    const encodedData = iface.encodeFunctionData("contributeToClub", [clubId]);
                    const GAS_MANAGER_POLICY_ID = "479c3127-fb07-4cc6-abce-d73a447d2c01";
                
                    
                    const signer = provider.getSigner();

              console.log("singer",signer);
              const tx = {
                to: marketplaceAddress,
                data: encodedData,
                value: amountAE,

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
                
              } catch (error) {

          toast.error(error);
                console.error('Error sending signed transaction:', error);
              }
            } else {

          toast.error(error);
              console.error('web3 instance is not properly initialized.');
            }
          // var clubId = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
          console.log('Transaction Receipt:', clubId);
          
        } catch(e) {
          console.log(e);
          toast.error(e);
          $('.successContributeClub').css('display','none');
          $('.errorContributeClub').css("display","block");
          $('.errorContributeClub').text(e.toString());
          return;
        }
        
        
      }
    }
    $('.errorContributeClub').css('display','none');
    $('.successContributeClub').css("display","block");
    $('.successContributeClub').text("You have contributed to the club successfully");
  } else {
    $('.successContributeClub').css('display','none');
    $('.errorContributeClub').css("display","block");
    $('.errorContributeClub').text("Password is invalid");
    return;
  }
  

}

async function leaveClub() {
  $('.successJoinLeaveClub').css('display','none');
  $('.errorJoinLeaveClub').css('display','none');
  var clubId = localStorage.getItem("clubId");
  var password = $('#passwordShowPVLeave').val();
  if(password == '') {
    $('.successJoinLeaveClub').css('display','none');
    $('.errorJoinLeaveClub').css("display","block");
    $('.errorJoinLeaveClub').text("Password is invalid");
    return;
  }
  const my_wallet = await web3.eth.accounts.wallet.load(password);
  if(my_wallet !== undefined)
  {
    
    if(clubId != null) {
      $('.successJoinLeaveClub').css("display","block");
      $('.successJoinLeaveClub').text("Leaving the club...");
      await getContract();
      if(contractPublic != undefined) {
        
        const query = contractPublic.methods.leaveClub(clubId);
        const encodedABI = query.encodeABI();

        try{
          const abi = ABI.abi;
            const iface = new ethers.utils.Interface(abi);
            const encodedData = iface.encodeFunctionData("leaveClub", [clubId]);
            const GAS_MANAGER_POLICY_ID = "479c3127-fb07-4cc6-abce-d73a447d2c01";
        
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
          }catch(error){
            console.log(error)
          }

        }
      }
    $('.errorJoinLeaveClub').css('display','none');
    $('.successJoinLeaveClub').css("display","block");
    $('.successJoinLeaveClub').text("You have left the club successfully");
  } else {
    $('.successJoinLeaveClub').css('display','none');
    $('.errorJoinLeaveClub').css("display","block");
    $('.errorJoinLeaveClub').text("Password is invalid");
    return;
  }
}



async function verifyUserInClub() {
  var clubId = localStorage.getItem("clubId");
  var filWalletAddress = localStorage.getItem("filWalletAddress");
  if(clubId != null) {
    await getContract();
    if(contractPublic != undefined) {
      var user = await contractPublic.methods.isMemberOfClub(filWalletAddress,clubId).call();
      if(user) {
        $('.join_club').css('display','none');
        $('.leave_club').css('display','block');
      } else {
        $('.join_club').css('display','block');
        $('.leave_club').css('display','none');
      }
    }
  }
}



function Club() {

  // getdealId();

  
  const [password, setPassword] = useState('');


  async function joinClub() {
    $('.successJoinLeaveClub').css('display','none');
    $('.errorJoinLeaveClub').css('display','none');
    var clubId = localStorage.getItem("clubId");
    var password = $('#passwordShowPVJoin').val();
    if(password == '') {
      $('.successJoinLeaveClub').css('display','none');
      $('.errorJoinLeaveClub').css("display","block");
      $('.errorJoinLeaveClub').text("Password is invalid");
      return;
    }
    const my_wallet = await web3.eth.accounts.wallet.load(password);
    
    if(my_wallet !== undefined)
    {
      if(clubId != null) {
        $('.successJoinLeaveClub').css("display","block");
          $('.successJoinLeaveClub').text("Joining the club...");
        await getContract();
        if(contractPublic != undefined) {
          
          const query = contractPublic.methods.joinClub(clubId);
          const encodedABI = query.encodeABI();
  
  
  
          
            if (web3 && web3.eth) {
              try {
                const abi = ABI.abi;
              const iface = new ethers.utils.Interface(abi);
              const encodedData = iface.encodeFunctionData("joinClub", [clubId]);
              const GAS_MANAGER_POLICY_ID = "479c3127-fb07-4cc6-abce-d73a447d2c01";
          
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
              } catch (error) {
                console.error('Error sending signed transaction:', error);
              }
            } else {
              console.error('web3 instance is not properly initialized.');
            }
  
          }
      }
      $('.errorJoinLeaveClub').css('display','none');
      $('.successJoinLeaveClub').css("display","block");
      $('.successJoinLeaveClub').text("You have joined the club successfully");
    } else {
      $('.successJoinLeaveClub').css('display','none');
      $('.errorJoinLeaveClub').css("display","block");
      $('.errorJoinLeaveClub').text("Password is invalid");
    }
  }
  


    useEffect(() => {
        {
          
          const ans  = localStorage.getItem("clubverification")
          const pod = localStorage.getItem("podsi");
          if(ans == "a"){
            $('.clubveri').css("display","none");
            $('.clwr').text('Verification Completed-'+pod);
          }else{  
            $('.clubveri').css("display","block");
          }
            GetClub();verifyUserInClub();GetProposals();
        }
      }, []);


      const navigate = useNavigate();
  function Logout(){
    web3.eth.accounts.wallet.clear();
    localStorage.clear();
    navigate('/login');
  
  }



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
                <span className="club_name" />
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
                          Club Balance (CFX)
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800 club_balance">
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
              <div className="col-xl-2 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                          Proposals
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800 club_proposals">
                          -
                        </div>
                        <Link  className="btn btn-secondary btn-sm mt-2" to="/createproposal">
                       
                          Create
                          </Link>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-calendar fa-2x text-gray-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                          Members
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800 club_members">
                          -
                        </div>
                        {/* <a href="members.html" class="btn btn-primary btn-sm mt-2">View</a> */}
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-calendar fa-2x text-gray-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="col-xl-2 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                         VERIFY YOUR DOCUMENTS (PODSI)
                        </div>
                       

                        <div className="h5 mb-0  font-weight-bold text-gray-800 ">
                          
                        <input
                        type="password"
                        id="verifdocs"
                        className="form-control form-control-user"
                        placeholder="Password"
                      />{" "}
                        <div  className="btn btn-secondary btn-sm mt-2" onClick={verify}>
                       
                          DOCS VERIFICATION
                          </div>
                          </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div> */}
              {/* <div className="col-xl-2 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                         VERIFY YOUR DOCUMENTS (PODSI)
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800 ">
                          
                        </div>
                        <div onClick={getdealId}>
                        
                        <div id="dealStatusLink" className="btn btn-secondary btn-sm mt-2">
    DAO DEAL STATUS
  </div>
  
                    
                          </div>
                          
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-calendar fa-2x text-gray-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
            {/* Content Row */}
            <div className="row">
              {/* Area Chart */}
              <div className="col-xl-8 col-lg-7">
                <div className="card shadow mb-4">
                  {/* Card Header - Dropdown */}
                  <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Proposals
                    </h6>
                  </div>
                  {/* Card Body */}
                  <div className="card-body">
                    <div className="row available_proposals">
                      <span className="loading_message">Loading...</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Pie Chart */}
              <div className="col-xl-4 col-lg-5">
                <div
                  className="card shadow mb-4 join_club"  style={{display: "none"}}
                  
                >
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Join the club
                    </h6>
                  </div>
                  <div className="card-body">
                    <p>
                      
                      <div id="btnJoinClub" onClick={() => {
                        joinClub();
                      }} className="btn btn-success">
                        Confirm
                      </div>{" "}
                      <br />
                    </p>
                    <div
                      className="successJoinLeaveClub valid-feedback"
                      style={{ display: "none" }}
                    />
                    <div
                      className="errorJoinLeaveClub invalid-feedback"
                      style={{ display: "none" }}
                    />
                    <p />
                  </div>
                </div>
                <div
                  className="card shadow mb-4 leave_club"
                  style={{ display: "none" }}
                >
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Contribute to the club
                    </h6>
                  </div>
                  <div className="card-body">
                    <p>
                      Amount of CFX: <br />
                      <input
                        type="number"
                        id="aeAmount"
                        className="form-control"
                      />{" "}
                      <br />
                      
                      <a
                        href="#"
                        id="btnContributeClub"
                        onClick={() => {
                          contributeClub();
                        }}
                        className="btn btn-success"
                      >
                        Confirm
                      </a>{" "}
                      <br />
                    </p>
                    <div
                      className="successContributeClub valid-feedback"
                      style={{ display: "none" }}
                    />
                    <div
                      className="errorContributeClub invalid-feedback"
                      style={{ display: "none" }}
                    />
                    <p />
                  </div>
                </div>
                <div
                  className="card shadow mb-4 leave_club"
                  style={{ display: "none" }}
                >
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Leave the club
                    </h6>
                  </div>
                  <div className="card-body">
                    <p>
                     
                      <div  id="btnLeaveClub"  onClick={() => {
                        leaveClub();
                      }} className="btn btn-success">
                        Confirm
                      </div >{" "}
                      <br />
                    </p>
                    <div
                      className="successJoinLeaveClub valid-feedback"
                      style={{ display: "none" }}
                    />
                    <div
                      className="errorJoinLeaveClub invalid-feedback"
                      style={{ display: "none" }}
                    />
                    <p />
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

export default Club