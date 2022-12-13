<script lang="ts" setup>
import { fields, variants } from "@/utils/constants";
import { inject } from "vue";

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
] as (keyof TTransaction)[];

const items = inject<RefTransactionList>("items");
const addNotification = inject<TAddNotification>("addNotification");

const tableFields = keys.map((key) => ({ key, label: fields[key] }));

const handleSwitchStatus = (item: TTransaction, status: string) => {
  item.pret = status;
  addNotification?.({
    ref: item.ref,
    message: `Bank a changé le status des fonds à ${status}`,
    intendedTo: convertRolesToIndexes(["notaire"]),
    paths: {
      notaire: "livraison-engagement-notaire",
    },
  });
  //  fix dropdown menu not hiding after click
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    el.classList.remove("show");
  });
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
      <template #cell(pret)="data">
        <b-dropdown
          :text="data.value"
          :variant="variants[data.value]"
          class="m-2"
          :disabled="data.item.ended"
        >
          <b-dropdown-item-button
            @click="handleSwitchStatus(data.item, 'accordé')"
            :active="data.value === 'accordé'"
          >
            Accorder</b-dropdown-item-button
          >
          <b-dropdown-item-button
            :active="data.value === 'rejeté'"
            @click="handleSwitchStatus(data.item, 'rejeté')"
            >Rejeter</b-dropdown-item-button
          >
        </b-dropdown> </template
      ><template #cell(benificiaryPaimentStatus)="data">
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
.field {
  display: flex;
  gap: 1rem;
  align-items: center;
  .label {
    font-weight: bold;
  }

  .val {
  }
}
</style>
