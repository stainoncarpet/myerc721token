/* eslint-disable node/no-missing-import */
/* eslint-disable prettier/prettier */
import { ethers } from "hardhat";
import { BASE_URI, MAX_SUPPLY } from "../hardhat.config";

const main = async () => {
  const NFT = await ethers.getContractFactory("MyERC721Token");
  const nft = await NFT.deploy(BASE_URI, MAX_SUPPLY);

  await nft.deployed();

  console.log("MyERC721Token deployed to:", nft.address, "by", await nft.signer.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});