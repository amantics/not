import * as process from "process";

function configuration() {
  const config = {
    ethers: {
      host: {
        url:
          process.env.ETHERS_CONTRACT_HOST ||
          process.env.VUE_APP_ETHERS_CONTRACT_HOST ||
          "http://localhost:8545",
        apiKey: process.env.VUE_APP_INFURA_API_KEY,
        network: process.env.VUE_APP_ETHERS_NETWORK,
      },
      account: {
        address: process.env.ETHERS_ACCOUNT_ADDRESS,
        privateKey: process.env.ETHERS_ACCOUNT_PRIVATE_KEY,
      },
      contracts: {
        operations: process.env.VUE_APP_ETHERS_CONTRACT_ADDRESS,
      },
    },
    isDev: process.env.NODE_ENV !== "production",
    port: parseInt(process.env.PORT, 10) || 3000,
    jwt: {
      expiresIn: "1d",
      secret: process.env.JWT_SECRET || "secret",
    },
    database: {
      type: process.env.DATABASE_TYPE || "mysql",
      host: process.env.DATABASE_HOST || "localhost",
      port: process.env.DATABASE_PORT || 3306,
      username: process.env.DATABASE_USERNAME || "root",
      password: process.env.DATABASE_PASSWORD || "root",
      database: process.env.DATABASE_NAME || "notary",
      ssl: process.env.DATABASE_SSL === "true",
    },
  };
  return config;
}

export type ConfigData = ReturnType<typeof configuration>;
export default configuration;
