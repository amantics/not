<template>
  <div class="operations">
    <h1>Signature de la minute</h1>
    <operations-table :fields="fields">
      <template #cell(minuteSignatureFile)="data">
        <download-btn :value="data.value" v-if="data.value" />
        <v-tooltip
          :show="data.item.depositStatus !== DepositStatus.ACCEPTED"
          text="minuteSignatureFile"
          v-else
          ><span
            class="btn btn--primary"
            :class="
              data.item.depositStatus !== DepositStatus.ACCEPTED &&
              'btn--disabled'
            "
            @click.stop="
              data.item.depositStatus === DepositStatus.ACCEPTED &&
                modalRef.toggle(true, data.item)
            "
            >ajouter fichier</span
          ></v-tooltip
        >
      </template>
    </operations-table>
    <modal ref="modalRef" title="Signature Minute" :on-submit="handleSubmit">
      <template #content>
        <v-label name="Minute Fichier" class="group" @click.prevent>
          <FileInput
            ref="fileInputRef"
            show-list
            :max-files="1"
            v-model="minuteFile"
          />
        </v-label>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { getFields } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import DownloadBtn from "@components/DownloadBtn.vue";
import { ref } from "vue";
import VLabel from "@components/VLabel.vue";
import FileInput from "@components/FileInput.vue";
import Modal from "@components/Modal.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";
import { DepositStatus } from "../../../../server/src/enums/depositStatus.enum";
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
const modalRef = ref();
const minuteFile = ref(null);

const fileInputRef = ref();

const fetcher = useFetcher();
const handleSubmit = async () => {
  if (!minuteFile.value || !modalRef.value.selectedOperation) return false;
  const file = await fileInputRef.value?.uploadFiles();
  const res = await fetcher.put<TOperation>(
    `/operations/${modalRef.value.selectedOperation.reference}/minute-file`,
    {
      minuteSignatureFile: file,
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
