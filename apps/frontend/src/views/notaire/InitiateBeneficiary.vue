<template>
  <div class="operations">
    <h1>Paiement Bénéficiaires</h1>
    <operations-table :fields="fields">
      <template #cell(beneficiaryPaymentStatus)="data">
        <v-tooltip
          :show="!data.item.guaranteeFiles"
          v-if="data.value === BeneficiaryPaymentStatus.PENDING"
          text="beneficiaryPaymentStatus"
          ><span
            class="btn btn--primary"
            :class="!data.item.guaranteeFiles && 'btn--disabled'"
            @click.stop="
              !!data.item.guaranteeFiles && modalRef.toggle(true, data.item)
            "
            >initialiser</span
          ></v-tooltip
        >
        <v-badge :value="data.value" v-else />
      </template>
    </operations-table>
    <modal
      submit-text="Initialiser"
      ref="modalRef"
      title="Initialiser paiement bénéficiaire"
      :on-submit="handleSubmit"
    >
      <template #content>
        <div class="content">
          <div class="list">
            <span class="column">ID du Bénéficiaire</span>
            <span class="column" :style="{ gridColumn: '2/-1' }"
              >Montant(MAD)</span
            >
            <template v-for="input in inputs" :key="input.id">
              <input
                type="text"
                class="id"
                v-model="input.beneficiaryId"
                placeholder="Beneficiary ID"
              />
              <money-input sign="DH" v-model.number="input.amount" />
              <span
                title="remove entry"
                class="remove"
                @click="removeInput(input.id)"
                ><ion-icon name="close-outline"
              /></span>
            </template>
            <span class="add" @click="addInput()"
              ><ion-icon name="add-outline"></ion-icon
            ></span>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { generateId, getFields } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import { BeneficiaryPaymentStatus } from "../../../../server/src/enums/beneficiaryPaymentStatus.enum";
import { ref } from "vue";
import VBadge from "@components/VBadge.vue";
import Modal from "@components/Modal.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";
import MoneyInput from "@components/MoneyInput.vue";
import VTooltip from "@components/VTooltip.vue";

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
  const beneficiaries = inputs.value
    .map((input) => ({
      id: input.beneficiaryId,
      amount: input.amount,
    }))
    .filter((input) => input.id && input.amount);

  if (!inputs.value.length || !modalRef.value.selectedOperation) return false;

  const res = await fetcher.put<TOperation>(
    `/operations/${modalRef.value.selectedOperation.reference}/initiate-beneficiary`,
    {
      beneficiaries,
    }
  );
  Object.assign(modalRef.value.selectedOperation, res);
  inputs.value = [];
  return true;
};
const initialInputState = {
  id: generateId(),
  beneficiaryId: "",
  amount: 0,
};

const addInput = () => {
  inputs.value.push({ ...initialInputState, id: generateId() });
};
const removeInput = (id: string) => {
  inputs.value = inputs.value.filter((input) => input.id !== id);
};
const inputs = ref<{ id: string; beneficiaryId: string; amount: number }[]>([
  { ...initialInputState },
]);
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
  grid-template-columns: repeat(2, 1fr) auto;
  gap: 1rem;
  align-items: center;

  input {
    width: 100%;
  }

  .column {
    font-size: 1.4rem;

    &:nth-child(2) {
      grid-column: 2 / -1;
    }
  }

  .id {
    padding: 1rem;
    background-color: transparent;
    color: $primary-text-color;
    border: 1px solid $line-color;

    &:focus {
      outline: none;
    }
  }

  .remove {
    opacity: 0.5;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: flex-end;
    background-color: $primary-bg-color;
    padding: 0.5rem;
    border-radius: 0.5rem;

    &:hover {
      opacity: 1;
    }
  }

  .add {
    grid-column: 1 / -2;
    background-color: $primary-bg-color;
    opacity: 0.5;
    padding: 0.5rem;
    cursor: pointer;
    text-align: center;
    font-size: 2rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
