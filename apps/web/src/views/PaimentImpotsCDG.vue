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
  "taxPaymentFile",
] as (keyof TTransaction)[];

const items = inject<RefTransactionList>("items");
const addNotification = inject<TAddNotification>("addNotification");

const tableFields = keys.map((key) => ({ key, label: fields[key] }));

const handleInitialize = (item: TTransaction) => {
  item.taxPaymentStatus = "ACCEPTED";
  addNotification?.({
    ref: item?.ref,
    message: `CDG a accepté le paiement d'impôt`,
    intendedTo: convertRolesToIndexes(["DGI"]),
    paths: {
      DGI: "paiement-impots",
    },
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
      <template #cell(taxPaymentFile)="data">
        <b-button
          variant="link"
          v-if="data.item.taxPaymentStatus === 'ACCEPTED'"
          :href="data.value?.name ?? '#'"
          @click.prevent="downloadFile(data.value)"
          :disabled="!data.value"
          >{{ data.value ? "Certificate" : "en attente" }}
        </b-button>
        <b-badge v-else-if="data.item.ended" pill variant="info"
          >apurée</b-badge
        >
        <b-button
          variant="primary"
          v-else-if="data.item.taxPaymentStatus === 'INITIALIZED'"
          @click="handleInitialize(data.item)"
        >
          Accepter</b-button
        >
        <b-badge v-else pill variant="warning"> En attente </b-badge>
      </template>

      <template #cell(deposited)="data">
        <b-button
          variant="link"
          :disabled="!data.value"
          :href="data.item.depositFile?.name ?? '#'"
          @click.prevent="downloadFile(data.item.depositFile)"
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
</style>
