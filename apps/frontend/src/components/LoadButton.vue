<template>
  <button
    class="btn btn--primary"
    :class="[(loading || disabled) && 'btn--disabled']"
  >
    <Loader :loading="loading" v-if="loading" />
    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
import Loader from "@components/Loader.vue";

interface Props {
  loading: boolean;
  disabled?: boolean;
}

defineProps<Props>();
</script>

<style scoped lang="scss"></style>
