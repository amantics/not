<template>
  <div class="operations">
    <h1>Dépôt à la CDG</h1>
    <operations-table :fields="fields">
      <template #cell(depositFile)="data">
        <v-badge
          v-if="data.item.depositStatus === DepositStatus.SIGNED"
          value="PENDING"
          text="En attente de confirmation CDG"
        />
        <download-btn :value="data.value" v-else-if="data.value" />
        <v-tooltip :show="!data.item.fundsUnblocked" v-else text="depositFile"
          ><span
            class="btn btn--primary"
            :class="!data.item.fundsUnblocked && 'btn--disabled'"
            @click.stop="
              data.item.fundsUnblocked && modalRef.toggle(true, data.item)
            "
            >Déposer</span
          ></v-tooltip
        >
      </template>
    </operations-table>
    <modal
      submit-text="Signer"
      ref="modalRef"
      title="Signature de dépôt"
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
        </div>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { getFields, padMoney } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import DownloadBtn from "@components/DownloadBtn.vue";
import { ref } from "vue";
import Modal from "@components/Modal.vue";
import { DepositStatus } from "../../../../server/src/enums/depositStatus.enum";
import VBadge from "@components/VBadge.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";
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
]);

const fetcher = useFetcher();
const handleSubmit = async () => {
  const res = await fetcher.put<TOperation>(
    `/operations/${modalRef.value.selectedOperation.reference}/sign-deposit`
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

.operation {
  display: flex;
  font-size: 1.3rem;
  gap: 0.5rem;
  align-items: center;

  .label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.3;
  }

  .reference {
  }
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
