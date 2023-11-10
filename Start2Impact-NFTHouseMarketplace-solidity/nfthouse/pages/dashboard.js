const {contractAddress} = require('../contractData.js')


const Page = ({ address, userBalance, userNftBalance, connected }) => {

  return (
    <>
      {connected ? (
        <>
          {/* WALLET CONNECTED */}
          <div className="dashboard-container">
            {/* your address section */}
            <div className="dashboard-section">
              <h3>Your address:</h3>
              <p>
                {address}
                <a href={`https://sepolia.etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer" className="etherscan-link">
                  (Etherscan)
                </a>
              </p>
            </div>
            {/* your balances section */}
            <div className="dashboard-section">
              <h3>Your balances:</h3>
              <p>
                {userBalance} <img src="icons/eth1.png" alt="Ethereum Logo" className="logo-icon" />
                ETH
              </p>
              <p>
                {userNftBalance} <img src="icons/nfth1.png" alt="NFTHome Marketplace Logo" className="logo-icon" />
                NFTH
              </p>
            </div>
            {/* contract address section */}
            <div className="dashboard-section">
              <h3>Contract address:</h3>
              <p>
                {contractAddress}
                <a href={`https://sepolia.etherscan.io/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="etherscan-link">
                  (Etherscan)
                </a>
              </p>
            </div>
            {/* metamask nft import guide section */}
            <div className="dashboard-section">
              <h3>How to View Your NFTH on MetaMask:</h3>
              <p>Open MetaMask and navigate to the NFT section.</p>
              <p>Click on "Import NFT".</p>
              <p>Enter the NFTH contract address and the token ID you want to view.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* WALLET NOT CONNECTED */}
          <h1 className='wallet-connected'>Connect your Metamask wallet to view this page</h1>
        </>
      )}
    </>
  )
}
  
export default Page;