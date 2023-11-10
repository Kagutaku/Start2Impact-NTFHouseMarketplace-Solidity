import Head from "next/head"
import "../styles/globals.css"
import Link from "next/link"
import { useState, useEffect } from 'react'
import { Web3Provider } from '@ethersproject/providers';
const { ethers } = require("ethers"); 
const {contractAddress, contractAbi} = require('../contractData.js')


export default function AppWrapper({ Component, pageProps }) {

  const [address, setAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [userBalance, setUserBalance] = useState('');
  const [userNftBalance, setUserNftBalance] = useState('');
  const [houseContractsForSale, setHouseContractsForSale] = useState([]);


  // Function to handle metamask wallet connection
  const connectWalletHandler = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        if (!connected) {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new Web3Provider(window.ethereum);
          const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());
          setAddress(accounts[0]);
          console.log('MetaMask connected successfully');
          setConnected(true);
          setProvider(provider);
          setContract(contractInstance);
          setSigner(provider.getSigner());
        } else {
          setAddress('');
          console.log('Wallet disconnected');
          setConnected(false);
          setProvider(null);
          setContract(null);
        }
      } catch (err) {
        console.error(err.message)
      }
    } else {
      console.error('Please install MetaMask browser extension')
    }
  };

  
  // Function to get user ether and nfth balances
  const getUserBalances = async () => {
    try {
      if (provider) {
        // get user ether balance
        const balanceWei = await signer.getBalance();
        const balanceEth = balanceWei / 10 ** 18;
        const formattedBalance = parseFloat(balanceEth).toFixed(6);
        setUserBalance(formattedBalance);

        // get user nfth balance
        const nftBalanceUser = await contract.balanceOf(address);
        const nftBalanceUserForm = parseInt(nftBalanceUser.toString());
        setUserNftBalance(nftBalanceUserForm);
      }
    } catch (error) {
      console.error('Error fetching balance:', error.message);
    }
  };


  // Function to get House Contract for sale with details
  const getHouseContractsData = async () => {
    try {
      // fetch array with House Contracts for sale IDs
      const localHouseContractsForSaleRaw = await contract.getHouseContractsForSale();
      const localHouseContractsForSaleFormatted = localHouseContractsForSaleRaw.map((bigIntValue) => Number(bigIntValue));
      const localHouseContractsForSale = localHouseContractsForSaleFormatted.sort((a, b) => a - b);

      // fetch House Contracts for sale details
      const houseContractDetailsPromises = [];

      // Fetch Home Contract details for each House Contract ID
      localHouseContractsForSale.forEach((houseContractId) => {
        const houseContractDetailsPromise = contract.getHouseContractDetails(houseContractId).then((details) => {
          return {
            id: houseContractId,
            houseDescription: details[0],
            place: details[1],
            date: details[2],
            price: (Number(details[3]) / 100),
            availability: details[4],
          };
        });

        houseContractDetailsPromises.push(houseContractDetailsPromise);
      });

      // Wait for all fetch requests to be done
      const houseContractDetailsData = await Promise.all(houseContractDetailsPromises);

      // Combine House Contract details with IDs and update houseContractsForSale state variable
      const combinedHouseContractsData = localHouseContractsForSale.map((houseContractId, index) => {
        return {
          id: houseContractId,
          ...houseContractDetailsData[index],
        };
      });
      setHouseContractsForSale(combinedHouseContractsData);    

    } catch (error) {
      console.error('Error fetching House Contract data:', error.message);
    }
  };
  
  
  
  // Effect to connect to MetaMask and initialize contract
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      if (window.ethereum.selectedAddress) {
        const provider = new Web3Provider(window.ethereum);
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());
        setProvider(provider);
        setContract(contractInstance);
        setAddress(window.ethereum.selectedAddress);
        setConnected(true);
        setSigner(provider.getSigner());
      }
    }
  }, []);

  
  // Effect to get House Contract data
  useEffect(() => {
    if (contract && !houseContractsForSale.length) {
      getHouseContractsData();
    }
  }, [contract]);


  // Effect to get user balances when address or web3 changes
  useEffect(() => {
    getUserBalances();
  }, [address, provider]);


  // front end html template
  return (
    <>
      <Head>
        <title>NTFHome Marketplace</title>
      </Head>

      <div className="page-wrapper">
        {/* navbar */}
        <nav className="nav">
          <div className="navbar-content">

            {/* logo image */}
            <div className="logo">
              <Link href="/">
                <img src="/icons/logo2.png" alt="NFTHouseContract Logo" />
              </Link>
            </div>

            {/* pages links */}
            <ul className="nav-links">
              {connected ? (
                <>
                  {/* WALLET CONNECTED */}
                  <li>
                    <Link href="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link href="/marketplace">Marketplace</Link>
                  </li>
                  <li>
                    <Link href="/houseContract-center">Home Contract Center</Link>
                  </li>
                </>
              ) : (
                <>
                  {/* WALLET NOT CONNECTED */}
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="https://www.linkedin.com/in/emanuelebashuri/" target="_blank">My Linkedin</Link>
                  </li>
                  <li>
                    <Link href="https://github.com/Kagutaku" target="_blank">My Github</Link>
                  </li>
                </>
              )}
            </ul>

            {/* connect wallet button */}
            <div className="connect-wallet">
              <button onClick={connectWalletHandler} className="connectWalletButton">
                {connected ? "Disconnect Wallet" : "Connect Wallet"}
              </button>
            </div>
          </div>
        </nav>

        {/* page content */}
        <div className="content">
          <Component {...pageProps}
            address={address}
            contract={contract}
            houseContractsForSale={houseContractsForSale}
            userBalance={userBalance}
            userNftBalance={userNftBalance}
            connected={connected}
          />
        </div>

        {/* footer */}
        <footer className="footer">

          <p>
            <strong>Emanuele Bashuri</strong> ©2023 Start2Impact Ethereum Project
          </p>
        
        </footer>
      </div>
    </>
  )
}