<template>
  <div class="home">
    <Nav />
    <div class="wrapper">
      <router-view></router-view>
    </div>
    <wallet-connector v-if="user.hasTempAddress" />
  </div>
</template>

<script setup lang="ts">
import Nav from "@components/Nav";
import useFetcher from "@/composables/useFetcher";
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  provide,
  Ref,
  ref,
  watch,
} from "vue";
import { Operations__factory } from "../../../../libs/hardhat/src";
import { ethers } from "ethers";
import { User } from "../../../server/src/users/user.entity";
import { UserRole } from "../../../server/src/enums/userRole.enum";
import { Promoteur } from "../../../server/src/promoteurs/promoteur.entity";
import { TOperation, TUser } from "@/utils/types";
import {
  NotificationPayload,
  NotificationsMessages,
} from "../../../../libs/shared/src/lib/notifications";
import { getContractProvider } from "@/utils/helpers";
import WalletConnector from "@components/WalletConnector.vue";

const collapsed = ref(localStorage.getItem("collapsed") === "true");
provide("collapsed", collapsed);

watch(collapsed, (value) => {
  localStorage.setItem("collapsed", value ? "true" : "false");
});

const fetcher = useFetcher();
const items = ref<Ref<TOperation[]>>([] as unknown as Ref<TOperation[]>);
const notifications = ref<NotificationPayload[]>([]);
provide("notifications", notifications);

const provider = getContractProvider();
const contractAddress = process.env.VUE_APP_ETHERS_CONTRACT_ADDRESS as string;
const operations = Operations__factory.connect(contractAddress, provider);

const contract = new ethers.Contract(
  contractAddress,
  Operations__factory.abi,
  provider
);

const user = inject<Ref<TUser>>("user");

const primaryKey = computed<string>(() => {
  switch (user?.value.role) {
    case UserRole.PROMOTEUR:
      return (user.value as Promoteur).CIN;
    case UserRole.NOTAIRE:
      return (user.value as User).id.toString();
    default:
      return user?.value.role as string;
  }
});

const notifyFilter = operations.filters.Notify(primaryKey.value, null, null);

onMounted(async () => {
  items.value = await fetcher.get<TOperation[]>("/operations");
  if (!localStorage.getItem("token")) {
    // stop when requests are not authenticated to prevent unnecessary requests
    return;
  }

  // load notifications
  operations.queryFilter(notifyFilter, 0).then((events) => {
    const notificationList: NotificationPayload[] = [];
    for (let i = events.length - 1; i >= 0; i--) {
      notificationList.push(JSON.parse(events[i].args[2]));
    }
    notifications.value = notificationList;
  });
  provider.getBlockNumber().then((startBlockNumber) => {
    contract.on(
      notifyFilter,
      (primaryKey, operationReference, payload, event) => {
        if (event.blockNumber <= startBlockNumber) {
          return;
        }
        const payloadParsed: NotificationPayload = JSON.parse(payload);
        if (payloadParsed.message === NotificationsMessages.initiated) {
          items.value = [payloadParsed.operation, ...items.value];
        } else {
          items.value = items.value?.map((item) => {
            return item.reference === payloadParsed.reference
              ? payloadParsed.operation
              : item;
          });
        }
        notifications.value = [payloadParsed, ...notifications.value];
      }
    );
  });
});

onUnmounted(() => {
  contract.removeAllListeners(notifyFilter);
});
provide("items", items);
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;

  @include desktop {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    overflow: auto;
  }
  @include lg-desktop {
    gap: 4rem;
  }

  .wrapper {
    max-height: 100vh;
    overflow-x: hidden;
  }
}

.operations {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-top: 2rem;
  @include desktop {
    padding: 2rem;
    padding-left: 1rem;
    gap: 3rem;
  }
}
</style>
