import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract with account ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`Account balance: ${balance.toString()}`);
  const operationsFactory = await ethers.getContractFactory("Operations");
  const operations = await operationsFactory.deploy();
  console.log(`Operations address: ${operations.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
