/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { task } from "hardhat/config";

const NETWORK = "rinkeby";

export const runTasks = async () => {
    task("ww", "ww")
        .addParam("ww", "ww")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/MyERC721Token.sol/MyERC721Token.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const stakerContractInstance = new hre.ethers.Contract(taskArguments.staker, contractSchema.abi, walletOwner);

            const stakeTx = await stakerContractInstance.stake(taskArguments.amount);

            console.log("Receipt: ", stakeTx);
        })
    ;

    task("destroy", "Destroy contract")
        .addParam("address", "Contract address")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/MyERC721Token.sol/MyERC721Token.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new hre.ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            const tx = await contractInstance.destroyContract();

            console.log("Receipt: ", tx);
        })
    ;
};