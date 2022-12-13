<template>
  <div class="operations">
    <h1>Paiement Impôts</h1>
    <operations-table :fields="fields">
      <template #cell(taxPaymentFile)="data">
        <download-btn
          :value="data.value"
          v-if="
            data.item.taxPaymentStatus === TaxPaymentStatus.PAID && data.value
          "
        />
        <v-tooltip
          :show="!data.item.minuteSignatureFile"
          v-else-if="data.item.taxPaymentStatus === TaxPaymentStatus.PENDING"
          text="taxPaymentFile"
          ><span
            @click.stop="
              data.item.minuteSignatureFile && modalRef.toggle(true, data.item)
            "
            class="btn btn--primary"
            :class="!data.item.minuteSignatureFile && 'btn--disabled'"
            >initialiser</span
          ></v-tooltip
        >
        <v-badge :value="TaxPaymentStatus.PENDING" v-else />
      </template>
    </operations-table>
    <modal
      ref="modalRef"
      title="Paiement d'impots"
      submit-text="Initialiser"
      :on-submit="handleSubmit"
    >
      <template #content>
        <div class="tax">
          <div class="tax__amount" v-for="tax in taxes" :key="tax.name">
            <span class="text">{{ tax.name }}</span>
            <span class="value"
              >{{ tax.render(modalRef.selectedOperation) }} DH</span
            >
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { getFields, padMoney } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import { TaxPaymentStatus } from "../../../../server/src/enums/taxPaymentStatus.enum";
import DownloadBtn from "@components/DownloadBtn.vue";
import VBadge from "@components/VBadge.vue";
import { TOperation } from "@/utils/types";
import useFetcher from "@/composables/useFetcher";
import Modal from "@components/Modal.vue";
import { ref } from "vue";
import VTooltip from "@components/VTooltip.vue";

const taxes = [
  {
    name: "Les frais d'acquisition (8%)",
    render: (operation: TOperation) => {
      return padMoney((operation.amount * 8) / 100);
    },
  },
  {
    name: "Tax d'enregistrement (1%)",
    render: (operation: TOperation) => {
      return padMoney(operation.amount / 100);
    },
  },
];

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
  "taxPaymentFile",
]);

const modalRef = ref<any>();

const fetcher = useFetcher();
const handleSubmit = async () => {
  if (!modalRef.value.selectedOperation) return false;
  const res = await fetcher.get<TOperation>(
    `/operations/${modalRef.value.selectedOperation.reference}/initiate-tax-payment`
  );
  Object.assign(modalRef.value.selectedOperation, res);
  return true;
};
</script>

<style lang="scss"></style>
