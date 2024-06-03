import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import { hardhatArguments } from "hardhat";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  ignition: {
    blockPollingInterval: 1_000,
    timeBeforeBumpingFees: 3 * 60 * 1_000,
    maxFeeBumps: 4,
    //requiredConfirmations: 5 //uncomment if deploying on testnet, for localhost keep commented or use 1
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL!,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY!],
      chainId: parseInt(process.env.SEPOLIA_CHAIN_ID!),
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      //accounts: Placed automatically by hardhat
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY!,
  },
  gasReporter: {
    enabled: true,
    outputFile: "./gas-report.txt",
    noColors: true,
    currency: "USD",
    //coinmarketcap: process.env.COINMARKETCAP_API_KEY!,
    token: "ETH",
  },
  mocha: {
    timeout: 120 * 1000,
  },
  solidity: "0.8.24",
};

export default config;
