<template>
  <div class="container">
    <div class="header">
      <p class="name">Activités récentes</p>
    </div>
    <div class="list">
      <template v-if="!notifications.length"
        ><p class="placeholder">Pas encore d'activités</p></template
      >

      <template v-else>
        <Activity
          v-for="notification in notifications"
          :key="notification.createdAt"
          :data="notification"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Activity from "@components/Activity";
import { inject, ref } from "vue";
import { NotificationPayload } from "../../../../libs/shared/src/lib/notifications";

const notifications = inject("notifications", ref<NotificationPayload[]>([]));
</script>

<style scoped lang="scss">
.placeholder {
  opacity: 0.4;
  text-align: center;
  font-size: 1.4rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  padding: 1rem;
  display: flex;
  @include desktop {
    overflow: auto;
    max-height: 100vh;
    min-height: 100vh;
  }

  flex-direction: column;
  gap: 1rem;
  @include tablet {
    padding: 1rem 2rem;
  }
  @include desktop {
    background-color: $secondary-bg-color;
    padding: 2rem;
    gap: 2rem;
  }

  .list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
}

.header {
  text-transform: capitalize;
  font-size: 1.5rem;
}
</style>
