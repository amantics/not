<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import { computed, provide, ref, watch } from "vue";
import { links, roles } from "@/utils/constants";
import { convertRolesToIndexes } from "@/utils/helpers";

const showNotifications = ref(false);

const currentRole = ref(0);
const router = useRouter();
provide("currentRole", currentRole);
watch(currentRole, (role) => {
  if (showNotifications.value) {
    showNotifications.value = false;
  }
  router.push(links[roles[role]][0].path);
});

const items = ref<TTransaction[]>([]);

const addTransaction: TAddTransaction = (transaction) => {
  items.value.push(transaction);
};
provide("items", items);
provide("addTransaction", addTransaction);

const currentLinks = computed(() => links[roles[currentRole.value]]);
const rolesOptions = roles.map((role, index) => ({
  text: role,
  value: index,
}));

const notifications = ref<TNotification[]>([]);

const notificationsList = computed(() => {
  const unread: TNotification[] = [];
  const intended: TNotification[] = [];
  notifications.value.forEach((notification) => {
    if (notification.intendedTo[currentRole.value] === undefined) return;
    intended.push(notification);
    if (!notification.intendedTo[currentRole.value]) unread.push(notification);
  });

  return { unread, intended };
});
watch(showNotifications, (show) => {
  if (!show) {
    return;
  }
  notifications.value.forEach((notification) => {
    if (notification.intendedTo[currentRole.value] === undefined) return;
    notification.intendedTo[currentRole.value] = true;
  });
});

const addNotification = (notification: TNotification) => {
  const not: TNotification = {
    ...notification,
    intendedTo: {
      ...notification.intendedTo,
      ...convertRolesToIndexes(["promoteur"]),
    },
    paths: {
      ...notification.paths,
      promoteur: "operations",
    },
  };
  notifications.value = [not, ...notifications.value];
};
provide("addNotification", addNotification);
</script>

<template>
  <div class="layout">
    <header>
      <div class="logo">
        <img src="/logo-mini.png" alt="logo" />
        <p class="text">
          <span class="main">Notary</span>
          <span class="sub">blockchain</span>
        </p>
      </div>
      <b-button
        @click="showNotifications = !showNotifications"
        variant="primary"
        block
      >
        Notifications
        <b-badge v-if="notificationsList.unread.length" pill variant="danger">{{
          notificationsList.unread.length
        }}</b-badge>
      </b-button>
      <div class="links">
        <b-link
          :key="link.path"
          active-class="active"
          v-for="link in currentLinks"
          :to="link.path"
        >
          {{ link.name }}</b-link
        >
      </div>
      <b-form-select
        class="role"
        v-model="currentRole"
        :options="rolesOptions"
      ></b-form-select>
    </header>

    <Transition name="slide">
      <div
        class="notifications"
        v-if="showNotifications"
        @click="showNotifications = !showNotifications"
      >
        <div class="header">
          <h3>notifications</h3>
          <span class="close">close</span>
        </div>
        <b-list-group>
          <b-link
            :key="notification.ref"
            v-for="notification in notificationsList.intended"
            :to="`/${notification.paths[roles[currentRole]]}?q=${
              notification.ref
            }`"
            class="mb-1 link"
          >
            <b-list-group-item class="flex-column align-items-start">
              <p>
                {{ notification.message }}
                <b-badge variant="primary">{{ notification.ref }}</b-badge>
              </p>
            </b-list-group-item>
          </b-link>
        </b-list-group>
      </div>
    </Transition>

    <RouterView class="view" />
  </div>
</template>

<style lang="scss">
.slide-enter-active {
  transition: all 0.5s ease-out;
}

.slide-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

$nav-width: 20%;
.view {
  flex: 1;
  width: 100% - $nav-width;
  padding: 2rem 0;
  padding-left: 2rem;
  .table-responsive {
    min-height: 50vh;
  }
}
.layout {
  display: flex;
  max-height: 100vh;
  position: relative;
  background-color: #f6f9ff;
  header {
    width: $nav-width;
    position: sticky;
    left: 0;
    top: 0;
    height: 100vh;
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
    padding: 2rem 1rem;
    background-color: #fff;
    .links {
      align-content: flex-start;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 1rem 0;
      a {
        display: flex;
        font-size: 0.9rem;
        gap: 0.5rem;
        text-decoration: none;
        opacity: 0.5;
        transition: all 0.2s ease;
        font-weight: 500;
        &:hover {
          opacity: 1;
        }
      }
      .active {
        opacity: 1;
      }
    }

    .role {
      margin-top: auto;
    }
    .logo {
      display: flex;
      gap: 5px;
      justify-content: center;
      margin-bottom: 1rem;

      img {
        display: inline-block;
        width: 3rem;
        height: 3rem;
      }
      .text {
        margin-top: 4px;
        text-transform: uppercase;
        opacity: 0.8;
        height: fit-content;
        display: flex;
        flex-direction: column;
        justify-items: flex-start;
        font-size: 18px;
        .main {
          font-weight: bold;
        }
        .sub {
          margin-top: -4px;
          font-size: 0.55em;
          opacity: 0.6;
          font-weight: 500;
        }
      }
    }
  }
  .notifications {
    position: fixed;
    right: 0;
    top: 0;
    z-index: 2;
    transition: all 0.2s ease;
    height: 100vh;
    overflow-y: auto;
    background: #fff;
    width: 30%;
    padding: 1rem;
    box-shadow: 0 0 0.2rem rgba(black, 0.2);
    .header {
      display: flex;
      justify-content: space-between;
      gap: 2rem;
      align-items: center;
      margin-bottom: 1rem;
      .close {
        cursor: pointer;
        opacity: 0.5;
        transition: all 0.2s ease;
        &:hover {
          opacity: 1;
        }
      }
      h3 {
        text-transform: capitalize;
        font-weight: bold;
      }
    }
  }
  .link {
    text-decoration: none;
  }
}
</style>
