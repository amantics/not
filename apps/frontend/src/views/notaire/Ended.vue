<template>
  <div class="operations">
    <h1>Apurement</h1>
    <operations-table :fields="fields">
      <template #cell(ended)="data">
        <v-badge v-if="data.value" value="GRANTED" text="apurée" />
        <v-tooltip
          :show="
            data.item.beneficiaryPaymentStatus !== BeneficiaryPaymentStatus.PAID
          "
          v-else
          text="ended"
          ><span
            class="btn btn--primary"
            :class="
              data.item.beneficiaryPaymentStatus !==
                BeneficiaryPaymentStatus.PAID && 'btn--disabled'
            "
            @click.stop="
              data.item.beneficiaryPaymentStatus ===
                BeneficiaryPaymentStatus.PAID &&
                modalRef.toggle(true, data.item)
            "
            >Apurer</span
          ></v-tooltip
        >
      </template>
    </operations-table>
    <modal
      submit-text="Apurer"
      ref="modalRef"
      title="Apurement d'opération"
      :on-submit="handleSubmit"
    >
      <template #content>
        <div class="content">
          <p class="warning">
            <span>Voulez-vous apurer l'opération</span>
            <span class="reference"
              >"{{ modalRef.selectedOperation.reference }}"</span
            ><span>?</span>
          </p>
        </div>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { getFields } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import VBadge from "@components/VBadge.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";
import Modal from "@components/Modal.vue";
import { ref } from "vue";
import { BeneficiaryPaymentStatus } from "../../../../server/src/enums/beneficiaryPaymentStatus.enum";
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
  "ended",
]);
const modalRef = ref();

const fetcher = useFetcher();
const handleSubmit = async () => {
  const operation = modalRef.value.selectedOperation;
  const res = await fetcher.put<TOperation>(
    `/operations/${operation.reference}/end`
  );
  Object.assign(operation, res);
  return true;
};
</script>

<style scoped lang="scss">
.warning {
  padding: 1rem 0;
  font-size: 1.4rem;

  span {
    opacity: 0.7;
    margin-right: 0.3rem;
  }

  .reference {
    font-weight: bold;
    opacity: 1;
  }
}
</style>
