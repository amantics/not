<template>
  <div class="operations">
    <h1>Dépôt des fonds à la CDG</h1>
    <operations-table :fields="fields">
      <template #cell(depositFile)="data">
        <download-btn :value="data.value" v-if="data.value" />
        <v-badge
          v-else-if="data.item.depositStatus !== DepositStatus.SIGNED"
          value="PENDING"
          text="non encore signé"
        />
        <span
          v-else
          class="btn btn--primary"
          @click.stop="modalRef.toggle(true, data.item)"
          >Accepter</span
        >
      </template>
    </operations-table>
    <modal
      submit-text="Confirmer"
      ref="modalRef"
      title="Acceptation de dépôt"
      :on-submit="handleSubmit"
    >
      <template #content>
        <div class="content">
          <div class="amount">
            <span class="text">Montant (MAD)</span>
            <span class="value"
              >{{ padMoney(modalRef.selectedOperation.amount) }} MAD</span
            >
          </div>
          <v-label name="Reçu de dépôt" class="group" @click.prevent>
            <FileInput
              ref="fileInputRef"
              show-list
              :max-files="1"
              v-model="depositFile"
            />
          </v-label>
        </div>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { getFields, padMoney } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import { DepositStatus } from "../../../../server/src/enums/depositStatus.enum";
import VBadge from "@components/VBadge.vue";
import DownloadBtn from "@components/DownloadBtn.vue";
import { ref } from "vue";
import { RefValue } from "vue/macros";
import Modal from "@components/Modal.vue";
import VLabel from "@components/VLabel.vue";
import FileInput from "@components/FileInput.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";

const modalRef = ref<any>();

const depositFile = ref<RefValue<File>>();

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
]);

const fileInputRef = ref();

const fetcher = useFetcher();
const handleSubmit = async () => {
  if (!depositFile.value || !modalRef.value.selectedOperation) return false;
  const file = await fileInputRef.value?.uploadFiles();
  const res = await fetcher.put<TOperation>(
    `/operations/${modalRef.value.selectedOperation.reference}/accept-deposit`,
    {
      depositFile: file,
    }
  );
  Object.assign(modalRef.value.selectedOperation, res);

  return true;
};
</script>

<style scoped lang="scss">
.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.amount {
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 0.5rem;
  padding: 2rem 0;

  .value {
    font-size: 4rem;
    font-weight: bold;
  }

  .text {
    font-size: 1.2rem;
    opacity: 0.3;
  }
}
</style>
