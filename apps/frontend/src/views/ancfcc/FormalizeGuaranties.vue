<template>
  <div class="operations">
    <h1>Paiement des Impôts</h1>
    <operations-table :fields="fields">
      <template #cell(guaranteeFiles)="data">
        <dropdown
          v-if="data.value?.length"
          icon="cloud-download-outline"
          position-x="right"
          :position-y="
            data.index >= operationsData.length - 4 ? 'top' : 'bottom'
          "
          :options="generateGuaranteeOptions(data.value)"
          :disabled="data.length === 0"
        />
        <v-tooltip
          v-else
          :show="data.item.taxPaymentStatus !== TaxPaymentStatus.PAID"
          text="guaranteeFiles"
          ><span
            class="btn btn--primary"
            :class="
              data.item.taxPaymentStatus !== TaxPaymentStatus.PAID &&
              'btn--disabled'
            "
            @click.stop="
              data.item.taxPaymentStatus === TaxPaymentStatus.PAID &&
                modalRef.toggle(true, data.item)
            "
            >Charger Garantie</span
          ></v-tooltip
        >
      </template>
    </operations-table>
    <modal
      ref="modalRef"
      title="Formalization de garantie"
      :on-submit="handleSubmit"
    >
      <template #content>
        <v-label name="Guarantie" class="group" @click.prevent>
          <FileInput ref="fileInputRef" show-list v-model="guaranteeFiles" />
        </v-label>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { generateGuaranteeOptions, getFields } from "@/utils/helpers";
import { operationsData } from "@/utils/data";
import OperationsTable from "@components/OperationsTable.vue";
import Dropdown from "@components/Dropdown.vue";
import Modal from "@components/Modal.vue";
import VLabel from "@components/VLabel.vue";
import FileInput from "@components/FileInput.vue";
import { ref } from "vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";
import { TaxPaymentStatus } from "../../../../server/src/enums/taxPaymentStatus.enum";
import VTooltip from "@components/VTooltip.vue";

const modalRef = ref();
const guaranteeFiles = ref([]);

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
  "guaranteeFiles",
]);
const fileInputRef = ref();
const fetcher = useFetcher();
const handleSubmit = async () => {
  if (!guaranteeFiles.value.length || !modalRef.value.selectedOperation)
    return false;
  const files = await fileInputRef.value?.uploadFiles();
  const res = await fetcher.put<Partial<TOperation>>(
    `/operations/${modalRef.value.selectedOperation.reference}/formalize-guaranties`,
    {
      guaranteeFiles: files,
    }
  );
  Object.assign(modalRef.value.selectedOperation, res);
  return true;
};
</script>

<style scoped lang="scss">
.btn {
  white-space: nowrap;
}
</style>
