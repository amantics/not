<template>
  <button
    class="btn btn--primary"
    @click.stop="!disabled && $emit('handleClick')"
    :class="disabled && 'btn--disabled'"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean;
}

defineProps<Props>();
</script>

<style scoped lang="scss"></style>
