<script lang="ts" setup>
import { inject } from "vue";
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
  "minuteFile",
  "taxPaymentFile",
  "inscriptionFiles",
  "benificiaryPaimentStatus",
] as (keyof TTransaction)[];

const items = inject("items");
const addNotification = inject<TAddNotification>("addNotification");

const tableFields = keys.map((key) => ({ key, label: fields[key] }));

const handleSwitchStatus = (item: TTransaction, status: string) => {
  item.fondStatus = status;
  //  fix dropdown menu not hiding after click
  addNotification?.({
    ref: item.ref,
    message: `Bank a changé le status des fonds à ${status}`,
    intendedTo: convertRolesToIndexes(["notaire", "CDG"]),
    paths: {
      CDG: "depot-fonds",
      notaire: "depot",
    },
  });
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
          :href="data.value?.name ?? '#'"
          @click.prevent="downloadFile(data.value)"
          variant="link"
          >Fichier</b-button
        >
      </template>
      <template #cell(taxPaymentFile)="data">
        <b-button
          variant="link"
          :href="data.value?.name ?? '#'"
          @click.prevent="downloadFile(data.value)"
          :disabled="!data.value"
          >{{ data.value ? "Certificate" : "en attente" }}</b-button
        >
      </template>
      <template #cell(inscriptionFiles)="data">
        <b-dropdown text="Certificats" v-if="data.value" variant="primary">
          <b-dropdown-item
            :key="file.name"
            @click.prevent="downloadFile(file)"
            v-for="(file, index) in data.value"
            :href="file.name ?? '#'"
            >{{ file.name ?? `certificat-${index}` }}</b-dropdown-item
          >
        </b-dropdown>
        <b-button disabled v-else variant="link">en attente</b-button>
      </template>

      <template #cell(deposited)="data">
        <b-button
          variant="link"
          :disabled="!data.value"
          @click.prevent="downloadFile(data.item.depositFile)"
          :href="data.item.depositFile?.name ?? '#'"
          >{{ data.value ? "Recu" : "En attente" }}</b-button
        >
      </template>
      <template #cell(minuteFile)="data">
        <b-button
          variant="link"
          @click.prevent="downloadFile(data.value)"
          :disabled="!data.value"
          :href="data.value?.name ?? '#'"
          >{{ data.value ? "Fichier" : "En attente" }}</b-button
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
        }}</b-badge> </template
      ><template #cell(benificiaryPaimentStatus)="data">
        <b-badge pill :variant="variants[data.value.toLowerCase()]">{{
          data.value
        }}</b-badge>
      </template>
      <template #cell(fondStatus)="data">
        <b-dropdown
          :text="data.value"
          :variant="variants[data.value]"
          class="m-2"
          :disabled="data.item.ended"
        >
          <b-dropdown-item-button
            @click="handleSwitchStatus(data.item, 'débloqué')"
            :active="data.value === 'débloqué'"
          >
            Débloquer</b-dropdown-item-button
          >
        </b-dropdown>
      </template>
      <template #cell(amount)="data"> {{ data.value }} </template>
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
