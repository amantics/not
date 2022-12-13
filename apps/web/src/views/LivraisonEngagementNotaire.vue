<script lang="ts" setup>
import { inject, ref } from "vue";
import { fields, variants } from "@/utils/constants";
import { convertRolesToIndexes, downloadFile } from "@/utils/helpers";
import useQueryWatch from "@/composables/useQueryWatch";

const { query, route, filterTransactions } = useQueryWatch();

const keys = [
  "ref",
  "buyers",
  "sellers",
  "date",
  "venteFile",
  "pret",
  "engagementNotary",
] as (keyof TTransaction)[];

const items = inject("items");
const addNotification = inject<TAddNotification>("addNotification");

const tableFields = keys.map((key) => ({ key, label: fields[key] }));

const file = ref<File | null>(null);
const selected = ref<RefTransaction>(null);

const handleSubmit = () => {
  if (!file.value || !selected.value) return;
  selected.value.engagementNotary = file;
  addNotification?.({
    ref: selected.value.ref,
    message: "Notaire a ajouté l'engagement de notaire",
    intendedTo: convertRolesToIndexes(["bank"]),
    paths: {
      bank: "operations-en-cours",
    },
  });
  selected.value = null;
};
const handleFileAdd = (e: any) => {
  file.value = e.target.files[0];
};
</script>

<template>
  <main>
    <div class="intro">
      <h3>{{ route.name }}</h3>
    </div>
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
      <template #cell(engagementNotary)="data">
        <b-button
          variant="link"
          :href="data.value?.name ?? '#'"
          @click.prevent="downloadFile(data.value)"
          v-if="data.item.pret === 'accordé' && data.value"
          >Fichier</b-button
        >
        <b-badge v-else-if="data.item.ended" pill variant="info"
          >apurée</b-badge
        >
        <b-button
          v-b-modal.add
          @click="selected = data.item"
          variant="primary"
          v-else-if="data.item.pret === 'accordé' && !data.value"
          >Ajouter Fichier</b-button
        >
        <b-button variant="link" href="#" disabled v-else>N/A</b-button>
      </template>
      <template #cell(pret)="data">
        <b-badge pill :variant="variants[data.value.toLowerCase()]">{{
          data.value
        }}</b-badge>
      </template>
    </b-table>
    <b-modal
      id="add"
      ref="add"
      cancel-title="Annuler"
      title="Engagment Notarié"
      ok-title="Ajouter"
      @ok="handleSubmit"
    >
      <b-form-group label-for="file" label="Engagment Notarié">
        <input
          name="file"
          id="file"
          type="file"
          placeholder="Engagment Notarié"
          @change="handleFileAdd"
        />
      </b-form-group>
    </b-modal>
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
</style>
