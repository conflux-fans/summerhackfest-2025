
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import $ from 'jquery'; 

import { marketplaceAddress } from "./config";
import {Web3} from 'web3';

import ABI from "./SmartContract/artifacts/contracts/InvestmentClub.sol/InvestmentClub.json"


const web3 = new Web3(new Web3.providers.HttpProvider("https://evmtestnet.confluxrpc.com"));
var contractPublic = null;

var pieceCID = null;
var carsize = null;

async function getContract(userAddress) {
    contractPublic = await new web3.eth.Contract(ABI.abi,marketplaceAddress);
    console.log(contractPublic)
    if(userAddress != null && userAddress != undefined) {
      contractPublic.defaultAccount = userAddress;
    }
  }





async function getProposalById(){


var clubId = localStorage.getItem("clubId");
    var proposalId = localStorage.getItem("proposalId");

  var filWalletAddress = localStorage.getItem("filWalletAddress");
  await getContract(filWalletAddress);
  if(contractPublic != undefined) {
    var aeWalletAddress = localStorage.getItem("filWalletAddress");
    
    var clubs = await contractPublic.methods.getProposalById(clubId, proposalId).call();
    console.log(clubs)
    if(clubs != undefined) {

      // console.log(clubs.Cid,clubs.PieceCid,clubs.carsize,clubs.posdiverification,clubs.storageProvider,clubs.DealId)

      localStorage.setItem("AddressbyId",clubs.destination);

      $('.proposal_description').text(clubs.description);
      $('#proposal_creator').text(clubs.creator);
      $('#proposal_destination').text(clubs.destination);
      // web3.utils.toWei(proposal_amount.toString(), 'ether');
      $('#proposal_amount').text(web3.utils.fromWei(clubs.amount.toString(), 'ether'));
      $('#proposal_status').text(clubs.status);
      $('#votes_for').text(clubs.votesFor);
      $('#votes_against').text(clubs.votesAgainst);
      $('#CID').text(clubs.Cid);
   
      var comp = clubs.creator.toLowerCase()
      if(clubs.status == 'Pending' && comp == filWalletAddress) {

        $('.creator_options').css('display','block');
      }
      if(clubs.status != 'Pending') {
        $('.votes_available').css('display','none');
      }

      $('#proposalExpireAt').text(new Date(Number(clubs.proposalExpireAt) * 1000).toLocaleString());
      $('#proposedAt').text(new Date(Number(clubs.proposedAt) * 1000).toLocaleString());

      var list = document.querySelector('.my_votes');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'Voter';
        theadTr.appendChild(balanceHeader);
        var usdHeader2 = document.createElement('th');
        usdHeader2.innerHTML = 'Option';
        theadTr.appendChild(usdHeader2);

        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);

        // clubs.voted.forEach((valor, clave) => {
        //   var tbodyTr = document.createElement('tr');
        //   var contractTickerTd = document.createElement('td');
        //   contractTickerTd.innerHTML = '<b>' + clave + '</b>';
        //   tbodyTr.appendChild(contractTickerTd);
        //   var balanceUSDTd2 = document.createElement('td');
        //   balanceUSDTd2.innerHTML = '<b>' + valor+ '</b>';
        //   tbodyTr.appendChild(balanceUSDTd2);
        //   tbody.appendChild(tbodyTr);
        // });
  
        // table.appendChild(tbody);
  
        //   list.appendChild(table);

    }
    $('.loading_message').css('display','none');
  }
}
export default getProposalById; 