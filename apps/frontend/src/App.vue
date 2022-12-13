<template>
  <div class="app" :class="[theme]">
    <router-view />
  </div>
</template>

<style lang="scss">
.app {
  background-color: $primary-bg-color;
  color: $primary-text-color;
  min-height: 100vh;
}

.ps {
  &__rail-x {
    &:hover {
      background-color: transparent !important;
    }
  }
}

.tax {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__amount {
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    padding: 1rem 0;

    .value {
      font-size: 4rem;
      font-weight: bold;
    }

    .text {
      font-size: 1.2rem;
      opacity: 0.3;
    }
  }
}
</style>
<script lang="ts" setup>
import { provide, ref, watch } from "vue";
import { User } from "../../server/src/users/user.entity";
import { TUser } from "@/utils/types";
import { useRouter } from "vue-router";
import { UserRole } from "../../server/src/enums/userRole.enum";

const loadUser = () => {
  const data = localStorage.getItem("user");
  if (data) {
    return JSON.parse(data);
  }
  return null;
};
const user = ref<TUser | null>(loadUser());
const setUser = (userData: User) => {
  user.value = userData;
};
provide("user", user);
provide("setUser", setUser);

watch(user, (newValue) => {
  if (newValue) {
    localStorage.setItem("user", JSON.stringify(newValue));
  } else {
    localStorage.clear();
  }
});

const theme = ref<string>(
  localStorage.getItem("theme") ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
);
provide("theme", theme);
watch(theme, (newValue) => {
  localStorage.setItem("theme", newValue);
});

const router = useRouter();
const fetcherConfig: TFetcherConfig = {
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "/api",
  onResponse: (response) => {
    if (response.status === 401) {
      localStorage.clear();
      router.push(
        user.value?.role === UserRole.PROMOTEUR ? "login-promoteur" : "login"
      );
    }
    return response;
  },
  onRequest: (config) => {
    const item = localStorage.getItem("token");
    if (item) {
      config.headers.Authorization = `Bearer ${item}`;
    }
    return config;
  },
};

provide("fetcherConfig", fetcherConfig);
</script>
