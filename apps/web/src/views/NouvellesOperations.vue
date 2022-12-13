<script lang="ts" setup>
import { inject, ref } from "vue";
import { defaultValues, fields, variants } from "@/utils/constants";
import { convertRolesToIndexes, downloadFile, genRef } from "@/utils/helpers";
import useQueryWatch from "@/composables/useQueryWatch";

const { query, route, filterTransactions } = useQueryWatch();

const keys = [
  "ref",
  "buyers",
  "sellers",
  "date",
  "venteFile",
  "pret",
] as (keyof TTransaction)[];

const items = inject<RefTransactionList>("items");
const addTransaction = inject<TAddTransaction>("addTransaction");

const addNotification = inject<TAddNotification>("addNotification");

const tableFields = keys.map((key) => ({ key, label: fields[key] }));

const initialFormState = {
  buyers: [],
  sellers: [],
  venteFile: null,
  date: "",
  amount: 0,
};

const entities = ref({ [genRef(8)]: { buyer: "", seller: "" } });

const formData = ref(initialFormState);

const form = ref(null);
const create = ref(null);

const handleSubmit = () => {
  const defaultData = defaultValues();
  const entitiesData = { buyers: [], sellers: [] } as unknown as TTransaction;
  Object.values(entities.value).forEach((entity: TEntity) => {
    entitiesData.buyers?.push(entity.buyer);
    entitiesData.sellers?.push(entity.seller);
  });

  addTransaction?.({
    ...defaultData,
    ...formData.value,
    ...entitiesData,
  } as TTransaction);
  addNotification?.({
    ref: defaultData.ref,
    message: "Notaire a ajouté une nouvelle transaction",
    intendedTo: convertRolesToIndexes(["bank"]),
    paths: {
      bank: "operations-entrantes",
    },
  });
  formData.value = initialFormState;
};

const handleFileAdd = (e: any) => {
  formData.value.venteFile = e.target.files[0];
};
const addEntity = () => {
  entities.value[genRef(8)] = {
    buyer: "",
    seller: "",
  };
};
</script>

<template>
  <main>
    <div class="intro">
      <h3>{{ route.name }}</h3>
      <b-button variant="primary" v-b-modal.create>Nouvelle opération de vente à crédit</b-button>
    </div>
    <b-modal
      id="create"
      ref="create"
      cancel-title="Annuler"
      title="Nouvelle opération de vente à crédit"
      ok-title="Ajouter"
      @ok="handleSubmit"
    >
      <form ref="form" @submit.prevent="handleSubmit">
        <b-container>
          <b-row class="mb-2">
            <b-col cols="5">Acheteurs (CIN)</b-col>
            <b-col cols="5">Vendeurs (CIN)</b-col>
          </b-row>
          <b-row v-for="key in Object.keys(entities)" :key="key">
            <b-col cols="5">
              <b-form-group
                label-for="acheteur"
                invalid-feedback="CIN is required"
              >
                <b-form-input
                  trim
                  v-model="entities[key].buyer"
                  id="acheteur"
                  required
                ></b-form-input>
              </b-form-group>
            </b-col>
            <b-col cols="5">
              <b-form-group
                label-for="vendeur"
                invalid-feedback="CIN is required"
              >
                <b-form-input
                  trim
                  v-model="entities[key].seller"
                  id="vendeur"
                  required
                ></b-form-input>
              </b-form-group>
            </b-col>
            <b-col @click="delete entities[key]" title="Remove" class="remove">
              <i class="bi bi-trash"></i>
            </b-col>
          </b-row>
          <b-button @click="addEntity" variant="primary" class="mb-2 w-100"
            >Ajouter</b-button
          >
          <b-row>
            <b-col>
              <b-form-group
                label="Date"
                label-for="date"
                invalid-feedback="Date is required"
              >
                <b-form-input
                  type="date"
                  v-model="formData.date"
                  id="date"
                  required
                ></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group
                label="Prix de vente (MAD)"
                label-for="montant"
                invalid-feedback="Amount is required"
              >
                <b-form-input
                  type="number"
                  v-model="formData.amount"
                  id="montant"
                  required
                ></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-group label-for="file" label="Compromis de vente">
                <input
                  name="file"
                  id="file"
                  type="file"
                  placeholder="Compromis"
                  @change="handleFileAdd"
                />
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>
      </form>
    </b-modal>
    <div class="search">
      <b-form-input
        v-model="query"
        type="text"
        placeholder="Search by Ref"
      ></b-form-input>
    </div>

    <b-table
      :fields="tableFields"
      responsive
      striped
      hover
      :items="items.filter(filterTransactions)"
    >
      <template #cell(buyers)="data">
        <b-container class="d-flex flex-wrap gap-2 align-items-center">
          <b-badge
            v-for="(entity, index) in data.value"
            :key="`${entity}-buyer-${index}`"
            variant="primary"
            >{{ entity }}</b-badge
          >
        </b-container>
      </template>
      <template #cell(sellers)="data">
        <b-container class="d-flex flex-wrap gap-2 align-items-center">
          <b-badge
            v-for="(entity, index) in data.value"
            :key="`${entity}-seller-${index}`"
            variant="primary"
            >{{ entity }}</b-badge
          >
        </b-container>
      </template>
      <template #cell(venteFile)="data">
        <b-button
          variant="link"
          @click.prevent="downloadFile(data.value)"
          :href="data.value?.name ?? '#'"
          >Fichier</b-button
        >
      </template>
      <template #cell(pret)="data">
        <b-badge pill :variant="variants[data.value.toLowerCase()]">{{
          data.value
        }}</b-badge>
      </template>
    </b-table>
  </main>
</template>

<style lang="scss">
.intro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 2rem;
  h3 {
    font-weight: bold;
  }
}
.search {
  width: 30%;
}
.remove {
  cursor: pointer;
}
</style>
