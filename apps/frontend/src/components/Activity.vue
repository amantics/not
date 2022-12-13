<template>
  <div class="activity">
    <div class="main">
      <p class="content">
        <span class="message">{{ Messages[data.message] }}</span>
        <span class="reference">#{{ data.reference }}</span>
      </p>
    </div>
    <p class="time">
      {{ intlFormatDistance(new Date(data.createdAt), new Date()) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  Messages,
  NotificationPayload,
} from "../../../../libs/shared/src/lib/notifications";
import { intlFormatDistance } from "date-fns";

interface Props {
  data: NotificationPayload;
}

const props = defineProps<Props>();
</script>

<style scoped lang="scss">
.activity {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .main {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;

    .avatar {
      font-size: 1.4rem;
      padding: 1rem;
      background-color: $secondary-color;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .content {
      font-size: 1.4rem;
      line-height: 2rem;

      .user {
        margin-right: 0.5rem;
      }

      .message {
        opacity: 0.5;
      }

      .reference {
        margin-left: 0.5rem;
      }
    }
  }

  .time {
    opacity: 0.3;
    font-size: 1.2rem;
  }
}
</style>
