import { Injectable } from "@nestjs/common";
import { ethers } from "ethers";
import configuration from "../config/configuration";
import { Operations__factory } from "@newer/hardhat";

const config = configuration();

export type Contracts = typeof config.ethers.contracts;

@Injectable()
export class EthersService {
  private provider =
    config.ethers.host.network === "local"
      ? new ethers.providers.JsonRpcProvider(config.ethers.host.url)
      : new ethers.providers.InfuraProvider(
          config.ethers.host.network,
          config.ethers.host.apiKey
        );
  private mainSigner =
    config.ethers.host.network === "local"
      ? this.provider.getSigner(config.ethers.account.address)
      : new ethers.Wallet(config.ethers.account.privateKey, this.provider);
  private contractFactories: {
    [K in keyof Contracts];
  } = {
    operations: Operations__factory,
  } as const;

  public getContract<T>(name: keyof typeof this.contractFactories) {
    const contract = config.ethers.contracts[name];
    return this.contractFactories[name].connect(contract, this.mainSigner) as T;
  }

  getSigner(privateKey: string = config.ethers.account.privateKey) {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    return wallet.connect(this.provider);
  }

  public getMainSigner() {
    return this.mainSigner;
  }
}
