import useFetcher from "@/composables/useFetcher";
import { inject, onMounted, Ref } from "vue";
import { TUser } from "@/utils/types";

function useWallet() {
  const fetcher = useFetcher();
  const user = inject<Ref<TUser>>("user");
  onMounted(() => {
    if (!localStorage.getItem("token")) return;
    if (user?.value.walletAddress) return;
    //   check if metamask is installed
    //  if not, show a message to install it or use a browser that supports it
    //  get the user's wallet address
    //  send the wallet address to connect-wallet endpoint
  });
}

export default useWallet;
