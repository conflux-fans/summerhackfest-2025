import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import EthBadge from './EthBadge';
import TokenBalance from './TokenBalance';
import "./sidemenu.css";



import $, { error } from 'jquery'; 

import {Web3} from 'web3';

const accountAddress = localStorage.getItem("filWalletAddress");

const web3 = new Web3(new Web3.providers.HttpProvider("https://evmtestnet.confluxrpc.com"));

function SideMenu({ isOpen, setIsOpen, smartAccount, logout, address }) {

  const address1 = localStorage.getItem("filWalletAddress");

  function hndclck(){
    window.open(`https://evmtestnet.confluxscan.io/address/${address1}`, '_blank');
  }

  function testclk(){
    window.open('https://faucet.confluxnetwork.org/', '_blank');
  }

  const [value, setValue] = useState(0);
  const [value1, setValue1] = useState(0);
  const [balances, setBalances] = useState(null);
  var smarbal = localStorage.getItem("filWalletAddress");


  async function t(){

    alert("This is t")
  }
  async function checkBalance() {
    // console.log(localStorage.getItem("LL"));
    
    
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


      setValue1(balanceEther)

    
      
      smarbal = balanceEther;
 
      // Update the balance on the page
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleLogout = () => {
    
    logout();
    setIsOpen(false);
  }


  useEffect(() => {
     checkBalance();
    // getBalances();
  }, []);

  return (
    <div>
      <Transition  show ={isOpen} timeout={500}>
        {(state) => (
          <div className={`fixed inset-0 overflow-hidden z-50 ${state === 'exited' ? 'hidden' : ''}`}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-opacity-75 transition-opacity" onClick={() => setIsOpen(false)}></div>

              <section className={` inset-y-0 right-0 half-page-menu full-height flex items-center justify-end transition-transform duration-500 ${state === 'exited' ? 'transform translate-x-full' : 'transform translate-x-0'}`}>
  {/* ... (other JSX content) */}

                <div className={`w-full h-full kk relative`}>
                  <div className=" mashiha divide-gray-900 bg-gray-900 text-white-900" >
                    <div className="px-4 mm  sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-llg font-medium text-white">🤖 AI Treasury DAO</h2>
                        
                      </div>
                      
                      <div className="ml-3 h-7 cross flex items-center">
                          <button className="bg-black rounded-md text-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white-900" onClick={() => setIsOpen(false)}>
                      
                            <span class=" cr material-symbols-outlined">
close
</span>
                          </button>
                        </div>
                      
                    </div>
                    <hr className=' hroi'></hr>
                    <div className='text-white m-2'>
                      <div className='flex mml '>
                      <EthBadge className="text-white" address={accountAddress} />
                      <button  className="btn bg-blue-500  text-white  px-4 rounded-full" onClick={hndclck}>
                       View on  explorer
                        
                      </button>
                      </div>
                      <div className="text-white text-2xl m-4">
                      ${parseFloat(value1).toFixed(2)}
                      
                      </div>
                      <button onClick={() => testclk()} className="bg-blue-500 mb-3 text-white py-2 px-4 rounded-full w-full">
                        Get Faucet
                      </button>
                      <button onClick={() => handleLogout()} className="bg-blue-500 text-white py-2 px-4 rounded-full w-full">
                        Logout
                      </button>

                      <div class='flex mx-4 mt-3'>
  <div className=' d1 flex items-center bg-zinc-100 text-zinc-300 w-fit p-2 px-3 rounded-l-lg'>
    <p className='d text-sm'>{'CFX'}</p>
    <p className= 'dd bg-zinc-800 p-1 px-3 ml-3 rounded-lg text-zinc-100'>
      {(value1)}
    </p>
  </div>
</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
}

export default SideMenu;