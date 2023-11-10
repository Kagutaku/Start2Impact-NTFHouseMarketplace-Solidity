import { useState } from 'react';
const BigNumber = require('bignumber.js');
const {contractAddress} = require('../contractData.js')


const Page = ({ contract, houseContractsForSale, address, connected }) => {

    const [buyHouseContractId, setBuyHouseContractId] = useState('');
    const [useHouseContractId, setUseHouseContractId] = useState('');
    const [detailsHouseContractId, setDetailsHouseContractId] = useState('');
    const [houseContractDetails, setHouseContractDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Function to remove error message after 10sec
    const removeError = () => {
      setTimeout(() => {
        setErrorMessage('');
      }, 12000);
    };

    // Function to remove success message after 10sec
    const removeSuccessMessage = () => {
      setTimeout(() => {
        setSuccessMessage('');
      }, 10000);
    };
  
    // Function to handle House Contract id change in BUY form
    const handleBuyHouseContractIdChange = (event) => {
        setBuyHouseContractId(event.target.value);
    };

    // Function to handle House Contract id change in USE form
    const handleUseHouseContractIdChange = (event) => {
        setUseHouseContractId(event.target.value);
    };

    // Function to handle House Contract id change in SEARCH form
    const handleDetailsHouseContractIdChange = (event) => {
      setDetailsHouseContractId(event.target.value);
    };


    // Function to handle House Contract use
    const handleUseHouseContract = async () => {
    
        try {
        // Check that the user input is a valid House Contract ID
        const houseContractIdInt = parseInt(useHouseContractId);
        if (!Number.isInteger(houseContractIdInt) || houseContractIdInt <= 0) {
          setErrorMessage('Enter a valid House Contract ID');
          removeError();
            return;
        }

        // Check that user owns the House Contract
        let owner = await contract.ownerOf(houseContractIdInt);
        owner = owner.toLowerCase()
        if (owner !== address) {
          setErrorMessage('You must own the House Contract to use it');
          removeError();
            return;
        }
    
        // Call useHouseContract function from contract
        await contract.useHouseContract(houseContractIdInt);
        setSuccessMessage('House Contract used successfully, wait for transaction to be mined');
        removeSuccessMessage();

        } catch (error) {
          setErrorMessage('Error during House Contract use');
          removeError();
        }
    };
  
    // Function to handle House Contract purchase
    const handleBuyHouseContract = async () => {
      try {
        // Check that the user input is a valid House Contract ID
        const houseContractIdInt = parseInt(buyHouseContractId);
        if (!Number.isInteger(houseContractIdInt) || houseContractIdInt <= 0) {
          setErrorMessage('Enter a valid House Contract ID');
          removeError();
          return;
        }
        
        // Check that houseContract is in houseContractsForSale array
        const selectedHouseContract = houseContractsForSale.find((houseContract) => houseContract.id === houseContractIdInt);
        if (!selectedHouseContract) {
          setErrorMessage('House Contract not listed for sale, see Marketplace page');
          removeError();
          return;
        }
    
        // Get House Contract price and convert it to Wei
        const priceInEther = String(Number(selectedHouseContract.price));
        const priceInWei = new BigNumber(priceInEther).times(new BigNumber('1e18')).integerValue().toString();
  
        const transactionRequest = {
          value: priceInWei,
        };
  
        // Call buyHouseContract function from contract
        const tx = await contract.buyHouseContract(houseContractIdInt, transactionRequest);
    
        setSuccessMessage('House Contract purchased successfully, wait for transaction to be mined');
        removeSuccessMessage();
  
      } catch (error) {
        setErrorMessage('Error during House Contract purchase');
        removeError();
      }
    };

    // Function to fetch House Contract details
    const handleViewHouseContractDetails = async () => {
      try {
        // Check that the user input is a valid House Contract ID
        const houseContractIdInt = parseInt(detailsHouseContractId);
        if (!Number.isInteger(houseContractIdInt) || houseContractIdInt <= 0) {
          setErrorMessage('Enter a valid House Contract ID');
          removeError();
          return;
        }
  
        // Get token owner and contract address
        const tokenOwner = await contract.ownerOf(houseContractIdInt);
        const userAddress = address.toLowerCase();
        const owner1 = tokenOwner.toLowerCase();
        const nfthAddress = contractAddress.toLowerCase();
        let owner;

        if (owner1 === nfthAddress) {
          owner = 'NFTH Contract';
        } else if (owner1 === userAddress) {
          owner = 'YOU :)';
        } else {
          owner = owner1;
        }
  
        // Get House Contract details from contract
        const details = await contract.getHouseContractDetails(houseContractIdInt);
  
        if (details) {
          // Build House Contract details object
          const [houseDescription, place, date, price, availability] = details;
          setHouseContractDetails({
            id: houseContractIdInt,
            owner: owner,
            houseDescription,
            place,
            date,
            price: Number(price) / 100,
            availability,
          });
  
        } else {
          setErrorMessage('House Contract not found');
          removeError();
          setHouseContractDetails(null);
        }
      } catch (error) {
        setErrorMessage('House Contract not found');
        removeError();
      }
    };

  return (
      <>
        {connected ? (
          <>
            {/* WALLET CONNECTED */}
            {/* TOP SECTION */}
            <div className='houseContract-center-top-section'>
                {/* buy houseContract form */}
                <div className='houseContract-center-form'>
                    <h3>Buy a House Contract</h3>
                    <label htmlFor="buyHouseContractId"></label>
                    <input
                    type="text"
                    id="buyHouseContractId"
                    value={buyHouseContractId}
                    onChange={handleBuyHouseContractIdChange}
                    placeholder="House Contract ID"
                    />
                    <button onClick={handleBuyHouseContract}>Buy</button>
                </div>
                {/* use houseContract form */}
                <div className='houseContract-center-form'>
                    <h3>Use a House Contract</h3>
                    <label htmlFor="useHouseContractId"></label>
                    <input
                    type="text"
                    id="useHouseContractId"
                    value={useHouseContractId}
                    onChange={handleUseHouseContractIdChange}
                    placeholder="House Contract ID"
                    />
                    <button onClick={handleUseHouseContract}>Use</button>
                </div>
            </div>

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className='error-message'>
                {errorMessage}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {successMessage && (
              <div className='success-message'>
                {successMessage}
              </div>
            )}

            {/* BOTTOM SECTION */}
            <div className='houseContract-center-bottom-section'>
                {/* search houseContract form */}
                <div className='houseContract-center-search'>
                    <h3>View House Contract Details</h3>
                    <label htmlFor="detailsHouseContractId"></label>
                    <input
                      type="text"
                      id="detailsHouseContractId"
                      value={detailsHouseContractId}
                      onChange={handleDetailsHouseContractIdChange}
                      placeholder="House Contract ID"
                    />
                    <button onClick={handleViewHouseContractDetails}>Search</button>

                    {houseContractDetails && (
                      <div className='houseContract-details'>
                        <h4>Details for House Contract ID {houseContractDetails.id}</h4>
                        <p>Owner: {houseContractDetails.owner}</p>
                        <p>House Description: {houseContractDetails.houseDescription}</p>
                        <p>Place: {houseContractDetails.place}</p>
                        <p>Date: {houseContractDetails.date}</p>
                        <p>Price: {houseContractDetails.price} Ether</p>
                        <p>Availability: {houseContractDetails.availability ? 'Available' : 'Not Available'}</p>
                      </div>
                    )}
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