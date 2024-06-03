import { ethers, ignition } from "hardhat";
import { expect } from "chai";
import { networkConfig } from "../../helper-hardhat-config";
import FundMe from "../../ignition/modules/FundMe";

describe("FundMe @staging", function () {
  async function getDeployedFundMeFixture() {
    const { fundMe } = await ignition.deploy(FundMe);
    const fundMeAddress = await fundMe.getAddress();
    const [owner] = await ethers.getSigners();
    const priceFeedAddress = networkConfig[11155111].ethUsdPriceFeed;
    const fundMeContract = await ethers.getContractAt(
      "FundMe",
      fundMeAddress,
      owner
    );
    console.log(fundMeContract);
    return { fundMe: fundMeContract, priceFeedAddress, owner };
  }

  it("allow people to fund and withdraw", async function () {
    const { fundMe, owner } = await getDeployedFundMeFixture();
    const txParams = {
      from: owner,
      value: ethers.parseEther("0.1"),
    };
    const txFund = await fundMe.getFunction("fund")(txParams);
    const txWithdraw = await fundMe.getFunction("withdraw")();
    const endingBalance = await fundMe.runner?.provider?.getBalance(
      fundMe.target
    );
    expect(endingBalance?.toString()).to.equal("0");
  });
});
