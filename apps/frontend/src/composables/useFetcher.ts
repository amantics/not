import { inject, ref } from "vue";
import { RefValue } from "vue/macros";

function useFetcher(baseUrl?: string, config?: TFetcherConfig) {
  const globalConfig =
    config ?? inject<RefValue<TFetcherConfig>>("fetcherConfig");
  const defaultUrl = baseUrl ?? globalConfig?.baseUrl ?? "";
  const post = async <T>(url = "/", data?: any): Promise<T> => {
    return mutate(url, data, "POST");
  };

  const loading = ref<string>("");

  const put = async <T>(url = "/", data?: any): Promise<T> => {
    return mutate(url, data, "PUT");
  };

  const mutate = async (
    url: string,
    data: any = {},
    method: "POST" | "PUT"
  ) => {
    if (loading.value === url) return; // stop over fetching same reference until request is done
    loading.value = url;
    const defaultConfig: RequestInit = {
      method,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    };
    return fetch(
      defaultUrl + url,
      globalConfig?.onRequest?.(defaultConfig) ?? defaultConfig
    )
      .then((res) => globalConfig?.onResponse?.(res) ?? res)
      .then(async (res) => {
        const resData = await res.json();
        if (!res.ok) {
          errors.value = resData.message;
          return { error: resData.message };
        }
        return resData;
      })
      .catch((error) => globalConfig?.onError?.(error) ?? error)
      .finally(() => {
        loading.value = "";
      });
  };
  const get = async <T>(url = "/"): Promise<T | undefined> => {
    loading.value = url;
    const defaultConfig: RequestInit = { method: "GET", headers: {} };
    return fetch(
      defaultUrl + url,
      globalConfig?.onRequest?.(defaultConfig) ?? defaultConfig
    )
      .then((res) => globalConfig?.onResponse?.(res) ?? res)
      .then(async (res) => {
        const resData = await res.json();
        if (!res.ok) {
          errors.value = resData.message;
          return { error: resData.message };
        }
        data.value = resData;
        return resData;
      })
      .catch((error) => globalConfig?.onError?.(error) ?? error)
      .finally(() => {
        loading.value = "";
      });
  };
  const errors = ref(null);
  const data = ref(null);
  return { get, post, put, data, errors, loading } as const;
}

export default useFetcher;
