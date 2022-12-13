<template>
  <div class="operations">
    <h1>Paiement Bénéficiaires</h1>
    <operations-table :fields="fields">
      <template #cell(beneficiaryPaymentStatus)="data">
        <span
          v-if="data.value === BeneficiaryPaymentStatus.INITIATED"
          class="btn btn--primary"
          @click.stop="modalRef.toggle(true, data.item)"
          >Payer</span
        >
        <v-badge :value="data.value" v-else />
      </template>
    </operations-table>
    <modal
      submit-text="Payer"
      ref="modalRef"
      title="Payer bénéficiaire"
      :on-submit="handleSubmit"
    >
      <template #content>
        <div class="content">
          <div class="list">
            <span class="label">Beneficiary ID</span
            ><span class="label">Montant (MAD)</span>
            <template
              v-for="beneficiary in modalRef.selectedOperation.beneficiaries"
              :key="beneficiary.id"
            >
              <span class="id">{{
                beneficiary.id ?? beneficiary.beneficiaryId
              }}</span>
              <span class="amount">{{ padMoney(beneficiary.amount) }} DH</span>
            </template>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { getFields, padMoney } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import { BeneficiaryPaymentStatus } from "../../../../server/src/enums/beneficiaryPaymentStatus.enum";
import { ref } from "vue";
import VBadge from "@components/VBadge.vue";
import Modal from "@components/Modal.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";

const modalRef = ref<any>();

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
const handleSubmit = async () => {
  if (!modalRef.value.selectedOperation) return false;
  const res = await fetcher.put<TOperation>(
    `/operations/${modalRef.value.selectedOperation.reference}/pay-beneficiary`
  );
  Object.assign(modalRef.value.selectedOperation, res);
  return true;
};
</script>

<style scoped lang="scss">
.input {
  padding: 1rem;
  background-color: $secondary-color;
  border: 1px solid $line-color;
  transition: all 0.2s ease;
  color: $primary-text-color;

  &:focus {
    border-color: $primary-color;
    outline: none;
  }
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  row-gap: 2rem;
  margin-top: 1rem;
  align-items: flex-end;

  .label {
    opacity: 0.5;
    font-size: 1.4rem;
  }

  .id {
    font-size: 1.8rem;
  }

  .amount {
    font-size: 3rem;
    font-weight: bold;
  }
}
</style>
