// constants.js
import { ethers } from "ethers";
import contract from "./contracts/DistributedMedicalDatabase.json";
const CONTRACT_ADDRESS = "0x9F22FC5BA66EfF7cd822702B8803E6CCF91B22aE";
const ABI = contract.abi;
const ETHERS =  ethers ;

export { CONTRACT_ADDRESS, ABI, ETHERS };