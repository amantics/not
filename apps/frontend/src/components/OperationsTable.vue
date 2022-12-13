<template>
  <div class="table-container">
    <div class="controls">
      <div class="search">
        <ion-icon name="search-outline" class="icon" />
        <input
          type="text"
          placeholder="Recherche d'opérations par référence, vendeurs ou acheteurs"
          v-model.trim="search"
        />
        <ion-icon
          name="close-outline"
          class="clear"
          v-if="search"
          @click="search = ''"
        />
      </div>
    </div>
    <div class="table">
      <table :class="props.class">
        <thead>
          <tr>
            <th :key="field.key" v-for="field in fields">
              {{ field.label ?? field.key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="!itemsList.length">
            <tr class="placeholder">
              <td :colspan="fields.length">
                <span>Aucune opération trouvée </span>
                <template v-if="search.length"
                  ><span>pour </span>
                  <span class="text">'{{ search }}'</span></template
                >
              </td>
            </tr>
          </template>
          <template v-else>
            <template :key="index" v-for="(operation, index) in itemsList">
              <tr
                class="row"
                @click="operationDetailsRef.toggle(true, operation)"
              >
                <td
                  class="cell"
                  v-for="field in fields"
                  :key="field.key + index"
                >
                  <slot
                    :name="'cell(' + field.key + ')'"
                    v-bind="{
                      item: operation,
                      value: operation[field.key],
                      index,
                      items,
                    }"
                  >
                    <div
                      v-if="['sellers', 'buyers'].includes(field.key)"
                      v-html="highlightText(operation[field.key].join(', '))"
                    />
                    <template
                      v-else-if="
                        ['date', 'createdAt', 'updateAt'].includes(field.key)
                      "
                      >{{ format(new Date(operation[field.key]), "P") }}
                    </template>

                    <v-badge
                      v-else-if="isPending(field.key, operation)"
                      :value="DepositStatus.PENDING"
                    />
                    <download-btn
                      :value="operation[field.key]"
                      v-else-if="downloadableFields.includes(field.key)"
                    />
                    <v-badge
                      v-else-if="statusFields.includes(field.key)"
                      :value="operation[field.key]"
                    />
                    <v-badge
                      v-else-if="['fundsUnblocked'].includes(field.key)"
                      :value="operation[field.key] ? 'GRANTED' : 'PENDING'"
                      :text="
                        operation[field.key]
                          ? 'débloqué'
                          : 'non encore débloqué'
                      "
                    />
                    <v-badge
                      v-else-if="['ended'].includes(field.key)"
                      :value="operation[field.key] ? 'GRANTED' : 'ONGOING'"
                      :text="operation[field.key] ? 'apurée' : 'en cours'"
                    />

                    <dropdown
                      v-else-if="['guaranteeFiles'].includes(field.key)"
                      icon="cloud-download-outline"
                      position-x="right"
                      :position-y="index >= items.length - 4 ? 'top' : 'bottom'"
                      :options="generateGuaranteeOptions(operation[field.key])"
                      :disabled="operation[field.key]?.length === 0"
                    />
                    <template v-else-if="field.key === 'amount'"
                      >{{ padMoney(operation[field.key]) }} DH
                    </template>
                    <span
                      v-html="highlightText(operation[field.key])"
                      v-else-if="field.key === 'reference'"
                    >
                    </span>
                    <template v-else>{{ operation[field.key] }}</template>
                  </slot>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
    <OperationDetails ref="operationDetailsRef" />
  </div>
</template>

<script setup lang="ts">
import { TOperation } from "@/utils/types";
import { DepositStatus } from "../../../server/src/enums/depositStatus.enum";
import { computed, inject, ref, Ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import OperationDetails from "@components/OperationDetails.vue";
import { generateGuaranteeOptions, padMoney } from "@/utils/helpers";
import Dropdown from "@components/Dropdown.vue";
import DownloadBtn from "@components/DownloadBtn.vue";
import VBadge from "@components/VBadge.vue";
import { format } from "date-fns";
import {
  downloadableFields,
  isPending,
  statusFields,
} from "@/utils/operationDisplayHelpers";

const operationDetailsRef = ref<typeof OperationDetails | null>(null);

type TField<T = string> = { key: T; label?: string; span?: number };

interface Props {
  fields: TField<Partial<TOperation>>[];
  mainKey?: keyof TOperation;
  class?: string;
}

const items = inject<Ref<TOperation[]>>(
  "items",
  [] as unknown as Ref<TOperation[]>
);

const addItem = (item: TOperation) => {
  items.value = [item, ...items.value];
};

defineExpose({
  items,
  addItem,
});

const highlightText = (text: string) => {
  if (!search.value) return text;
  const regex = new RegExp(search.value, "gi");
  return text.replace(
    regex,
    (match) => `<span class="highlight">${match}</span>`
  );
};

const router = useRouter();
const route = useRoute();
const search = ref((route.query.search ?? "") as string);
const filterItems = (item: TOperation): boolean => {
  const sellers = item.sellers.join(" ").toLowerCase();
  const buyers = item.buyers.join(" ").toLowerCase();
  return (
    item.reference.toLowerCase().includes(search.value.toLowerCase()) ||
    sellers.includes(search.value.toLowerCase()) ||
    buyers.includes(search.value.toLowerCase())
  );
};

// watch search value and replace router.query.search with it
watch(search, (value) => {
  router.replace({
    query: {
      search: value || undefined,
    },
  });
});

const itemsList = computed(() => {
  return items.value?.filter(filterItems) ?? [];
});

const props = defineProps<Props>();
</script>

<style scoped lang="scss">
.table-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.placeholder {
  text-align: center;
  padding: 1rem;
  justify-content: center;
  line-height: 10rem;

  span {
    opacity: 0.5;
  }

  .text {
    font-weight: bold;
    opacity: 1;
  }
}

.controls {
  display: flex;
  gap: 1rem;

  .search {
    display: flex;
    gap: 1rem;
    flex-basis: 100%;
    align-items: center;
    @include tablet {
      flex: 1;
    }

    .icon {
      font-size: 1.8rem;
      opacity: 0.5;
    }

    .clear {
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s ease-in-out;

      &:hover {
        opacity: 1;
      }
    }

    input {
      flex: 1;
      background-color: transparent;
      padding: 1rem 0;
      border: none;
      color: $primary-text-color;

      &:focus {
        outline: none;
      }
    }
  }
}

.table {
  width: 100%;
  min-height: 50vh;
  overflow: auto;
}

.status {
  display: flex;
  gap: 1rem;
  font-size: 1.2rem;
  align-items: center;
  text-transform: capitalize;

  .icon {
    font-size: 2rem;
  }

  &--PENDING {
    color: $pending-color;
  }

  &--GRANTED,
  &--REALIZED {
    color: $success-color;
  }

  &--REJECTED {
    color: $fail-color;
  }
}

table {
  border-collapse: collapse;
  width: 100%;

  thead {
    border-radius: 1rem;
    white-space: nowrap;

    tr {
      border-radius: 0.5rem;
    }

    th {
      padding: 1.2rem 1.2rem;
      @include inheritBorderRadius();
      background-color: $secondary-color;
      text-transform: capitalize;
      font-size: 1.3rem;
      color: rgba($primary-text-color, 0.4);
      text-align: left;
    }
  }

  tbody {
    &:before {
      content: "";
      display: block;
      height: 6px;
    }

    .details {
    }

    .row {
      cursor: pointer;
      border-radius: 0.5rem;

      &:hover {
        .cell {
          background-color: $secondary-color;
        }
      }

      .cell {
        transition: all 0.2s ease;
        padding: 1.2rem;
        color: rgba($primary-text-color, 0.5);
        @include inheritBorderRadius();
        font-size: 1.4rem;
      }
    }
  }
}
</style>
