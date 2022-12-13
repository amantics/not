<template>
  <div class="operations">
    <h1>Paiement des Impôts</h1>
    <operations-table :fields="fields" />
  </div>
</template>

<script setup lang="ts">
import { getFields } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";

const fields = getFields([
  "reference",
  "buyers",
  "sellers",
  "date",
  "sellingFile",
  "creditStatus",
  "engagementNotaryFile",
  "fundsUnblocked",
  "amount",
  "depositFile",
  "minuteSignatureFile",
  "taxPaymentFile",
  "guaranteeFiles",
  "beneficiaryPaymentStatus",
  "ended",
]);
</script>

<style scoped lang="scss"></style>
