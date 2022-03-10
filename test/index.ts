/* eslint-disable spaced-comment */
/* eslint-disable no-unused-expressions */
/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-extraneous-import */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BASE_URI, MAX_SUPPLY, ZERO_ADDRESS } from "../hardhat.config";

describe("MyERC721Token", function () {
  let MyERC721Token: any, myERC721Token: any, signers: any[], metamaskSigner: any;

  beforeEach(async () => {
    MyERC721Token = await ethers.getContractFactory("MyERC721Token");
    myERC721Token = await MyERC721Token.deploy(BASE_URI, MAX_SUPPLY);

    await myERC721Token.deployed();

    signers = await ethers.getSigners();
    metamaskSigner = await ethers.getSigner(process.env.METAMASK_PUBLIC_KEY);

    await network.provider.request({ method: "hardhat_impersonateAccount", params: [process.env.METAMASK_PUBLIC_KEY]});
  });

  afterEach(async () => {});

  it("Should mint one token", async () => {
    // try to mint by sending 0.2 eth
    expect(metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.2"), to: myERC721Token.address})).to.be.revertedWith("0.1 ETH only");

    await expect(metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address }))
      .to.emit(myERC721Token, "Transfer").withArgs(ZERO_ADDRESS, metamaskSigner.address, 0)
    ;
  });

  it("Should perform balanceOf correctly",  async () => {
    // mint 2 tokens sequentially thru receive and fallback
    await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address });
    await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address, data: ZERO_ADDRESS });

    const balance = await myERC721Token.balanceOf(metamaskSigner.address);
    expect(balance).to.be.equal(2);
  });

  it("Should perform ownerOf correctly",  async () => {
    // mint 1 token
    await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address });

    expect(await myERC721Token.ownerOf(0)).to.be.equal(metamaskSigner.address);
    expect(myERC721Token.ownerOf(1)).to.be.revertedWith("ERC721: owner query for nonexistent token");
  });

  it("Should perform approve & getApproved && transferFrom correctly",  async () => {
    // mint 1 token
    await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address });

    expect(await myERC721Token.ownerOf(0)).to.be.equal(metamaskSigner.address);

    // before approval operator address should be 0
    expect(await myERC721Token.getApproved(0)).to.be.equal(ZERO_ADDRESS);

    // approve first
    expect(await myERC721Token.connect(metamaskSigner).approve(signers[1].address, 0))
      .to.emit(myERC721Token, "Approval")
      .withArgs(metamaskSigner.address, signers[1].address, 0)
    ;

    expect(await myERC721Token.getApproved(0)).to.be.equal(signers[1].address);

    // try to initiate transfer as someone else
    expect(myERC721Token.transferFrom(metamaskSigner.address, signers[2].address, 0))
      .to.be.revertedWith("ERC721: transfer caller is not owner nor approved")
    ;

    // transfer from signer by address1 to address2
    expect(await myERC721Token.connect(signers[1]).transferFrom(metamaskSigner.address, signers[2].address, 0))
      .to.emit(myERC721Token, "Transfer")
      .withArgs(metamaskSigner.address, signers[2].address, 0)
    ;

    expect(await myERC721Token.balanceOf(signers[2].address)).to.be.equal(1);
    expect(await myERC721Token.balanceOf(metamaskSigner.address)).to.be.equal(0);
  });

  it("Should perform approve & safeTransferFrom correctly",  async () => {
    // mint 1 token
    await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address });

    // approve first
    expect(await myERC721Token.connect(metamaskSigner).approve(signers[1].address, 0))
      .to.emit(myERC721Token, "Approval")
      .withArgs(metamaskSigner.address, signers[1].address, 0)
    ;

    // transfer from signer by address1 to address2
    expect(
      await myERC721Token
        .connect(signers[1])
        ["safeTransferFrom(address,address,uint256)"](metamaskSigner.address, signers[2].address, 0)
      )
      .to.emit(myERC721Token, "Transfer")
      .withArgs(metamaskSigner.address, signers[2].address, 0)
    ;

    expect(await myERC721Token.balanceOf(signers[2].address)).to.be.equal(1);
    expect(await myERC721Token.balanceOf(metamaskSigner.address)).to.be.equal(0);
  });

  it("Should perform isApprovedForAll & setApprovalForAll correctly",  async () => {
    // mint 3 tokens sequentially
    await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address });
    await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address });
    await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address });

    // should be false before approval is given
    expect(await myERC721Token.isApprovedForAll(metamaskSigner.address, signers[1].address)).to.be.equal(false);

    // set approval for all
    expect(await myERC721Token.connect(metamaskSigner).setApprovalForAll(signers[1].address, true))
      .to.emit(myERC721Token, "ApprovalForAll")
      .withArgs(metamaskSigner.address, signers[1].address, true)
    ;

    // should be true after approval is given
    expect(await myERC721Token.isApprovedForAll(metamaskSigner.address, signers[1].address)).to.be.equal(true);
  });

  it("Should fail to mint",  async () => {
    // mint MAX tokens right away
    const max = await myERC721Token.maxSupply();

    for (let index = 0; index < max; index++) {
      await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address });
    }

    // try to mint one more
    await expect(metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address }))
      .to.be.revertedWith("Token limit reached")
    ;
    expect(await myERC721Token.ownerOf(MAX_SUPPLY - 1)).to.be.equal(metamaskSigner.address);
    expect(myERC721Token.ownerOf(MAX_SUPPLY)).to.be.revertedWith("ERC721: owner query for nonexistent token");
  });

  it("Should fetch token URI",  async () => {
    await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC721Token.address });
    console.log(await myERC721Token.tokenURI(0))
    // externalID = internalID + 1
    expect(await myERC721Token.tokenURI(0)).to.be.equal(BASE_URI + '1.json');
  });

  it("Should get destroyed correctly", async () => {
    expect(await myERC721Token.owner()).to.equal(signers[0].address);
    await expect(myERC721Token.connect(signers[1]).destroyContract()).to.be.revertedWith("Ownable: caller is not the owner");
    await myERC721Token.destroyContract();
    await expect(myERC721Token.owner()).to.be.reverted;
  });
});
