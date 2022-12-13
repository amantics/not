<template>
  <div class="account" :class="[collapsed && 'collapsed']">
    <div class="account__avatar">
      {{
        user.avatar ??
        (user.name ?? user.CIN)
          ?.split(/\s+/g)
          .map((v) => v[0].toUpperCase())
          .join("")
      }}
    </div>
    <div class="main">
      <p class="name">{{ user?.name ?? user.CIN }}</p>
      <p class="role">{{ user?.role }}</p>
    </div>
    <Dropdown icon="chevron-down" position-x="left" :options="accountOptions" />
    <Notifications />
  </div>
</template>

<script setup lang="ts">
import Dropdown from "@components/Dropdown";
import { UserRole } from "../../../server/src/enums/userRole.enum";
import { inject, Ref } from "vue";
import { useRouter } from "vue-router";
import { TUser } from "@/utils/types";
import Notifications from "@components/Notifications.vue";

const user = inject<Ref<TUser>>("user");
const collapsed = inject<Ref<boolean>>("collapsed");

const router = useRouter();
const accountOptions: TDropdownOptions[] = [
  {
    icon: "log-out-outline",
    label: "Déconnexion",
    action: () => {
      localStorage.clear();
      router.push(
        user?.value.role === UserRole.PROMOTEUR ? "/login-promoteur" : "/login"
      );
    },
  },
];
</script>

<style scoped lang="scss">
.account {
  display: flex;
  align-items: center;
  gap: 1rem;

  &__avatar {
    border-radius: 1rem;
    background-color: $secondary-color;
    display: flex;
    width: 4rem;
    height: 4rem;
    align-items: center;
    justify-content: center;
  }

  .main {
    margin-right: auto;
    display: flex;
    white-space: nowrap;
    flex-direction: column;
    font-size: 1.4rem;
    gap: 0.5rem;

    .name {
      text-transform: capitalize;
    }

    .role {
      font-size: 1.2rem;
      opacity: 0.3;
    }
  }
}

.collapsed {
  flex-direction: column;

  .main {
    display: none;
  }
}
</style>
