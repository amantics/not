<template>
  <div class="nav" :class="[collapsed && 'nav--collapsed']">
    <span
      @click="collapsed = !collapsed"
      class="collapse"
      :title="collapsed ? 'expand' : 'collapse'"
      :class="[collapsed && 'collapse--closed']"
      ><ion-icon name="chevron-back-outline"
    /></span>
    <Account />
    <div class="sections">
      <div v-for="(section, name) in sections" :key="name" class="section">
        <span class="name">{{ name }}</span>
        <div class="links">
          <router-link
            class="link"
            v-for="link in section"
            :to="link.path"
            exact-active-class="link--active"
            :key="link.label"
          >
            <ion-icon class="link--icon" :name="link.icon" />
            <span class="link--name">{{ link.label }}</span>
          </router-link>
        </div>
      </div>
    </div>
    <ThemeSwitch :show-names="!collapsed" />
  </div>
  <div class="mobile">
    <span class="btn" @click="isNavOpen = !isNavOpen"
      ><ion-icon :name="isNavOpen ? 'close-outline' : 'menu-outline'"></ion-icon
    ></span>
    <div class="more" v-if="!isNavOpen">
      <Notifications class="notifications" position-x="left" />
      <Dropdown
        icon="chevron-down"
        position-x="right"
        :options="accountOptions"
      >
        <template #icon>
          <span class="icon">
            {{
              user.avatar ??
              (user.name ?? user.CIN)
                ?.split(/\s+/g)
                .map((v) => v[0].toUpperCase())
                .join("")
            }}
          </span>
        </template>
      </Dropdown>
      <theme-switch />
    </div>
    <div class="sections" v-if="isNavOpen" @click="isNavOpen = !isNavOpen">
      <div class="section" v-for="(section, name) in sections" :key="name">
        <span class="name">{{ name }}</span>
        <div class="links">
          <router-link
            class="link"
            v-for="link in section"
            :to="link.path"
            exact-active-class="link--active"
            :key="link.label"
          >
            <span class="link--name">{{ link.label }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, Ref, ref } from "vue";
import Account from "@components/Account.vue";
import { UserRole } from "../../../server/src/enums/userRole.enum";
import { linksByRole } from "@/utils/constants";
import ThemeSwitch from "@components/ThemeSwitch.vue";
import { TUser } from "@/utils/types";
import { useRouter } from "vue-router";
import Dropdown from "@components/Dropdown.vue";
import Notifications from "@components/Notifications.vue";

const isNavOpen = ref(false);
const user = inject<Ref<TUser>>("user");
const sections = computed(() => {
  return {
    menu: [
      {
        label: "dashboard",
        icon: "grid",
        path: "/",
      },
      ...(linksByRole[user?.value.role ?? UserRole.PROMOTEUR] ?? []),
    ],
  } as const;
});

const closeMenu = () => {
  if (isNavOpen.value) {
    isNavOpen.value = false;
  }
};

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

const collapsed = inject<Ref<boolean>>("collapsed");
</script>

<style scoped lang="scss">
.nav {
  padding: 2rem 1rem;
  display: none;
  background-color: $secondary-bg-color;
  position: relative;
  min-width: 12rem;
  transition: all 0.2s ease;
  @include desktop {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  @include extra-lg-desktop {
    padding: 2rem 3rem;
  }

  .collapse {
    display: flex;
    position: absolute;
    top: 1rem;
    right: -1rem;
    border-radius: 100%;
    background-color: $secondary-color;
    font-size: 1.4rem;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0.5rem;

    &:hover {
      background-color: $secondary-bg-hover-color;
    }

    &--closed {
      transform: rotate(180deg);
    }
  }

  .sections {
    border-top: 1px solid $line-color;
    padding: 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .name {
      font-size: 1.2rem;
      text-transform: uppercase;
      opacity: 0.3;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .link {
          display: flex;
          gap: 1rem;
          align-items: center;
          font-size: 1.5rem;
          transition: all 0.2s ease;
          padding: 0.8rem 0;
          @include extra-lg-desktop {
            padding: 1rem 0;
          }

          &--name {
            transition: opacity 0.2s ease;
            opacity: 0.5;
            white-space: nowrap;
          }

          &--icon {
            opacity: 0.5;
            transition: all 0.2s ease;
          }

          &--active,
          &:hover {
            .link--name {
              opacity: 1;
            }

            .link--icon {
              color: $primary-color;
              opacity: 1;
            }
          }
        }
      }
    }
  }

  &--collapsed {
    min-width: 6rem;
    padding: 2rem;

    .sections {
      .name {
        text-align: center;
      }
    }

    .link {
      justify-content: center;
      position: relative;
      border-radius: 0.5rem;

      &--active {
        background-color: $secondary-color;
      }

      &--icon {
        font-size: 1.6rem;
        @include extra-lg-desktop {
          font-size: 1.8rem;
        }
      }

      &:hover {
        background-color: $secondary-color;

        .link--name {
          opacity: 1;
          left: 120%;
          visibility: visible;
        }
      }

      &--name {
        position: absolute;
        top: 50%;
        z-index: 2;
        left: 100%;
        transform: translateY(-50%);
        font-size: 1.4rem;
        padding: 0.8rem;
        border-radius: 0.5rem;
        background-color: $secondary-color;
        visibility: hidden;
        opacity: 0;
        transition: left 0.2s ease !important;
      }
    }
  }
}

.mobile {
  background-color: $secondary-bg-color;
  display: flex;
  position: relative;
  justify-content: space-between;
  height: 5rem;
  align-items: center;
  border-bottom: 1px solid $line-color;
  padding: 0 1rem;
  @include desktop {
    display: none;
  }

  .more {
    display: flex;
    gap: 1rem;
    align-items: center;

    .notifications {
      --min-main-width: 25rem;
    }

    .icon {
      text-transform: uppercase;
      font-size: 1.2rem;
      font-weight: bold;
      padding: 0.7rem;
      border: 1px solid $line-color;
      background-color: $secondary-color;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  .logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .sections {
    display: flex;
    height: 100vh;
    flex-direction: column;
    position: absolute;
    z-index: 999;
    background-color: $secondary-bg-color;
    width: 100%;
    top: 100%;
    left: 0;
    padding-top: 3rem;

    .section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      align-items: center;

      .name {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 1.2rem;
        opacity: 0.3;
      }

      .links {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-weight: bold;
        font-size: 2.5rem;

        .link {
          display: flex;
          gap: 0.5rem;
          text-transform: capitalize;
          align-items: center;
          opacity: 0.5;
          justify-content: center;

          &--active {
            opacity: 1;
            color: $primary-color;
          }
        }
      }
    }
  }

  .btn {
    cursor: pointer;
    display: flex;
    font-size: 3rem;
  }
}
</style>
