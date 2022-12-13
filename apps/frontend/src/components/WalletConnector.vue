<template>
  <div class="wallet" :class="[!show && 'wallet--hidden']">
    <Transition name="modal" appear>
      <div class="wallet__main" v-if="show">
        <MetakMaskLogo class="wallet__logo" />
        <p class="message">Veuillez connecter votre Wallet MetaMask</p>
        <load-button
          :disabled="!checkMetaMask()"
          :loading="connecting || !!fetcher.loading.value"
          class="btn btn--primary connect"
          @click="connect"
          >Connecter
        </load-button>
        <p class="install" v-if="error || fetcher.errors.value">
          {{ error || fetcher.errors.value }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, Ref } from "vue";
import { TUser } from "@/utils/types";
import useFetcher from "@/composables/useFetcher";
import LoadButton from "@components/LoadButton.vue";
import MetakMaskLogo from "@components/MetakMaskLogo.vue";
import { User } from "../../../server/src/users/user.entity";

const checkMetaMask = () => {
  const { ethereum } = window as any;
  const hasMetaMask = !!ethereum && !!ethereum.isMetaMask;
  if (!hasMetaMask) {
    error.value =
      "Veuillez installer l'extension MetaMask ou utiliser un navigateur qui la prend en charge.";
  }
  return hasMetaMask;
};

const user = inject<Ref<TUser>>("user");
const fetcher = useFetcher();
const show = ref(false);
const connecting = ref(false);
const error = ref(``);

onMounted(() => {
  if (!user?.value) return;
  if (!user?.value?.hasTempAddress) return;
  setTimeout(() => {
    show.value = true;
  }, 1000);
});

const connect = async () => {
  if (!checkMetaMask()) return;
  connecting.value = true;
  const { ethereum } = window as any;
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const walletAddress = accounts[0];
    const res = await fetcher.post<User | { error: string }>(
      "/auth/connect-wallet",
      {
        walletAddress,
      }
    );
    if (res.error) {
      error.value = res.error;
      return;
    }
    user.value = res;
  } catch (error) {
    console.log(error, "wallet connection error");
  } finally {
    connecting.value = false;
  }
};
</script>

<style lang="scss">
.wallet {
  @include size(100%);
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(black, 0.5);
  display: flex;
  z-index: 9999;
  justify-content: center;
  transition: all 0.2s ease;

  &__logo {
    width: 20rem;
    @include tablet {
      width: 25rem;
    }
  }

  &--hidden {
    visibility: hidden;
    opacity: 0;
  }

  &__main {
    background-color: $secondary-color;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    padding: 2rem;
    border-radius: 0.5rem;
    position: relative;
    height: fit-content;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-direction: column;
    width: 80%;
    margin: auto;
    @include tablet {
      width: 60%;
    }
    @include desktop {
      width: 40%;
    }
    @include extra-lg-desktop {
      width: 30%;
    }

    .message {
      opacity: 0.5;
      font-size: 1.4rem;
    }

    .install {
      font-size: 1.4rem;
      color: $fail-color;
      text-align: center;
    }
  }

  .connect {
    width: 50%;
    display: inline-block;
    padding: 1.2rem;
  }
}

.modal-leave-active {
  transition: all 0.1s ease;
}

.modal-enter-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  transform: translateY(-20%);
  opacity: 0;
}
</style>
