<template>
  <div class="operations">
    <h1>Engagement Notarié</h1>
    <operations-table :fields="fields">
      <template #cell(engagementNotaryFile)="data">
        <download-btn :value="data.value" v-if="data.value" />
        <v-tooltip
          text="engagementNotaryFile"
          :show="data.item.creditStatus !== CreditStatus.GRANTED"
          v-else
          ><span
            class="btn btn--primary"
            :class="[
              data.item.creditStatus !== CreditStatus.GRANTED &&
                'btn--disabled',
            ]"
            @click.stop="
              data.item.creditStatus === CreditStatus.GRANTED &&
                modalRef.toggle(true, data.item)
            "
            >ajouter fichier</span
          ></v-tooltip
        >
      </template>
    </operations-table>
    <modal ref="modalRef" title="Engagment Notarié" :on-submit="handleSubmit">
      <template #content>
        <v-label name="Engagment Notarié" class="group" @click.prevent>
          <FileInput
            ref="fileInputRef"
            show-list
            :max-files="1"
            v-model="notaryFile"
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
import Modal from "@components/Modal.vue";
import { ref } from "vue";
import VLabel from "@components/VLabel.vue";
import FileInput from "@components/FileInput.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";
import { CreditStatus } from "../../../../server/src/enums/creditStatus.enum";
import VTooltip from "@components/VTooltip.vue";

const fields = getFields([
  "reference",
  "buyers",
  "sellers",
  "date",
  "sellingFile",
  "creditStatus",
  "engagementNotaryFile",
]);
const modalRef = ref();
const notaryFile = ref(null);
const fileInputRef = ref();

const fetcher = useFetcher();
const handleSubmit = async () => {
  if (!notaryFile.value || !modalRef.value.selectedOperation) return false;
  const file = await fileInputRef.value?.uploadFiles();
  const res = await fetcher.put<TOperation>(
    `/operations/${modalRef.value.selectedOperation.reference}/engagement-notary`,
    {
      engagementNotaryFile: file,
    }
  );
  Object.assign(modalRef.value.selectedOperation, res);
  return true;
};
</script>

<style scoped lang="scss"></style>
