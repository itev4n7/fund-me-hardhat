import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { DECIMALS, INITIAL_ANSWER } from "../../helper-hardhat-config";

describe("FundMe", function () {
  async function deployFundMeFixture() {
    const [owner, ...otherAccounts] = await ethers.getSigners();
    const MockV3Aggregator = await ethers.getContractFactory(
      "MockV3Aggregator"
    );
    const mockV3Aggregator = await MockV3Aggregator.deploy(
      DECIMALS,
      INITIAL_ANSWER
    );
    const priceFeedAddress = await mockV3Aggregator.getAddress();
    const FundMe = await ethers.getContractFactory("FundMe");
    const fundMe = await FundMe.deploy(priceFeedAddress);
    return { fundMe, priceFeedAddress, owner, otherAccounts };
  }

  async function deployFundMeAndFundEthFixture() {
    const deployedFundMeFixture = await deployFundMeFixture();
    const txParams = {
      from: deployedFundMeFixture.owner,
      value: ethers.parseEther("1"),
    };
    await deployedFundMeFixture.fundMe.getFunction("fund")(txParams);
    return { ...deployedFundMeFixture };
  }

  describe("constructor", function () {
    it("sets aggregator addresses correctly", async function () {
      const { fundMe, priceFeedAddress } = await loadFixture(
        deployFundMeFixture
      );
      const responce = await fundMe.getFunction("getPriceFeed")();
      expect(responce).to.equal(priceFeedAddress);
    });
  });

  describe("fund", function () {
    it("fails if not enogh ETH", async function () {
      const { fundMe, owner } = await loadFixture(deployFundMeFixture);
      const errorMessage = "You need to spend more ETH!";
      const txParams = {
        from: owner,
        value: ethers.parseEther("0.0005"),
      };
      await expect(fundMe.getFunction("fund")(txParams)).to.be.revertedWith(
        errorMessage
      );
    });

    it("updated the amount founded data structure", async function () {
      const { fundMe, owner } = await loadFixture(deployFundMeFixture);
      const sendValue = ethers.parseEther("1");
      const txParams = {
        from: owner,
        value: sendValue,
      };
      await fundMe.getFunction("fund")(txParams);
      const responce = await fundMe.getFunction("getAddressToAmountFunded")(
        owner
      );
      expect(responce.toString()).to.equal(sendValue);
    });

    it("adds funder to funders array", async function () {
      const { fundMe, owner } = await loadFixture(deployFundMeFixture);
      const txParams = {
        from: owner,
        value: ethers.parseEther("1"),
      };
      await fundMe.getFunction("fund")(txParams);
      const founder = await fundMe.getFunction("getFunder")(0);
      expect(founder).to.equal(owner);
    });
  });

  describe("withdraw", async function () {
    it("withdraw ETH from a single founder", async function () {
      const { fundMe, owner } = await loadFixture(
        deployFundMeAndFundEthFixture
      );
      const startingFundMeBalance = await fundMe.runner?.provider?.getBalance(
        await fundMe.getAddress()
      );
      const startingOwnerBalance = await fundMe.runner?.provider?.getBalance(
        owner
      );
      const txResponce = await fundMe.getFunction("withdraw")();
      const txReceipt = await txResponce.wait(1);
      const { gasUsed, gasPrice } = txReceipt;
      const gasCost = gasUsed * gasPrice;
      const endingFundMeBalance = await fundMe.runner?.provider?.getBalance(
        fundMe.getAddress()
      );
      const enidngDeployerBalance = await fundMe.runner?.provider?.getBalance(
        owner
      );
      expect(endingFundMeBalance).to.equal(0);
      expect(
        (startingFundMeBalance! + startingOwnerBalance!).toString()
      ).to.equal((enidngDeployerBalance! + BigInt(gasCost)).toString());
    });

    it("allow us to withdraw with multiple funders", async function () {
      const { fundMe, owner, otherAccounts } = await loadFixture(
        deployFundMeFixture
      );
      for (let id = 0; id < 6; id++) {
        const fundMeConnectedContract = fundMe.connect(otherAccounts[id]);
        const txParams = {
          from: otherAccounts[id],
          value: ethers.parseEther("1"),
        };
        await fundMeConnectedContract.getFunction("fund")(txParams);
      }
      const startingFundMeBalance = await fundMe.runner?.provider?.getBalance(
        await fundMe.getAddress()
      );
      const startingOwnerBalance = await fundMe.runner?.provider?.getBalance(
        owner
      );
      const txResponce = await fundMe.getFunction("withdraw")();
      const txReceipt = await txResponce.wait(1);
      const { gasUsed, gasPrice } = txReceipt;
      const gasCost = gasUsed * gasPrice;
      const endingFundMeBalance = await fundMe.runner?.provider?.getBalance(
        fundMe.target
      );
      const enidngDeployerBalance = await fundMe.runner?.provider?.getBalance(
        owner
      );
      expect(endingFundMeBalance).to.equal(0);
      expect(
        (startingFundMeBalance! + startingOwnerBalance!).toString()
      ).to.equal((enidngDeployerBalance! + BigInt(gasCost)).toString());
      await expect(fundMe.getFunction("getFunder")(0)).to.be.reverted;
      for (let id = 0; id < 6; id++) {
        expect(
          await fundMe.getFunction("getAddressToAmountFunded")(
            await otherAccounts[id].getAddress()
          )
        ).to.equal(0);
      }
    });

    it("cheap withdraw with multiple funders", async function () {
      const { fundMe, owner, otherAccounts } = await loadFixture(
        deployFundMeFixture
      );
      for (let id = 0; id < 6; id++) {
        const fundMeConnectedContract = fundMe.connect(otherAccounts[id]);
        const txParams = {
          from: otherAccounts[id],
          value: ethers.parseEther("1"),
        };
        await fundMeConnectedContract.getFunction("fund")(txParams);
      }
      const startingFundMeBalance = await fundMe.runner?.provider?.getBalance(
        await fundMe.getAddress()
      );
      const startingOwnerBalance = await fundMe.runner?.provider?.getBalance(
        owner
      );
      const txResponce = await fundMe.getFunction("cheapWithdraw")();
      const txReceipt = await txResponce.wait(1);
      const { gasUsed, gasPrice } = txReceipt;
      const gasCost = gasUsed * gasPrice;
      const endingFundMeBalance = await fundMe.runner?.provider?.getBalance(
        fundMe.target
      );
      const enidngDeployerBalance = await fundMe.runner?.provider?.getBalance(
        owner
      );
      expect(endingFundMeBalance).to.equal(0);
      expect(
        (startingFundMeBalance! + startingOwnerBalance!).toString()
      ).to.equal((enidngDeployerBalance! + BigInt(gasCost)).toString());
      await expect(fundMe.getFunction("getFunder")(0)).to.be.reverted;
      for (let id = 0; id < 6; id++) {
        expect(
          await fundMe.getFunction("getAddressToAmountFunded")(
            await otherAccounts[id].getAddress()
          )
        ).to.equal(0);
      }
    });

    it("only allows the owner to withdraw", async function () {
      const { fundMe, otherAccounts } = await loadFixture(
        deployFundMeAndFundEthFixture
      );
      const errorMessage = "FundMe__NotOwner";
      const attacker = otherAccounts[0];
      const attackerConnectedContract = fundMe.connect(attacker);
      await expect(
        attackerConnectedContract.getFunction("withdraw")()
      ).to.be.revertedWithCustomError(attackerConnectedContract, errorMessage);
    });
  });
});
