export type NetworkConfig = {
  [networkId: number]: {
    name: string;
    ethUsdPriceFeed: string;
  };
};

export const networkConfig: NetworkConfig = {
  11155111: {
    name: "Sepolia",
    // https://docs.chain.link/data-feeds/price-feeds/addresses#Sepolia%20Testnet
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

export const DECIMALS = 8;
export const INITIAL_ANSWER = 200_000_000_000;
