<template>
  <div class="sales">
    <p class="name">Opérations récentes</p>
    <operations-table :fields="fields" :items="items"></operations-table>
  </div>
</template>

<script setup lang="ts">
import OperationsTable from "@components/OperationsTable.vue";
import { getFields } from "@/utils/helpers";
import { inject } from "vue";

const items = inject("items", []);

const fields = getFields([
  "reference",
  "buyers",
  "sellers",
  "date",
  "amount",
  "creditStatus",
]);
</script>

<style scoped lang="scss">
.sales {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .name {
    text-transform: capitalize;
    font-size: 1.4rem;
  }
}
</style>
