
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { marketplaceAddress } from './config';
import {Web3} from 'web3';
import $ from 'jquery'; 
import ABI from "./SmartContract/artifacts/contracts/InvestmentClub.sol/InvestmentClub.json"


const web3 = new Web3(new Web3.providers.HttpProvider("https://evmtestnet.confluxrpc.com"));
var contractPublic = null;

async function getContract(userAddress) {
    contractPublic = await new web3.eth.Contract(ABI.abi,marketplaceAddress);
    console.log(contractPublic)
    if(userAddress != null && userAddress != undefined) {
      contractPublic.defaultAccount = userAddress;
    }
  }

window.changeProposal=(proposalId)=> {
    localStorage.setItem("proposalId",proposalId);
    console.log(localStorage.getItem("proposalId"))
    window.location.href = "proposal";
  }


  async function GetProposals() {
    function changeProposal(proposalId){
      localStorage.setItem("proposalId",proposalId);
      console.log(localStorage.getItem("proposalId"))
      window.location.href = "proposal";
    }
    var walletAddress = localStorage.getItem("filWalletAddress");
    await getContract(walletAddress);
    if(contractPublic != undefined) {
      var clubId = localStorage.getItem("clubId");
      var clubs = await contractPublic.methods.getProposalsByClub(clubId).call();
      if(clubs.length > 0) {
  
        var list = document.querySelector('.available_proposals');
          var table = document.createElement('table');
          var thead = document.createElement('thead');
          var tbody = document.createElement('tbody');
  
          var theadTr = document.createElement('tr');
          var balanceHeader = document.createElement('th');
          balanceHeader.innerHTML = 'ID';
          theadTr.appendChild(balanceHeader);
          var contractNameHeader = document.createElement('th');
          contractNameHeader.innerHTML = 'Description';
          theadTr.appendChild(contractNameHeader);
          var contractTickerHeader = document.createElement('th');
          contractTickerHeader.innerHTML = 'Amount ( CFX )';
          theadTr.appendChild(contractTickerHeader);
          
  
          var usdHeader2 = document.createElement('th');
          usdHeader2.innerHTML = 'Proposal Status';
          theadTr.appendChild(usdHeader2);

          
  
          thead.appendChild(theadTr)
  
          table.className = 'table';
          table.appendChild(thead);
  
        clubs.forEach((valor, clave) => {
          var tbodyTr = document.createElement('tr');
          var contractTd = document.createElement('td');
          var clubLink = document.createElement('a');
          clubLink.className = 'btn btn-success';
          clubLink.textContent = valor.id;
          clubLink.addEventListener('click', function() {
            changeProposal(valor.id);
          });

          contractTd.innerHTML = "<a class='btn btn-success' onclick='changeProposal(" + valor.id + ")'>"+valor.id+"</a>";
          tbodyTr.appendChild(clubLink);
          var contractTickerTd = document.createElement('td');
          contractTickerTd.innerHTML = '<b>' + valor.description + '</b>';
          tbodyTr.appendChild(contractTickerTd);
          var balanceTd = document.createElement('td');
          // web3.utils.toWei(proposal_amount.toString(), 'ether');
          balanceTd.innerHTML = '<b>' + web3.utils.fromWei(valor.amount.toString(),'ether')  + '</b>';
          tbodyTr.appendChild(balanceTd);
          var balanceUSDTd2 = document.createElement('td');
          balanceUSDTd2.innerHTML = '<b>' + valor.status+ '</b>';
          tbodyTr.appendChild(balanceUSDTd2);
         
          tbody.appendChild(tbodyTr);
        });
  
        table.appendChild(tbody);
  
          list.appendChild(table);
      }
      $('.loading_message').css('display','none');
    }
  }

export default GetProposals;
