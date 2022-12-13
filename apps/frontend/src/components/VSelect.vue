<template>
  <div
    class="select"
    @click="!disabled && (isOpen = !isOpen)"
    v-click-outside="close"
    tabindex="0"
    type="select"
  >
    <div class="current">
      {{ modelValue }}
      <ion-icon :name="`chevron-${isOpen ? 'up' : 'down'}-outline`"></ion-icon>
    </div>
    <div
      class="options"
      :class="[`options--${position ?? 'bottom'}`]"
      v-if="isOpen"
    >
      <div
        class="option"
        :class="[option.value === modelValue && 'selected']"
        v-for="(option, index) in options"
        :key="index"
        @click="select(option.value)"
      >
        {{ option.label ?? option.value }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props<T = string[]> {
  modelValue: T;
  options: { label: string; value: T }[];
  disabled?: boolean;
  position: "top" | "bottom";
}

defineProps<Props>();

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const close = () => {
  if (isOpen.value) {
    isOpen.value = false;
  }
};

const select = (option: Props["modelValue"]) => {
  emit("update:modelValue", option);
};
</script>

<style scoped lang="scss">
.select {
  position: relative;

  .current {
    border: 1px solid $line-color;
    padding: 1rem;
    background-color: $secondary-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.4rem;
  }

  $y-position: 110%;

  .options {
    position: absolute;
    left: 0;
    min-width: 100%;
    background-color: $secondary-color;
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    padding: 1rem 0;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
    z-index: 10;

    &--top {
      bottom: $y-position;
    }

    &--bottom {
      top: $y-position;
    }

    .option {
      padding: 0.8rem 1.5rem;
      transition: all 0.2s ease;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.3rem;

      &:hover {
        background-color: $secondary-hover-color;
      }
    }

    .selected {
      background-color: $secondary-hover-color;
    }
  }
}
</style>
