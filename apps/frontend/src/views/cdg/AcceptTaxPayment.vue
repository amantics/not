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
        <span
          v-else-if="
            data.item.taxPaymentStatus === TaxPaymentStatus.INITIALIZED
          "
          @click.stop="modalRef.toggle(true, data.item)"
          class="btn btn--primary"
          >Accepter
        </span>

        <v-badge
          :value="TaxPaymentStatus.PENDING"
          :text="
            TaxPaymentStatus.PENDING === data.item.taxPaymentStatus
              ? 'pas encore initié'
              : 'pas encore payé'
          "
          v-else
        />
      </template>
    </operations-table>
    <modal
      ref="modalRef"
      title="Paiement d'impots"
      submit-text="Accepter"
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
import DownloadBtn from "@components/DownloadBtn.vue";
import { TaxPaymentStatus } from "../../../../server/src/enums/taxPaymentStatus.enum";
import VBadge from "@components/VBadge.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";
import Modal from "@components/Modal.vue";
import { ref } from "vue";

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

const fetcher = useFetcher();
const handleSubmit = async () => {
  if (!modalRef.value.selectedOperation) return false;

  const res = await fetcher.get<TOperation>(
    `/operations/${modalRef.value.selectedOperation.reference}/accept-tax-payment`
  );
  Object.assign(modalRef.value.selectedOperation, res);
  return true;
};
</script>

<style scoped lang="scss"></style>
