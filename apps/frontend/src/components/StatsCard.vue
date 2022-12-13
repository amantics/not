<template>
  <div
    class="card"
    :class="[
      percentage !== undefined &&
        (percentage >= 0 ? 'card--win' : 'card--loss'),
      withArrows && 'card--arrows',
    ]"
  >
    <div class="header">
      <span class="icon" v-if="icon"><ion-icon :name="icon" /></span>
      <span class="name">{{ name }}</span>
    </div>
    <p class="content">{{ content }}</p>
    <div class="stats">
      <span class="percentage" v-if="percentage !== undefined"
        ><ion-icon class="arrow" name="arrow-up" />{{ percentage }}%</span
      >
      <span class="extra" v-if="extra">{{ extra }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string;
  name: string;
  content: string | number;
  percentage?: number;
  extra?: string;
  withArrows?: boolean;
}

const props = defineProps<Props>();
</script>

<style scoped lang="scss">
$top-first: 20%;
$top-last: 60%;
.card {
  display: flex;
  background-color: $secondary-bg-color;
  flex-direction: column;
  padding: 1.5rem;
  overflow: hidden;
  transition: all 0.2s ease;
  gap: 1rem;
  position: relative;

  &:hover {
    &:before,
    &:after {
      transform: translateY(0);
      opacity: 1;
    }

    .percentage {
      color: $secondary-color;
    }

    .extra {
      color: $secondary-color;
    }
  }

  @include tablet {
    padding: 1.5rem 2rem;
  }

  & > * {
    z-index: 2;
  }

  &--arrows {
    &:after,
    &:before {
      position: absolute;
      content: "";
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease;
      transform: translateY($top-first);
      @include size(60%, 40%);
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      top: $top-first;
      left: 45%;
      z-index: 1;
      background: linear-gradient(
        0deg,
        rgba(white, 0) 0%,
        rgba(white, 0.3) 100%
      );
    }

    &:before {
      top: $top-last;
    }
  }

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;

    .icon {
      display: flex;
      font-size: 1.8rem;
      padding: 1rem;
      border-radius: 50%;
      background-color: $tritiary-color;
      color: $primary-text-color;
    }

    .name {
      font-size: 1.5rem;

      &:first-letter {
        text-transform: uppercase;
      }
    }
  }

  &:hover {
    .icon {
      color: var(--color, $primary-color);
    }
  }

  .content {
    margin-top: 0.5rem;
    font-size: 3rem;
    font-weight: bold;
  }

  .stats {
    display: flex;
    gap: 1rem;
    font-size: 1.4rem;

    .percentage {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .extra {
      color: rgba($line-color, 0.3);
    }
  }

  &--win {
    &:hover {
      background-color: $success-color;
      color: $secondary-color;

      .icon {
        color: $success-color;
      }
    }

    .percentage {
      color: $success-color;

      .arrow {
        transform: rotate(45deg);
      }
    }
  }

  &--loss {
    $rotation: 180deg;

    &:after,
    &:before {
      transform: rotate($rotation) translateY($top-first);
      top: revert;
      bottom: $top-first;
    }

    &:before {
      bottom: $top-last;
    }

    &:hover {
      background-color: $fail-color;
      color: $secondary-color;

      .icon {
        color: $fail-color;
      }

      &:before,
      &:after {
        transform: translateY(0) rotate($rotation);
      }
    }

    .percentage {
      color: $fail-color;

      .arrow {
        transform: rotate(150deg);
      }
    }
  }
}
</style>
