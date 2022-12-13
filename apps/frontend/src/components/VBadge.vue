<template>
  <div class="status">
    <ion-icon
      :key="status.icon"
      class="icon"
      :class="'status--' + value"
      :name="status.icon"
    />
    <span>{{ text ?? status.label }}</span>
  </div>
</template>

<script setup lang="ts">
import { CreditStatus } from "../../../server/src/enums/creditStatus.enum";
import { BeneficiaryPaymentStatus } from "../../../server/src/enums/beneficiaryPaymentStatus.enum";
import { enumLabels, statusIcons } from "@/utils/constants";
import { computed } from "vue";

interface Props {
  value: CreditStatus | BeneficiaryPaymentStatus | string;
  text?: string;
}

const props = defineProps<Props>();
const status = computed(() => {
  return { label: enumLabels[props.value], icon: statusIcons[props.value] };
});
</script>

<style scoped lang="scss">
.status {
  display: flex;
  gap: 1rem;
  font-size: 1.2rem;
  align-items: center;
  text-transform: capitalize;

  .icon {
    font-size: 2rem;
  }

  &--PENDING,
  &--INITIATED {
    color: $pending-color;
  }

  &--GRANTED,
  &--REALIZED {
    color: $success-color;
  }

  &--REJECTED {
    color: $fail-color;
  }
}
</style>
