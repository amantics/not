<template>
  <div class="operations">
    <h1>Paiement des Impôts</h1>
    <operations-table :fields="fields">
      <template #cell(taxPaymentFile)="data">
        <download-btn
          :value="data.value"
          v-if="
            data.item.taxPaymentStatus === TaxPaymentStatus.PAID && data.value
          "
        />
        <span
          v-else-if="data.item.taxPaymentStatus === TaxPaymentStatus.ACCEPTED"
          @click.stop="modalRef.toggle(true, data.item)"
          class="btn btn--primary"
          >Payer</span
        >
        <v-badge :value="TaxPaymentStatus.PENDING" v-else />
      </template>
    </operations-table>
    <modal
      ref="modalRef"
      title="Paiement d'impots"
      submit-text="payer"
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
        <v-label name="Recu de paiement" class="group" @click.prevent>
          <FileInput
            ref="fileInputRef"
            show-list
            :max-files="1"
            v-model="taxPaymentFile"
          />
        </v-label>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { getFields, padMoney } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import { TaxPaymentStatus } from "../../../../server/src/enums/taxPaymentStatus.enum";
import VBadge from "@components/VBadge.vue";
import DownloadBtn from "@components/DownloadBtn.vue";
import Modal from "@components/Modal.vue";
import VLabel from "@components/VLabel.vue";
import FileInput from "@components/FileInput.vue";
import { ref } from "vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";

const taxPaymentFile = ref();
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
  "taxPaymentFile",
]);

const fileInputRef = ref();
const fetcher = useFetcher();
const handleSubmit = async () => {
  if (!taxPaymentFile.value || !modalRef.value.selectedOperation) return false;
  const file = await fileInputRef.value?.uploadFiles();
  const res = await fetcher.put<TOperation>(
    `/operations/${modalRef.value.selectedOperation.reference}/pay-tax`,
    {
      taxPaymentFile: file,
    }
  );
  Object.assign(modalRef.value.selectedOperation, res);
  return true;
};

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
</script>

<style lang="scss"></style>
