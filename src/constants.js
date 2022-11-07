// constants.js
import { ethers } from "ethers";
import contract from "./contracts/DistributedMedicalDatabase.json";
const CONTRACT_ADDRESS = "0xC29A5c85d9c14B3512F54cFcC869219e01301adF";
const ABI = contract.abi;
const ETHERS =  ethers ;

export { CONTRACT_ADDRESS, ABI, ETHERS };