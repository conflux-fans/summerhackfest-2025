import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Tg from "../components/toggle";
import $ from 'jquery'; 
import { marketplaceAddress } from "../config";
import {Web3} from 'web3';
import ABI from "../SmartContract/artifacts/contracts/InvestmentClub.sol/InvestmentClub.json"
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { notification } from 'antd';
import GetClub from "../getclub";
const web3 = new Web3(new Web3.providers.HttpProvider("https://evmtestnet.confluxrpc.com"));
var contractPublic = null;
var cid = null;
const ethers = require("ethers")


const provider = new ethers.providers.Web3Provider(window.ethereum);
async function getContract(userAddress) {
  contractPublic =  new web3.eth.Contract(ABI.abi,marketplaceAddress);
  console.log(contractPublic)
  if(userAddress != null && userAddress != undefined) {
    contractPublic.defaultAccount = userAddress;
  }
}


function CreateProposal() {


  const [Password, setPassword] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');

  
  async function createProposal() {
    
    var walletAddress = localStorage.getItem("filWalletAddress");
    // alert(walletAddress) /// /////
    await getContract(walletAddress);
    if(contractPublic != null) {
      var proposal_description = $('#proposal_description').val();
      var proposal_address = $('#proposal_address').val();
      var proposal_amount = $('#proposal_amount').val();
      var password = $('#trx_password').val();
      if(proposal_description == '') {
        $('#errorCreateProposal').css("display","block");
        $('#errorCreateProposal').text("Description is required");
        return;
      }
      if(proposal_address == '') {
        $('#errorCreateProposal').css("display","block");
        $('#errorCreateProposal').text("Destination address is required");
        return;
      }
      if(proposal_amount == '' || proposal_amount <=0) {
        $('#errorCreateProposal').css("display","block");
        $('#errorCreateProposal').text("Amount is required");
        return;
      }
      if(password == '') {
        $('#errorCreateProposal').css("display","block");
        $('#errorCreateProposal').text("Password is invalid");
        return;
      }
      var clubId = localStorage.getItem("clubId");
      const my_wallet = await web3.eth.accounts.wallet.load(password);
      toast.info('Prposal Creation intiated ...', {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
      if(my_wallet !== undefined)
      {
        $('.loading_message_creating').css("display","block");
        proposal_amount = web3.utils.toWei(proposal_amount.toString(), 'ether');

        toast.success("Generating random CID for proposal")

        // Generate a random CID-like string
        const generateRandomCID = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let result = 'Qm';
          for (let i = 0; i < 44; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };

        const cid11 = generateRandomCID();
        console.log("The generated CID is ", cid11);
        var proposalId = localStorage.getItem("proposalId");
        localStorage.setItem(proposalId-100, cid11);

        cid = cid11;
        
        

        const query = contractPublic.methods.createProposal(clubId,proposal_amount, proposal_address, proposal_description,cid);
        const encodedABI = query.encodeABI();
        // const account1s = web3.eth.accounts;
            //  alert("Yes");
            // console.log(account1s)
            // const transactionObject = {
            //   from: my_wallet[0].address,
            //   gasPrice: '20000000000',
            //   gas: '2000000',
            //   to: this.contractPublic.options.address,
            //   data: encodedABI,
            //   // value: amountAE
            // };
            // var signedTx;
            // try {
            //    signedTx = await this.web3.eth.accounts.signTransaction(
            //     transactionObject,
            //     my_wallet[0].privateKey
            //   );
            //   console.log(signedTx);
            // } catch (error) {
            //   console.error(error);
            // }
            if (web3 && web3.eth) {
              try {
                const abi = ABI.abi;
                const iface = new ethers.utils.Interface(abi);
                const encodedData = iface.encodeFunctionData("createProposal", [clubId,proposal_amount, proposal_address, proposal_description,cid]);
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
                toast.error(error)
                $('#errorCreateProposal').css("display","block");
                $('#errorCreateProposal').text(error);
                return;
            
              }
            } else {
              console.error('web3 instance is not properly initialized.');
            }
  
  
  
  
  
        
        // const signedTx = await this.account1s.signTransaction(
        //   {
        //     from: my_wallet[0].address,
        //   gasPrice: "20000000000",
        //   gas: "2000000",
        //   to: this.contractPublic.options.address,
        //   data: encodedABI,
        //     // value: amountAE
        //   },
        //   my_wallet[0].privateKey,
        //   false
        // );
        // // var clubId = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        // if (web3 && web3.eth) {
        //   try {
        //     const clubId = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        //     console.log('Transaction Receipt:', clubId);
        //   } catch (error) {
        //     console.error('Error sending signed transaction:', error);
        //   }
        // } else {
        //   console.error('web3 instance is not properly initialized.');
        // }
        $('#proposal_description').val('');
        $('#proposal_address').val('');
        $('#proposal_amount').val('');

        $('#trx_password').val('');
        $('#errorCreateProposal').css("display","none");
        $('.loading_message_creating').css("display","none");
        $('#successCreateProposal').css("display","block");
        toast.success('Prposal Creation Sucessfull ...', {
          position: "top-right",
          autoClose: 15000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          });
        $('#successCreateProposal').text("Proposal created successfully with description: " + proposal_description);
      } else {
        $('.valid-feedback').css('display','none');
        $('.loading_message_creating').css("display","none");
          $('.invalid-feedback').css('display','block');
          toast.error('The password is invalid')
          $('.invalid-feedback').text('The password is invalid');
      }
      
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
    
        GetClub(); 
    }
  }, []);

  return (
    <div id="page-top">
  {/* Page Wrapper */}
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
        <a className="nav-link" href="/">
          <i className="fas fa-fw fa-tachometer-alt" />
          <span>Dashboard</span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="/joinclub">
          <i className="fas fa-fw fa-file-image-o" />
          <span>Available clubs</span>
        </a>
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
            <h1 className="h3 mb-0 text-gray-800">Create a new proposal</h1>
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
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-secondary text-uppercase mb-1">
                        Dashboard
                      </div>
                      <a className="btn btn-primary" href="/">
                        Go to Dashboard
                      </a>
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
                        Proposals{" "}
                      </div>
                      <Link  className="btn btn-secondary" to="/club">
                      
                        See all proposals
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
                    Create your own proposal
                  </h6>
                </div>
                {/* Card Body */}
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                    Title:{" "}
                      <input
                        type="text"
                        id="proposal_description"
                        className="form-control form-control-user"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Give a description for this proposal"
                      />{" "}
                      <br />
                      Description:{" "}
                      <input
                        type="text"
                        id="proposal_description"
                        className="form-control form-control-user"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Give a description for this proposal"
                      />{" "}
                      <br />
                      Destination address:{" "}
                      <input
                        type="text"
                        id="proposal_address"
                        className="form-control form-control-user"
                        value={destination}
onChange={(e) => setDestination(e.target.value)}
                        placeholder="Enter the sepolia destination address: 0x....."
                      />{" "}
                      <br />
                      Amount (in CFX):{" "}
                      <input
                        type="number"
                        id="proposal_amount"
                        className="form-control form-control-user"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter the amount"
                      />{" "}
                      
                      <br />
                      <br />
                      <input
                        type="button"
                        id="createProposalButton"
                        defaultValue="Create Proposal"
                        onClick={() => {
                          createProposal();
                        }}
                        className="btn btn-primary btn-block"
                      />
                      <span
                        className="loading_message_creating"
                        style={{ display: "none" }}
                      >
                        Creating the proposal...
                      </span>{" "}
                      <br />

                      
                      <p
                        className="valid-feedback"
                        id="successCreateProposal"
                        style={{ display: "none" }}
                      />
                      <p
                        className="invalid-feedback"
                        id="errorCreateProposal"
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

export default CreateProposal