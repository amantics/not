<template>
  <div :class="show && 'tooltip__wrapper'">
    <slot></slot>
    <span class="tooltip__text" v-if="show"
      ><span class="inner">{{ disabledReasons[text] }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { disabledReasons } from "@/utils/constants";

interface Props {
  text: keyof typeof disabledReasons;
  show?: boolean;
}

defineProps<Props>();
</script>

<style lang="scss">
$bg: $primary-bg-color;

.tooltip {
  &__wrapper {
    width: fit-content;
    position: relative;

    &:after {
      position: absolute;
      content: "";
      top: 50%;
      right: 110%;
      transform: translate(1rem, -50%) rotate(45deg);
      z-index: 3;
      background-color: $bg;

      width: 2rem;
      height: 1rem;
      display: inline-block;
      transition: all 0.2s ease;
      opacity: 0;
    }

    &:hover {
      .tooltip__text {
        transform: translate(0, -50%);
        opacity: 1;
      }

      &:after {
        transform: translate(0, -50%) rotate(45deg);
        opacity: 1;
      }
    }
  }

  &__text {
    position: absolute;
    top: 50%;
    width: fit-content;
    right: 115%;
    background-color: $bg;
    padding: 0.8rem 1rem;
    pointer-events: none;
    z-index: 2;
    border-radius: 0.5rem;
    min-width: 18rem;
    display: inline-block;
    transform: translate(1rem, -50%);
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    opacity: 0;

    .inner {
      font-size: 1.4rem;
      opacity: 0.5;
    }
  }
}
</style>
