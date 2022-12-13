<template>
  <label class="label">
    <slot name="header">
      <span class="name">{{ name }}</span>
    </slot>
    <slot></slot>
    <span class="feedback" :class="[`feedback--${type}`]" v-if="message">
      {{ message }}
    </span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  message?: string;
  type?: "success" | "warning" | "error" | "info";
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.label {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .name {
    font-size: 1.4rem;
  }
}
</style>
