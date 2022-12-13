import { HardhatUserConfig } from "hardhat/config";
import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-waffle";

const hardhat = "./libs/hardhat/src";

const accounts = [process.env.ETHERS_ACCOUNT_PRIVATE_KEY];
const getUrl = (network: string) =>
  `https://${network}.infura.io/v3/${process.env.VUE_APP_INFURA_API_KEY}`;

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  paths: {
    root: hardhat,
  },
  networks: {
    ...["rinkeyby", "kovan", "goerli", "sepolia"].reduce((acc, network) => {
      return {
        ...acc,
        [network]: {
          url: getUrl(network),
          accounts,
        },
      };
    }, {}),
    localhost: {
      url: process.env.VUE_APP_ETHERS_CONTRACT_HOST || "http://localhost:8545",
      accounts: [process.env.ETHERS_ACCOUNT_PRIVATE_KEY as string],
    },
  },
};

export default config;
