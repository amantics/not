<template>
  <div
    class="dropdown"
    v-click-outside="close"
    @click.stop="!disabled && (isOpen = !isOpen)"
    :style="{
      '--enter-translate-y':
        (positionY ?? 'bottom') === 'bottom' ? '-10%' : '10%',
    }"
  >
    <slot name="icon">
      <span class="btn" :class="[disabled && 'btn--disabled']">
        <ion-icon class="icon" :name="icon" />
      </span>
    </slot>

    <Transition>
      <div
        v-if="isOpen"
        class="menu"
        :class="[
          `menu--${positionY ?? 'bottom'}`,
          `menu--${positionX} ?? 'left'`,
        ]"
      >
        <DropdownOptions :options="options" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DropdownOptions from "@components/DropdownOptions.vue";

interface Props {
  icon: string;
  positionX?: "left" | "right";
  positionY?: "top" | "bottom";
  options: DropdownOption[];
  disabled?: boolean;
}

defineProps<Props>();

const isOpen = ref(false);
const close = () => {
  if (isOpen.value) {
    isOpen.value = false;
  }
};
</script>

<style scoped lang="scss">
.dropdown {
  position: relative;
  width: fit-content;
}

.btn {
  opacity: 0.5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: $secondary-color;
    opacity: 1;
  }

  &--disabled {
    opacity: 0.5;
    cursor: auto;

    &:hover {
      background-color: $secondary-color;
      opacity: 0.5;
    }
  }

  .icon {
    font-size: 1.4rem;
  }
}

$positionY: 120%;
.menu {
  z-index: 10;
  display: flex;
  position: absolute;
  flex-direction: column;
  background-color: $secondary-color;
  border-radius: 0.5rem;
  padding: 1rem 0;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);

  &--left {
    left: 0;
  }

  &--right {
    right: 0;
  }

  &--top {
    bottom: $positionY;
  }

  &--bottom {
    top: $positionY;
  }
}

.v-enter-active,
.v-leave-active {
  transition: all 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  transform: translateY(var(--enter-translate-y));
  opacity: 0;
}
</style>
