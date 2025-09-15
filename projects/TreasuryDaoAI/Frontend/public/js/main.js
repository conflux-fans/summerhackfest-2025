// const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://celo-alfajores.infura.io/v3/b208399f926f487093f45debc86299bb"));



var contractPublic = null;


async function getContract(userAddress) {
  contractPublic = await new web3.eth.Contract(contractABI,investmentContractAddress);
  console.log(contractPublic)
  if(userAddress != null && userAddress != undefined) {
    contractPublic.defaultAccount = userAddress;
  }
}

async function getClubs() {
  await getContract();
  if(contractPublic != undefined) {
    var clubs = await contractPublic.methods.listClubs().call()
    if(clubs.length > 0) {

      var list = document.querySelector('.available_clubs');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'ID';
        theadTr.appendChild(balanceHeader);
        var contractNameHeader = document.createElement('th');
        contractNameHeader.innerHTML = 'Name';
        theadTr.appendChild(contractNameHeader);
        var contractTickerHeader = document.createElement('th');
        contractTickerHeader.innerHTML = 'Members';
        theadTr.appendChild(contractTickerHeader);
        
        var usdHeader = document.createElement('th');
        usdHeader.innerHTML = 'Proposals';
        theadTr.appendChild(usdHeader);

        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);

      clubs.forEach((valor, clave) => {
        var tbodyTr = document.createElement('tr');
        var contractTd = document.createElement('td');
        contractTd.innerHTML = "<a class='btn btn-success' onclick='changeClub(" + valor.clubId + ")''>"+valor.clubId+"</a>";
        tbodyTr.appendChild(contractTd);
        var contractTickerTd = document.createElement('td');
        contractTickerTd.innerHTML = '<b>' + valor.name + '</b>';
        tbodyTr.appendChild(contractTickerTd);
        var balanceTd = document.createElement('td');
        balanceTd.innerHTML = '<b>' + valor.memberCount + '</b>';
        tbodyTr.appendChild(balanceTd);
        var balanceUSDTd = document.createElement('td');
        balanceUSDTd.innerHTML = '<b>' + valor.proposalCount+ '</b>';
        tbodyTr.appendChild(balanceUSDTd);
        tbody.appendChild(tbodyTr);
      });

      table.appendChild(tbody);

        list.appendChild(table);
    }
    $('.loading_message').css('display','none');
  }
}

async function runProposal() {
  await getContract();
  if(contractPublic != undefined) {
    var option_execution = $('#option_execution').val()
    var password = $('#passwordShowPVExecution').val();
    if(option_execution == '') {
      $('.errorExecution').css("display","block");
      $('.errorExecution').text("Option is required");
      return;
    }
    if(password == '') {
      $('.errorExecution').css("display","block");
      $('.errorExecution').text("Password is invalid");
      return;
    }
    var clubId = localStorage.getItem("clubId");
    var proposalId = localStorage.getItem("proposalId");
    try {
      const my_wallet = await web3.eth.accounts.wallet.load(password);
      // console.log( my_wallet.address)
    if(my_wallet !== undefined)
    {
      $('.errorExecution').css("display","none");
      $('.successExecution').css("display","block");
      $('.successExecution').text("Running...");
        try {
          if(option_execution == 'execute') {
            const query = contractPublic.methods.executeProposal(clubId,proposalId);
            const encodedABI = query.encodeABI();
            
            const signedTx = await this.web3.eth.accounts.signTransaction(
              {
                from: my_wallet[0].address,
        gasPrice: "20000000000",
        gas: "2000000",
        to: this.contractPublic.options.address,
        data: encodedABI,
                //value: amountAE 
              },
              my_wallet[0].privateKey,
              false
            );
            var clubId = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
          } else {
            if(option_execution == 'close') {
              const query = contractPublic.methods.closeProposal(clubId,proposalId);
              const encodedABI = query.encodeABI();
              
              const signedTx = await this.web3.eth.accounts.signTransaction(
                {
                  from: my_wallet[0].address,
                  gasPrice: "20000000000",
                  gas: "2000000",
                  to: this.contractPublic.options.address,
                  data: encodedABI,
                  //value: amountAE
                },
                my_wallet[0].privateKey,
                false
              );
              var clubId = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            }
          }
          
        } catch (error) {
          $('.successExecution').css("display","none");
          $('.errorExecution').css("display","block");
          $('.errorExecution').text("Error executing/closing the proposal");
          return;
        }
        
        $('#option_execution').val('');
        $('#passwordShowPVExecution').val('');
        $('.errorExecution').css("display","none");
        $('.successExecution').css("display","block");
        $('.successExecution').text("The execution was successful ");
        location.reload();
      } else {
        $('.valid-feedback').css('display','none');
          $('.invalid-feedback').css('display','block');
          $('.invalid-feedback').text('The password is invalid');
      }
    }
    catch {
      $('.valid-feedback').css('display','none');
          $('.invalid-feedback').css('display','block');
          $('.invalid-feedback').text('The password is invalid');
    }
    
    
  }
}

async function getProposalById(){
  await getContract();
  if(contractPublic != undefined) {
    var aeWalletAddress = localStorage.getItem("filWalletAddress");
    var clubId = localStorage.getItem("clubId");
    var proposalId = localStorage.getItem("proposalId");
    var clubs = await contractPublic.methods.getProposalById(clubId, proposalId).call();
    if(clubs != undefined) {

      $('.proposal_description').text(clubs.description);
      $('#proposal_creator').text(clubs.creator);
      $('#proposal_destination').text(clubs.destination);
      // web3.utils.toWei(proposal_amount.toString(), 'ether');
      $('#proposal_amount').text(web3.utils.fromWei(clubs.amount.toString(), 'ether'));
      $('#proposal_status').text(clubs.status);
      $('#votes_for').text(clubs.votesFor);
      $('#votes_against').text(clubs.votesAgainst);
      
      if(clubs.status == 'Pending' && clubs.creator == aeWalletAddress) {
        $('.creator_options').css('display','block');
      }
      if(clubs.status != 'Pending') {
        $('.votes_available').css('display','none');
      }


    }
    $('.loading_message').css('display','none');
  }
}

async function voteOnProposal() {
  await getContract();
  if(contractPublic != undefined) {
    var option_vote = $('#option_vote').val()
    var password = $('#passwordShowPVVote').val();
    if(option_vote == '') {
      $('#errorCreateProposal').css("display","block");
      $('#errorCreateProposal').text("Vote is required");
      return;
    }
    if(password == '') {
      $('#errorCreateProposal').css("display","block");
      $('#errorCreateProposal').text("Password is invalid");
      return;
    }
    var clubId = localStorage.getItem("clubId");
    var proposalId = localStorage.getItem("proposalId");
    const my_wallet = await web3.eth.accounts.wallet.load(password);
    if(my_wallet !== undefined)
    {
      $('.successVote').css("display","block");
      $('.successVote').text("Voting...");
      var optionBool = option_vote == '1' ? true : false;
      try {
        const query = contractPublic.methods.voteOnProposal(clubId,proposalId, optionBool);
        const encodedABI = query.encodeABI();


        const nonce = await web3.eth.getTransactionCount(my_wallet[0].address);
        if (web3 && web3.eth) {
          try {
            const signedTx = await web3.eth.accounts.signTransaction({
              from: my_wallet[0].address,
      gasPrice: "20000000000",
      gas: "2000000",
      to: this.contractPublic.options.address,
      data: encodedABI,
      nonce: nonce,
        // value: amountAE
      },
      my_wallet[0].privateKey,
      false
    );
    //
        
            const clubId = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log('Transaction ReccreateProposaleipt:', clubId);
          } catch (error) {
            console.error('Error sending signed transaction:', error);
          }
        } else {
          console.error('web3 instance is not properly initialized.');
        }
        
      //   const signedTx = await this.web3.eth.accounts.signTransaction(
      //     {
      //       from: my_wallet[0].address,
      //   gasPrice: "20000000000",
      //   gas: "2000000",
      //   to: this.contractPublic.options.address,
      //   data: encodedABI,
      //       //value: amountAE
      //     },
      //     my_wallet[0].privateKey,
      //     false
      //   );
      //   var clubId = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      } catch (error) {
        console.log(error)
        $('.successVote').css("display","none");
        $('.errorVote').css("display","block");
        $('.errorVote').text("You already voted on this proposal");
        return;
      }
      
      $('#option_vote').val('');
      $('#passwordShowPVVote').val('');
      $('#errorVote').css("display","none");
      $('#successVote').css("display","block");
      $('#successVote').text("Your vote was successful ");
      location.reload();
    } else {
      $('.valid-feedback').css('display','none');
        $('.invalid-feedback').css('display','block');
        $('.invalid-feedback').text('The password is invalid');
    }
    
  }
}

async function getProposals() {
  await getContract();
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
        contractTickerHeader.innerHTML = 'Amount (CELO)';
        theadTr.appendChild(contractTickerHeader);
        

        var usdHeader2 = document.createElement('th');
        usdHeader2.innerHTML = 'Status';
        theadTr.appendChild(usdHeader2);

        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);

      clubs.forEach((valor, clave) => {
        var tbodyTr = document.createElement('tr');
        var contractTd = document.createElement('td');
        contractTd.innerHTML = "<a class='btn btn-success' onclick='changeProposal(" + valor.id + ")'>"+valor.id+"</a>";
        tbodyTr.appendChild(contractTd);
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

async function getMembers() {

  await getContract();
  if(contractPublic != undefined) {
    var clubId = localStorage.getItem("clubId");
    var club = await contractPublic.methods.getClubById(clubId).call();
    if(club != null && club.memberCount > 0) {

      var list = document.querySelector('.available_members');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'Account';
        theadTr.appendChild(balanceHeader);

        var balanceHeader2 = document.createElement('th');
        balanceHeader2.innerHTML = 'Contributed Amount (in CELO)';
        theadTr.appendChild(balanceHeader2);
        
        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);

      club.decodedResult.members.forEach((valor, clave) => {
        var tbodyTr = document.createElement('tr');
        var contractTickerTd = document.createElement('td');
        contractTickerTd.innerHTML = '<b>' + clave + '</b>';
        tbodyTr.appendChild(contractTickerTd);
        var contractTickerTd2 = document.createElement('td');
        contractTickerTd2.innerHTML = '<b>' + Aeternity.toAe(valor.balance) + '</b>';
        tbodyTr.appendChild(contractTickerTd2);
        tbody.appendChild(tbodyTr);
      });

      table.appendChild(tbody);

        list.appendChild(table);
    }
    $('.loading_message').css('display','none');
  }
}

function changeClub(clubId) {
  localStorage.setItem("clubId",clubId);
  window.location.href = "club.html";
}

function changeProposal(proposalId) {
  localStorage.setItem("proposalId",proposalId);
  window.location.href = "proposal.html";
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

async function createProposal() {
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
    if(proposal_amount == '') {
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
    if(my_wallet !== undefined)
    {
      $('.loading_message_creating').css("display","block");
      proposal_amount = web3.utils.toWei(proposal_amount.toString(), 'ether');
      const query = contractPublic.methods.createProposal(clubId,proposal_amount, proposal_address, proposal_description);
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
          const nonce = await web3.eth.getTransactionCount(my_wallet[0].address);
          if (web3 && web3.eth) {
            try {
              const signedTx = await web3.eth.accounts.signTransaction({
                from: my_wallet[0].address,
        gasPrice: "20000000000",
        gas: "2000000",
        to: this.contractPublic.options.address,
        data: encodedABI,
        nonce: nonce,
          // value: amountAE
        },
        my_wallet[0].privateKey,
        false
      );
      //
          
              const clubId = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
              console.log('Transaction ReccreateProposaleipt:', clubId);
            } catch (error) {
              console.error('Error sending signed transaction:', error);
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
      $('#successCreateProposal').text("Proposal created successfully with description: " + proposal_description);
    } else {
      $('.valid-feedback').css('display','none');
      $('.loading_message_creating').css("display","none");
        $('.invalid-feedback').css('display','block');
        $('.invalid-feedback').text('The password is invalid');
    }
    
  }
}


async function createClub() {
  var walletAddress = localStorage.getItem("filWalletAddress");
  // alert(walletAddress)
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
      // alert("my_wallet is doing great")
      // alert(await web3.eth.gasPrice)
    try
    {
      
      $('.loading_message_creating').css("display","block");
      const query = contractPublic.methods.createClub(clubName);
      const encodedABI = query.encodeABI();
      // alert(this.contractPublic.options.address)
     
      const signedTx = await web3.eth.accounts.signTransaction(
      {
        
        from: my_wallet[0].address,
        gasPrice: "20000000000",
        gas: "2000000",
        to: this.contractPublic.options.address,
        data: encodedABI,
       
      },
      my_wallet[0]["privateKey"],
      false,
    );
      var clubId = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      $('#club_name').val('');
      $('#errorCreateClub').css("display","none");
      $('.loading_message_creating').css("display","none");
      $('#successCreateClub').css("display","block");
      $('#successCreateClub').text("Club created successfully with the name: " + clubName);
    } catch(e) {
      // alert("error")
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



async function getClub() {



  var clubId = localStorage.getItem("clubId");
  // alert(clubId)

  await getContract();
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



        const nonce = await web3.eth.getTransactionCount(my_wallet[0].address);
          if (web3 && web3.eth) {
            try {
              const signedTx = await web3.eth.accounts.signTransaction({
                from: my_wallet[0].address,
        gasPrice: "20000000000",
        gas: "2000000",
        to: this.contractPublic.options.address,
        data: encodedABI,
        nonce: nonce,
          // value: amountAE
        },
        my_wallet[0].privateKey,
        false
      );
      //
          
              const clubId = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
              console.log('Transaction ReccreateProposaleipt:', clubId);
            } catch (error) {
              console.error('Error sending signed transaction:', error);
            }
          } else {
            console.error('web3 instance is not properly initialized.');
          }

          



        // const signedTx = await this.web3.eth.accounts.signTransaction(
        //   {
        //     from: my_wallet[0].address,
        //     gasPrice: "20000000000",
        //     gas: "2000000",
        //     to: this.contractPublic.options.address,
        //     data: encodedABI,
        //   },
        //   my_wallet[0].privateKey,
        //   false
        // );
        // var clubId = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        }
    }
    $('.errorJoinLeaveClub').css('display','none');
    $('.successJoinLeaveClub').css("display","block");
    $('.successJoinLeaveClub').text("You have joined the club successfully");
    location.reload();
  } else {
    alert(my_wallet)
    $('.successJoinLeaveClub').css('display','none');
    $('.errorJoinLeaveClub').css("display","block");
    $('.errorJoinLeaveClub').text("Password is invalid");
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
        const signedTx = await this.web3.eth.accounts.signTransaction(
          {
            from: my_wallet[0].address,
        gasPrice: "20000000000",
        gas: "2000000",
        to: this.contractPublic.options.address,
        data: encodedABI,
          },
          my_wallet[0].privateKey,
          false
        );
        var clubId = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        }
      }
    $('.errorJoinLeaveClub').css('display','none');
    $('.successJoinLeaveClub').css("display","block");
    $('.successJoinLeaveClub').text("You have left the club successfully");
    location.reload();
  } else {
    $('.successJoinLeaveClub').css('display','none');
    $('.errorJoinLeaveClub').css("display","block");
    $('.errorJoinLeaveClub').text("Password is invalid");
  }
}

async function contributeClub() {
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
          //  alert("Yes");
          // console.log(accounts1)

          const signedTx = await web3.eth.accounts.signTransaction(
            {
              from: my_wallet[0].address,
              gasPrice: "20000000000",
              gas: "2000000",
              to: this.contractPublic.options.address,
              data: encodedABI,
                value: amountAE
              },
              my_wallet[0].privateKey,
              false
            );
            if (web3 && web3.eth) {
              try {
                const clubId = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                // console.log('Transaction Receipt:', clubId);
              } catch (error) {
                console.error('Error sending signed transaction:', error);
              }
            } else {
              console.error('web3 instance is not properly initialized.');
            }
          // var clubId = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
          console.log('Transaction Receipt:', clubId);
          alert("No")
        } catch(e) {
          console.log(e);
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
    location.reload();
  } else {
    $('.successContributeClub').css('display','none');
    $('.errorContributeClub').css("display","block");
    $('.errorContributeClub').text("Password is invalid");
  }
}

async function getMyClubs() {
  var walletAddress = localStorage.getItem("filWalletAddress");
  await getContract(walletAddress);
  if(contractPublic != undefined) {
    var clubs = await contractPublic.methods.getMyClubs().call()
    if(clubs.length > 0) {

      var list = document.querySelector('.my_clubs');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'ID';
        theadTr.appendChild(balanceHeader);
        var contractNameHeader = document.createElement('th');
        contractNameHeader.innerHTML = 'Name';
        theadTr.appendChild(contractNameHeader);
        var contractTickerHeader = document.createElement('th');
        contractTickerHeader.innerHTML = 'Members';
        theadTr.appendChild(contractTickerHeader);
        
        var usdHeader = document.createElement('th');
        usdHeader.innerHTML = 'Proposals';
        theadTr.appendChild(usdHeader);

        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);

        clubs.forEach((valor) => {
          if(valor.clubId != 0) {
            var tbodyTr = document.createElement('tr');
        var contractTd = document.createElement('td');
        contractTd.innerHTML = "<a class='btn btn-success' onclick='changeClub(" + valor.clubId + ")''>"+valor.clubId+"</a>";
        tbodyTr.appendChild(contractTd);
        var contractTickerTd = document.createElement('td');
        contractTickerTd.innerHTML = '<b>' + valor.name + '</b>';
        tbodyTr.appendChild(contractTickerTd);
        var balanceTd = document.createElement('td');
        balanceTd.innerHTML = '<b>' + valor.memberCount + '</b>';
        tbodyTr.appendChild(balanceTd);
        var balanceUSDTd = document.createElement('td');
        balanceUSDTd.innerHTML = '<b>' + valor.proposalCount+ '</b>';
        tbodyTr.appendChild(balanceUSDTd);
        tbody.appendChild(tbodyTr);
          }
        
      });

      table.appendChild(tbody);

        list.appendChild(table);
    }
    $('.loading_message').css('display','none');
  }
}

function saveAddressInStorage(address, secret, oldaddress, seed) {
  var addresses = JSON.parse(localStorage.getItem("addresses"));
  if(addresses != null) {
    addresses.push({address:address, key: secret, oldaddress:oldaddress, seed:seed});
    
  }
  else {
    addresses = []
    addresses.push({address:address, key: secret, oldaddress:oldaddress, seed:seed});
  }
  localStorage.setItem("addresses", JSON.stringify(addresses));
}



function getFirstAddress() {
  var addresses = JSON.parse(localStorage.getItem("addresses"));
  return addresses[0];
}



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
  location.href = 'index.html';
}

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


function showPrivateKey() {
  var password = $('#passwordShowPV').val();
  try {
    var privateKey = CryptoJS.AES.decrypt(localStorage.getItem('filWalletSecret'), password).toString(CryptoJS.enc.Utf8);
    $('#privateKetShowed').text(privateKey);
  }
  catch(err) {
    alert('The password is wrong. Please, enter the right password.')
  }
  $('#passwordShowPV').val('');
  return false;
  
  
}

function logout() {
  web3.eth.accounts.wallet.clear();
  localStorage.clear();
  location.href = 'login.html';
}

$(function()
{
  getContract();

  if(localStorage.getItem('filWalletAddress') != null) {
    checkBalance();
    //checkCurrentBlock();
    const myWallet = localStorage.getItem("filWalletAddress")
    $('.current_account_text').text(myWallet);
  }

  $('#saveWallet').click(
    function() {
    saveWallet()});
  
    $('#generateWalletButton').click(
        function() {
        generateWallet()});

    $('#generateWalletPrivKeyButton').click(
        function() {
            generateWalletFromPrivateKey()});

    $('#generateWalletKeyStoreButton').click(
      function() {
        generateWalletFromKeyStore()});

    $('#confirmKeySavedButton').click(
      function() {
        confirmKeySaved()});

    $('#verifyAddressButton').click(
      function() {
        checkAddress()});
    $('#btnLogout').click(
      function() {
        logout()});

    $('#btnLeaveClub').click(
      function() {
        leaveClub()});

    $('#btnContributeClub').click(
      function() {
        contributeClub()});

    $('#createClubButton').click(
      function() {
        createClub()});    

    $('#btnJoinClub').click(
      function() {
        joinClub()});
    $('#createProposalButton').click(
      function() {
        createProposal()});

    $('#btnVote').click(
      function() {
        voteOnProposal()});

    $('#btnExecution').click(
      function() {
        runProposal()});
        

    $('#btnShowPrivateKey').click(
        function() {
          showPrivateKey()});
    
    
}
    
);