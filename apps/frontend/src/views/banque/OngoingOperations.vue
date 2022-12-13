<template>
  <div class="operations">
    <h1>Déblocage des fonds</h1>
    <operations-table :fields="fields">
      <template #cell(fundsUnblocked)="data">
        <v-badge
          v-if="data.value"
          :value="data.value ? 'GRANTED' : 'PENDING'"
          :text="data.value ? 'débloqué' : 'non encore débloqué'"
        />
        <v-tooltip
          :show="!data.item.engagementNotaryFile"
          text="fundsUnblocked"
          v-else
        >
          <load-button
            :loading="fetcher.loading.value.includes(data.item.reference)"
            :class="!data.item.engagementNotaryFile && 'btn--disabled'"
            @click.stop="
              data.item.engagementNotaryFile && unlockFunds(data.item)
            "
            >Débloquer
          </load-button>
        </v-tooltip>
      </template>
    </operations-table>
  </div>
</template>

<script setup lang="ts">
import { getFields } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import VBadge from "@components/VBadge.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";
import LoadButton from "@components/LoadButton.vue";
import VTooltip from "@components/VTooltip.vue";

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
]);

const fetcher = useFetcher();
const unlockFunds = async (operation: TOperation) => {
  const res = await fetcher.get<TOperation>(
    `/operations/${operation.reference}/unblock-funds`
  );
  Object.assign(operation, res);
  return true;
};
</script>

<style scoped lang="scss"></style>
