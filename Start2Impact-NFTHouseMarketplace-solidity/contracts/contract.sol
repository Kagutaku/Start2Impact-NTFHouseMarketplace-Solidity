// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import './openzeppelin/contracts/access/Ownable.sol';
import './openzeppelin/contracts/token/ERC721/ERC721.sol';


contract NFTHouseMarketplace is ERC721, Ownable {

    uint256 private houseContractCounter;

    struct HouseContractDetails {
        string houseDescription;
        string place;
        string date;
        uint256 etherCentsPrice;
        bool availability;
    }

    mapping(uint256 => HouseContractDetails) private houseContractDetails;

    uint256[] private houseContractsForSale;

    event HouseContractCreated(uint256 indexed tokenId, string houseDescription, string place, string date, uint256 etherCentsPrice);

    event HouseContractPurchased(uint256 indexed tokenId, address buyer, uint256 etherCentsPrice);

    event HouseContractUsed(uint256 indexed tokenId, address user);


    constructor() ERC721("NFTHouseMarketplace", "NFTH") {}


    // Allows the contract owner to create multiple House Contract NFTs with specified details and prices
    function createHouseContracts(string memory houseDescription, string memory place, string memory date, uint256 etherCentsPrice, uint256 numberOfHouseContracts) public onlyOwner {
        require(numberOfHouseContracts > 0, "House Contract number must be greater than zero");
        require(etherCentsPrice > 0, "House Contract price in ether cents must be greater than zero");

        for (uint256 i = 0; i < numberOfHouseContracts; i++) {
            houseContractCounter++;

            HouseContractDetails memory newHouseContract = HouseContractDetails(houseDescription, place, date, etherCentsPrice, true);
            houseContractDetails[houseContractCounter] = newHouseContract;

            _mint(address(this), houseContractCounter);

            emit HouseContractCreated(houseContractCounter, houseDescription, place, date, etherCentsPrice);

            houseContractsForSale.push(houseContractCounter);
        }
    }


    // Retrieves the details of a specific House Contract NFT based on its token ID
    function getHouseContractDetails(uint256 tokenId) public view returns (string memory, string memory, string memory, uint256, bool) {
        require(_exists(tokenId), "House Contract does not exist");
        HouseContractDetails memory houseContract = houseContractDetails[tokenId];
        return (houseContract.houseDescription, houseContract.place, houseContract.date, houseContract.etherCentsPrice, houseContract.availability);
    }


    // Returns the list of House Contract IDs currently for sale
    function getHouseContractsForSale() external view returns (uint256[] memory) {
        return houseContractsForSale;
    }


    // Allows the owner or approved user to mark a House Contract NFT as used
    function useHouseContract(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "You must own the House Contract or be approved by the owner");
        require(houseContractDetails[tokenId].availability, "House Contract has already been used");

        houseContractDetails[tokenId].availability = false;

        emit HouseContractUsed(tokenId, msg.sender);
    }


    // Allows a user to purchase a House Contract NFT that is listed for sale
    function buyHouseContract(uint256 tokenId) external payable {
        require(_exists(tokenId), "House Contract does not exist");
        require(ownerOf(tokenId) == address(this), "House Contract is not available for purchase");
        require(houseContractDetails[tokenId].availability, "House Contract has already been used and cannot be sold");
        
        uint256 price = houseContractDetails[tokenId].etherCentsPrice * 1 ether / 100;

        require(msg.value >= price, "Insufficient ether sent");

        _transfer(address(this), msg.sender, tokenId);

        emit HouseContractPurchased(tokenId, msg.sender, price);

        // Gives back to user excess ether sent
        uint256 excessAmount = msg.value - price;

        if (excessAmount > 0) {
            payable(msg.sender).transfer(excessAmount);
        }

        // Updates array houseContractsForSale
        for (uint256 i = 0; i < houseContractsForSale.length; i++) {
            if (houseContractsForSale[i] == tokenId) {
                if (i != houseContractsForSale.length - 1) {
                    houseContractsForSale[i] = houseContractsForSale[houseContractsForSale.length - 1];
                }
                houseContractsForSale.pop();
                break;
            }
        }
    }


    // Allows the contract owner to send Ether to the contract
    function addFunds() external payable onlyOwner {}


    // Allows the contract owner to withdraw Ether from the contract
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");

        uint256 contractBalance = address(this).balance;
        require(contractBalance >= amount, "Contract has not enough funds to withdraw");

        payable(msg.sender).transfer(amount);
    }  
}