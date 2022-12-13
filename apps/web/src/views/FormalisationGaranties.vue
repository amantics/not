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
  "fondStatus",
  "amount",
  "deposited",
  "guaranteeFiles",
] as (keyof TTransaction)[];

const items = inject("items");
const addNotification = inject<TAddNotification>("addNotification");

const tableFields = keys.map((key) => ({
  key,
  label: key === "guaranteeFiles" ? "Formalisation de guarantie" : fields[key],
}));
const selected = ref<RefTransaction>(null);

const guaranteeFiles = ref(null);

const handleSubmit = () => {
  if (!guaranteeFiles.value || !selected.value) {
    return;
  }
  selected.value.guaranteeFiles = guaranteeFiles.value;
  selected.value.inscriptionFiles = guaranteeFiles.value;
  addNotification?.({
    ref: selected.value?.ref,
    message: `ANCFCC a ajouté le formalisation de guarantie`,
    intendedTo: convertRolesToIndexes(["bank", "notaire"]),
    paths: {
      bank: "operations-en-cours",
      notaire: "signature-minute",
    },
  });
  selected.value = null;
};
const handleFileInput = (e) => {
  guaranteeFiles.value = e.target.files;
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
      <template #cell(guaranteeFiles)="data">
        <b-dropdown text="Certificats" v-if="data.value" variant="primary">
          <b-dropdown-item
            :key="file.name"
            @click.prevent="downloadFile(file)"
            v-for="(file, index) in data.value"
            :href="file.name ?? '#'"
            >{{ file.name ?? `certificat-${index}` }}</b-dropdown-item
          >
        </b-dropdown>
        <b-badge v-else-if="data.item.ended" pill variant="info"
          >apurée</b-badge
        >
        <b-button
          v-b-modal.modal
          variant="primary"
          v-else
          class="btn-nowrap"
          @click="selected = data.item"
          >Charger garantie</b-button
        >
      </template>

      <template #cell(deposited)="data">
        <b-button
          variant="link"
          :disabled="!data.item.depositFile"
          @click.prevent="downloadFile(data.item.depositFile)"
          :href="data.item.depositFile?.name ?? '#'"
          >{{ data.value ? "Recu" : "En attente" }}</b-button
        >
      </template>

      <template #cell(engagementNotary)="data">
        <b-button
          variant="link"
          @click.prevent="downloadFile(data.value)"
          :href="data.value?.name ?? '#'"
          v-if="data.item.pret === 'accordé' && data.value"
          >Fichier</b-button
        >
        <b-button variant="link" href="#" disabled v-else>N/A</b-button>
      </template>
      <template #cell(pret)="data">
        <b-badge pill :variant="variants[data.value.toLowerCase()]">{{
          data.value
        }}</b-badge>
      </template>
      <template #cell(fondStatus)="data">
        <b-badge pill :variant="variants[data.value.toLowerCase()]">{{
          data.value
        }}</b-badge>
      </template>
      <template #cell(amount)="data"> {{ data.value }} </template>
    </b-table>
    <b-modal
      id="modal"
      ref="modal"
      cancel-title="Annuler"
      title="Formalization de garantie"
      ok-title="Soumettre"
      @ok="handleSubmit"
    >
      <b-form-group label-class="label" label-for="file" label="Guarantie">
        <input
          name="file"
          multiple
          id="file"
          type="file"
          placeholder="Guarantie"
          @change="handleFileInput"
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
.field {
  display: flex;
  gap: 1rem;
  align-items: center;

  .val {
  }
}
.label {
  font-weight: bold;
}
.btn-nowrap {
  white-space: nowrap;
}
</style>
