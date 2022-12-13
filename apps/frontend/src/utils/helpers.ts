import { labels } from "@/utils/constants";
import { TOperation } from "@/utils/types";
import { ethers } from "ethers";
import { Operations__factory } from "../../../../libs/hardhat/src";

export function arrayOf<T>(type: T, length: number): T[] {
  return Array(length).fill(type);
}

export const getFields = <T extends keyof TOperation>(keys: T[]) => {
  return keys.map((key) => ({ key, label: labels[key] }));
};

export function downloadFile(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", url);
  link.setAttribute("target", "_blank");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const generateGuaranteeOptions = (
  options: string[] = []
): TDropdownOptions[] => {
  if (!options.length) {
    return [];
  }
  return [
    {
      name: "fichiers",
      options: options.map((option) => ({
        label: parseIPFSDownloadInfo(option)?.name as string,
        action: () => {
          const downloadInfo = parseIPFSDownloadInfo(option);
          if (!downloadInfo) return;
          downloadFile(downloadInfo?.url);
        },
      })),
    },
  ];
};

export function parseIPFSDownloadInfo(
  value: string
): (IPFSDownloadInfo & { url: string }) | null {
  if (!value) return null;
  const downloadInfo: IPFSDownloadInfo = JSON.parse(value);
  return {
    ...downloadInfo,
    url: `https://${downloadInfo?.rootCid}.ipfs.dweb.link/${downloadInfo?.name}`,
  };
}

export function getContractProvider() {
  const network = process.env.VUE_APP_ETHERS_NETWORK;
  const apiKey = process.env.VUE_APP_INFURA_API_KEY;
  const host = process.env.VUE_APP_ETHERS_HOST || "http://localhost:8545";
  return network === "local"
    ? new ethers.providers.JsonRpcProvider(host)
    : new ethers.providers.InfuraProvider(network, apiKey);
}

export function padMoney(value: number | string) {
  if (!value) return "0";
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

export function getOperationsContract() {
  const operations = connectOperationsFactory();
  return new ethers.Contract(
    operations.address,
    Operations__factory.abi,
    getContractProvider()
  );
}

export function connectOperationsFactory() {
  const provider = getContractProvider();
  const contractAddress = process.env.VUE_APP_ETHERS_CONTRACT_ADDRESS as string;
  return Operations__factory.connect(contractAddress, provider);
}

export function removePercentage(amount: number, percentage: number) {
  return amount - (amount * percentage) / 100;
}

export function generateId(length = 10) {
  return (
    Math.random().toString(36).slice(2) + new Date().getTime().toString(36)
  ).slice(0, length);
}
