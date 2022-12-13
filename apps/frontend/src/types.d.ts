interface DropdownOption {
  icon?: string;
  label: string;
  action: () => void;
}

interface DropdownOptionsGroup {
  name: string;
  options: DropdownOption[];
}

type TDropdownOptions = DropdownOption | DropdownOptionsGroup;

interface INotification {}

type TableField<T = string> = {
  key: T;
  label: string;
};

type TFetcherConfig = {
  baseUrl: string;
  onRequest?: (config: RequestInit) => RequestInit;
  onResponse?: (res: Response) => Response;
  onError?: (error: Error) => Error;
};

type IPFSDownloadInfo = {
  cid: string;
  rootCid: string;
  name: string;
};
