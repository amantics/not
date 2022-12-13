<template>
  <div class="operations">
    <h1>Décisions crédit</h1>
    <operations-table :fields="fields">
      <template #cell(creditStatus)="data">
        <v-badge
          v-if="data.value !== CreditStatus.PENDING"
          :value="data.value"
        ></v-badge>
        <div v-else class="status-btns">
          <Loader
            :loading="fetcher.loading.value.includes(data.item.reference)"
          >
            <span
              class="accept"
              @click.stop="changeCreditStatus(data.item, CreditStatus.GRANTED)"
              >Accorder</span
            >
            <span
              class="refuse"
              @click.stop="changeCreditStatus(data.item, CreditStatus.REJECTED)"
              >Rejeter</span
            >
          </Loader>
        </div>
      </template>
    </operations-table>
  </div>
</template>

<script setup lang="ts">
import { getFields } from "@/utils/helpers";
import OperationsTable from "@components/OperationsTable.vue";
import VBadge from "@components/VBadge.vue";
import { CreditStatus } from "../../../../server/src/enums/creditStatus.enum";
import { TOperation } from "@/utils/types";
import useFetcher from "@/composables/useFetcher";
import Loader from "@components/Loader.vue";

const fields = getFields([
  "reference",
  "buyers",
  "sellers",
  "date",
  "sellingFile",
  "creditStatus",
]);

const fetcher = useFetcher();
const changeCreditStatus = async (
  operation: TOperation,
  status: CreditStatus
) => {
  const res = await fetcher.put<TOperation>(
    `/operations/${operation.reference}/credit-status`,
    {
      creditStatus: status,
    }
  );
  Object.assign(operation, res);
  return true;
};
</script>

<style scoped lang="scss">
.status-btns {
  display: flex;
  font-size: 1.2rem;
  gap: 1rem;
  align-items: center;

  span {
    padding: 0.8rem;
    background-color: $primary-color;
    color: $secondary-color;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .refuse {
    background-color: transparent;
    color: $fail-color;
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }

  .accept {
    &:hover {
      background-color: $primary-hover-color;
    }
  }
}
</style>
