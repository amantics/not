<template>
  <div class="options" v-if="options.length">
    <template v-for="(option, index) in options" :key="option.label + index">
      <div @click="option.action?.()" class="option" v-if="!option.name">
        <ion-icon
          :name="option.icon"
          v-if="option.icon"
          class="icon"
        ></ion-icon>
        <span class="text">{{ option.label }}</span>
      </div>
      <template v-else-if="!!option.name">
        <span class="name">{{ option.name }}</span>
        <DropdownOptions :options="option.options" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  options: TDropdownOptions[];
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.options {
  display: flex;
  flex-direction: column;

  .option {
    padding: 0.8rem 1.5rem;
    transition: all 0.2s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.3rem;

    .icon {
      font-size: 1.8rem;
    }

    &:hover {
      background-color: $secondary-hover-color;
    }
  }

  .name {
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    text-transform: uppercase;
    opacity: 0.3;
    margin: 0.5rem 0;
  }
}
</style>
