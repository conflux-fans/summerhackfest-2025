import React from 'react'
import { marketplaceAddress } from './config';
import {Web3} from 'web3';
import $ from 'jquery'; 
import ABI from "./SmartContract/artifacts/contracts/InvestmentClub.sol/InvestmentClub.json"

const web3 = new Web3(new Web3.providers.HttpProvider("https://evmtestnet.confluxrpc.com"));
var contractPublic = null;

async function getContract(userAddress) {
    contractPublic =  new web3.eth.Contract(ABI.abi,marketplaceAddress);
    console.log(contractPublic)
    if(userAddress != null && userAddress != undefined) {
      contractPublic.defaultAccount = userAddress;
    }
  }


async function GetClub() {



    var clubId = localStorage.getItem("clubId");
    // alert(clubId)
    var walletAddress = localStorage.getItem("filWalletAddress");
    await getContract(walletAddress);
    try {
      // alert(clubId)
      var club = await contractPublic.methods.getClubById(clubId).call();
      if (club != null) {
        // Update UI elements
        // alert(club.name)
        $('.club_name').text(club.name);
        $('#club_id').text(club.id);
        $('.club_members').text(club.memberCount);
        $('.club_proposals').text(club.proposalCount);
        // alert(club.pool)
        const poolBalanceWei = club.pool;
        const poolBalanceEther = web3.utils.fromWei(poolBalanceWei.toString(), 'ether');
    $('.club_balance').text(poolBalanceEther);
        // $('.club_balance').text(web3.utils.fromWei(club.pool));
      }
    } catch (error) {
      // alert(error)
      console.error("Error fetching club data:", error);
    }
  
  
    // if(clubId != null) {
    //   await getContract();
      
    //   if(contractPublic != undefined) {
    //     var club = await contractPublic.methods.getClubById(clubId).call();
    //     alert(club)
    //     alert(club.name)
    //     if(club != null) {
    //       $('.club_name').text(club.name);
    //       $('#club_id').text(club.id);
    //       $('.club_members').text(club.memberCount);
    //       $('.club_proposals').text(club.proposalCount);
    //       $('.club_balance').text(web3.utils.fromWei(club.pool));
    //     }
    //   }
    // }
  }
  


export default GetClub