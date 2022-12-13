<template>
  <a
    :href="value ? downloadInfo?.url : '#'"
    class="download"
    :class="[!value && 'download--disabled']"
    :title="`${downloadInfo?.name}`"
    :target="value ? '_blank' : ''"
    @click.stop
  >
    <ion-icon
      name="download-outline"
      :title="downloadInfo?.name ?? 'download'"
    />
  </a>
</template>

<script setup lang="ts">
import { parseIPFSDownloadInfo } from "@/utils/helpers";
import { computed } from "vue";

interface Props {
  value: string;
}

const props = defineProps<Props>();
const downloadInfo = computed(() => parseIPFSDownloadInfo(props.value));
</script>

<style scoped lang="scss">
.download {
  font-size: 2rem;
  background-color: $secondary-color;
  border-radius: 0.5rem;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: $secondary-hover-color;
  }

  &--disabled {
    cursor: auto;
    opacity: 0.5;

    &:hover {
      background-color: $secondary-color;
    }
  }
}
</style>
