<template>
  <div class="operations">
    <h1>Liste des nouvelles opérations</h1>
    <small>Opérations de vente à crédit</small>
    <div class="controls">
      <span class="create" @click.stop="modalRef.toggle(true)"
        >Nouvelle opération de vente à crédit</span
      >
    </div>
    <OperationsTable ref="table" :fields="fields" />
    <Modal
      ref="modalRef"
      title="Nouvelle opération de vente à crédit"
      submit-text="Ajouter"
      cancel-text="Annuler"
      :on-submit="handleSubmit"
    >
      <template #content>
        <form class="content" @submit.prevent="handleSubmit">
          <v-label name="Acheteurs(CIN)" class="group row-full">
            <TagsInput v-model="data.buyers" placeholder="Ajouter" />
          </v-label>
          <v-label name="Vendeurs(CIN)" class="group row-full">
            <TagsInput v-model="data.sellers" placeholder="Ajouter" />
          </v-label>
          <v-label name="Date d'opération" class="group">
            <input type="date" v-model="data.date" class="date" />
          </v-label>
          <v-label name="Prix de vente (MAD)" class="group">
            <MoneyInput v-model.number="data.amount" sign="MAD" />
          </v-label>
          <v-label
            name="Compromis de vente"
            class="group row-full"
            @click.prevent
          >
            <FileInput
              ref="fileInputRef"
              show-list
              :max-files="1"
              v-model="data.sellingFile"
            />
          </v-label>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import OperationsTable from "@components/OperationsTable.vue";
import Modal from "@components/Modal.vue";

import { getFields } from "@/utils/helpers";
import { ref } from "vue";
import TagsInput from "@components/TagsInput.vue";
import VLabel from "@components/VLabel.vue";
import MoneyInput from "@components/MoneyInput.vue";
import FileInput from "@components/FileInput.vue";
import useFetcher from "@/composables/useFetcher";
import { TOperation } from "@/utils/types";

const modalRef = ref();
const table = ref();

const initialState = {
  buyers: [],
  sellers: [],
  date: new Date().toJSON().slice(0, 10),
  sellingFile: null,
  amount: 0,
};
const data = ref({ ...initialState });
const fileInputRef = ref();

const fetcher = useFetcher();
const handleSubmit = async () => {
  const file = await fileInputRef.value?.uploadFiles();
  const body = {
    ...data.value,
    sellingFile: file,
  };
  const res = await fetcher.post("/operations", body);
  table.value.addItem(res as Partial<TOperation>);
  data.value = { ...initialState };
  return true;
};

const fields = getFields([
  "reference",
  "buyers",
  "sellers",
  "date",
  "sellingFile",
  "creditStatus",
]);
</script>

<style lang="scss" scoped>
.content {
  display: grid;
  gap: 1rem;
  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  .group {
    gap: 1rem;
  }

  .row {
    &-full {
      grid-column: 1 /-1;
    }
  }

  .date {
    padding: 1rem;
    background-color: $secondary-bg-color;
    color: $primary-text-color;
    border: 1px solid $line-color;

    &:focus {
      border-color: $primary-color;
      outline: none;
    }
  }
}

.controls {
  display: flex;

  .create {
    background-color: $primary-color;
    padding: 1rem;
    color: $dark-color;
    font-weight: bold;
    width: 100%;
    text-align: center;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      //background-color: darken($primary-color, 10%);
      background-color: $primary-hover-color;
    }

    @include tablet {
      width: fit-content;
      padding: 1rem 2rem;
      border-radius: 2rem;
      margin-left: auto;
    }
  }
}
</style>
