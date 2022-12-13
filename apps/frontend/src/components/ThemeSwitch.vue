<template>
  <div class="switch" :class="[currentTheme]">
    <span
      v-if="showNames ?? true"
      @click="currentTheme = 'dark'"
      class="name"
      :class="[currentTheme === 'dark' && 'name--active']"
      >dark</span
    >
    <div
      class="track"
      @click="currentTheme = currentTheme === 'dark' ? 'light' : 'dark'"
    >
      <span class="ball" />
    </div>
    <span
      v-if="showNames ?? true"
      class="name"
      @click="currentTheme = 'light'"
      :class="[currentTheme === 'light' && 'name--active']"
      >light</span
    >
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";

const currentTheme = inject("theme");

interface Props {
  showNames?: boolean;
}

defineProps<Props>();
</script>

<style lang="scss">
.switch {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 auto;
  margin-top: auto;

  .name {
    cursor: pointer;
    font-size: 1.1rem;
    text-transform: uppercase;
    font-weight: 600;
    opacity: 0.5;
    transition: all 0.2s ease;

    &--active {
      opacity: 1;
    }
  }
}

.track {
  padding: 0.5rem;
  display: flex;
  align-items: center;
  border-radius: 2rem;
  width: 3.5rem;
  cursor: pointer;
  position: relative;
  background-color: $theme-track-color;
  overflow: hidden;

  .ball {
    @include size(1.2rem);
    display: inline-block;
    border-radius: 100%;
    background-color: $theme-ball-color;
    position: relative;
    overflow: hidden;
    left: 55%;
    transition: left 0.3s ease;

    &:after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 100%;
      @include size(100%);
      border-radius: 5rem;
      background-color: $theme-track-color;
      transition: all 0.2s ease;
      opacity: 0;
    }
  }
}

.dark {
  .track {
    .ball {
      overflow: revert;
      left: 0;

      &:after {
        left: 50%;
        opacity: 1;
      }
    }
  }
}
</style>
