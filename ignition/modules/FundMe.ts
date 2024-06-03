import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { networkConfig } from "../../helper-hardhat-config";
import { network } from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import fs from "fs";
import path from "path";

function getLocalhostAggregatorAddress() {
  const fileContent = fs.readFileSync(
    path.resolve("ignition/deployments/chain-31337/deployed_addresses.json"),
    "utf-8"
  );
  return JSON.parse(fileContent)["MockV3Aggregator#MockV3Aggregator"];
}

const FundMe = buildModule("FundMe", (m) => {
  const deployer = m.getAccount(0);
  const chainId = network.config.chainId!;
  const priceFeedAddress =
    chainId === 31337
      ? getLocalhostAggregatorAddress()
      : networkConfig[chainId].ethUsdPriceFeed;
  const fundMe = m.contract("FundMe", [priceFeedAddress], {
    from: deployer,
  });
  return { fundMe };
});

export default FundMe;
