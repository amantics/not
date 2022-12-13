<template>
  <div class="notifications" v-click-outside="close">
    <span class="bell" :class="[notRead && 'bell--active']" @click="toggle"
      ><ion-icon name="notifications-outline"></ion-icon
    ></span>
    <Transition>
      <div
        class="main"
        :class="[
          `main--${positionY ?? 'bottom'}`,
          `main--${positionX ?? 'right'}`,
        ]"
        v-if="isOpen"
      >
        <div
          class="intro"
          :style="{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--line-color)',
            opacity: 0.5,
          }"
        >
          <p class="intro__title">Notifications</p>
        </div>
        <div class="placeholder" v-if="!notifications.length">
          Pas encore de notifications
        </div>
        <div class="entries" v-else>
          <div
            v-for="notification in notifications"
            :key="notification.createdAt"
            class="entry"
          >
            <p class="inner">
              <span class="text">{{ Messages[notification.message] }}</span>
              <span class="reference">#{{ notification.reference }}</span>
            </p>
            <span class="distance">{{
              intlFormatDistance(new Date(notification.createdAt), new Date())
            }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref, watch } from "vue";
import {
  Messages,
  NotificationPayload,
} from "../../../../libs/shared/src/lib/notifications";
import { intlFormatDistance } from "date-fns";
import { User } from "../../../server/src/users/user.entity";
import useFetcher from "@/composables/useFetcher";

const notifications = inject<Ref<NotificationPayload[]>>("notifications", []);
const fetcher = useFetcher();

const user = inject<Ref<User>>("user");
const setUser = inject<(user: User) => void>("setUser");
const isOpen = ref(false);
const close = () => {
  if (isOpen.value) {
    isOpen.value = false;
  }
};

const toggle = () => {
  isOpen.value = !isOpen.value;
};
watch(isOpen, (value) => {
  if (value && notRead.value) {
    fetcher.put<User>("/notifications/read").then((res) => {
      setUser?.(res);
    });
  }
});
const notRead = computed(() => {
  return (
    notifications.value?.[0]?.createdAt > user?.value?.notificationsReadDate
  );
});

interface Props {
  positionX?: "left" | "right";
  positionY?: "top" | "bottom";
}

const props = defineProps<Props>();
</script>

<style scoped lang="scss">
.notifications {
  position: relative;
  --min-main-width: 35rem;

  .bell {
    padding: 0.5rem 0.8rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:after {
      opacity: 0;
      @include size(0);
      transition: all 0.2s ease;
    }

    &:hover {
      background-color: $secondary-color;
      opacity: 1;
    }

    &--active {
      position: relative;

      &:after {
        opacity: 1;
        content: "";
        display: inline-block;
        position: absolute;
        top: 20%;
        right: 1rem;
        box-shadow: 0 0 0.2rem rgba(0, 0, 0, 0.5);
        @include size(0.6rem);
        background-color: lighten($fail-color, 10%);
        border-radius: 50%;
      }
    }
  }
}

.main {
  position: absolute;
  border-radius: 0.5rem;
  background-color: $secondary-color;
  z-index: 10;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
  min-width: var(--min-main-width);
  $measureY: calc(100% + 1rem);

  &--top {
    bottom: $measureY;
  }

  &--bottom {
    top: $measureY;
  }

  &--left {
    right: 0;
  }

  &--right {
    left: 0;
  }

  .placeholder {
    padding: 2rem 1rem;
    text-align: center;
    font-size: 1.4rem;
    opacity: 0.5;
  }

  &__title {
  }

  .entries {
    display: flex;
    flex-direction: column;
    max-height: 60vh;
    overflow: auto;

    .entry {
      padding: 1.5rem 0;
      font-size: 1.4rem;
      margin: 0 3rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      position: relative;

      &:after {
        height: 0.1rem;
        content: "";
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        display: inline-block;
        background-color: $line-color;
        opacity: 0.5;
      }

      &:last-of-type {
        &:after {
          display: none;
        }
      }

      .inner {
        .text {
          opacity: 0.5;
        }

        .reference {
          opacity: 1;
          margin-left: 0.3rem;
          font-weight: bold;
        }
      }

      .distance {
        opacity: 0.3;
        font-size: 1.2rem;
      }
    }
  }
}

.intro {
  padding: 1.5rem 2rem;
  position: relative;

  &:after {
    height: 0.1rem;
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    display: inline-block;
    background-color: $line-color;
    opacity: 0.5;
  }
}

.v-enter-active,
.v-leave-active {
  transition: all 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  transform: translateY(-10%);
  opacity: 0;
}
</style>
