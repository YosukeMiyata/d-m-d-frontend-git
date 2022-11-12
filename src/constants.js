// constants.js
import { ethers } from "ethers";
import contract from "./contracts/DistributedMedicalDatabase.json";
const CONTRACT_ADDRESS = "0x2D7BB6c09df1C5e6687DDFD3b8c0a17bB282bAd6";
const ABI = contract.abi;
const ETHERS =  ethers ;

export { CONTRACT_ADDRESS, ABI, ETHERS };