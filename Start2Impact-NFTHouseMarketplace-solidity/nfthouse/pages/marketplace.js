import styles from '../styles/marketplace.module.css';

// House Contract card component
const HouseContractCard = ({ houseContract }) => {
  return (
    <div className={styles.houseContractCard}>
      <h2>{houseContract.houseDescription}</h2>
      <p>Id: {houseContract.id}</p>
      <p>Place: {houseContract.place}</p>
      <p>Date: {houseContract.date}</p>
      <p>Price: {houseContract.price} Ether</p>
    </div>
  );
};

const Page = ({ connected, houseContractsForSale }) => {
  return (
    <>
      {connected ? (
      <>
        {/* WALLET CONNECTED */}
        <div className={styles.houseContractGridContainer}>
          <div className={styles.houseContractGrid}>
            {houseContractsForSale.map((houseContract) => (
              <HouseContractCard key={houseContract.id} houseContract={houseContract} />
            ))}
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
  );
};

export default Page;