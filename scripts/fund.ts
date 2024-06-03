import { ethers, ignition } from "hardhat";
import FundMe from "../ignition/modules/FundMe";

async function getDeployedFundMeFixture() {
  const { fundMe } = await ignition.deploy(FundMe);
  const fundMeAddress = await fundMe.getAddress();
  const [owner] = await ethers.getSigners();
  const fundMeContract = await ethers.getContractAt(
    "FundMe",
    fundMeAddress,
    owner
  );
  return { fundMe: fundMeContract, owner };
}

async function main() {
  const { fundMe, owner } = await getDeployedFundMeFixture();
  console.log("Funding contract...");
  const txParams = {
    from: owner,
    value: ethers.parseEther("0.1"),
  };
  const txResponce = await fundMe.getFunction("fund")(txParams);
  await txResponce.wait(1);
  console.log("Funded!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
