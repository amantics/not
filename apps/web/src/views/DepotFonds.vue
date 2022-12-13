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
] as (keyof TTransaction)[];

const items = inject("items");
const addNotification = inject<TAddNotification>("addNotification");

const tableFields = keys.map((key) => ({ key, label: fields[key] }));
const file = ref(null);

const selected = ref<RefTransaction>(null);

const handleSubmit = () => {
  if (!file.value) return;
  if (!selected.value) return;
  selected.value.depositFile = file.value;
  addNotification?.({
    ref: selected.value.ref,
    message: `CDG a accépté dépôt`,
    intendedTo: convertRolesToIndexes(["bank", "notaire"]),
    paths: {
      notaire: "signature-minute",
      bank: "operations-en-cours",
    },
  });
  selected.value = null;
};
const handleFileInput = (e) => {
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
      <template #cell(deposited)="data">
        <b-button
          v-if="data.item.depositFile"
          variant="link"
          @click.prevent="downloadFile(data.item.depositFile)"
          :href="data.item.depositFile?.name ?? '#'"
          >Recu</b-button
        >
        <b-badge v-else-if="data.item.ended" pill variant="info"
          >apurée</b-badge
        >
        <b-button
          v-b-modal.modal
          @click="selected = data.item"
          v-else-if="data.item.fondStatus === 'débloqué' && data.item.deposited"
          variant="primary"
          >Accepter</b-button
        >
        <b-button variant="link" disabled v-else>N/A</b-button>
      </template>
      <template #cell(engagementNotary)="data">
        <b-button
          variant="link"
          :href="data.value?.name ?? '#'"
          @click.prevent="downloadFile(data.value)"
          v-if="data.item.pret === 'accordé' && data.value"
          >Fichier</b-button
        >
        <b-button variant="link" disabled v-else>N/A</b-button>
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
      title="Acceptation de dépôt"
      ok-title="Confirmer"
      @ok="handleSubmit"
      ><b-container>
        <b-row>
          <b-col class="field">
            <span class="label">Référence:</span>
            <span class="val">#{{ selected?.ref }}</span>
          </b-col>
          <b-col class="field">
            <span class="label">Notaire:</span>
            <span class="val">Notaire Name</span>
          </b-col>
        </b-row>
        <b-row cols="12">
          <b-col class="field" cols="6">
            <span class="label">Montant (MAD):</span>
            <span class="val">{{ selected?.amount }}</span>
          </b-col>
          <b-col class="field file" cols="6">
            <span class="label">Reçu de dépôt</span>
            <input type="file" @change="handleFileInput" />
          </b-col>
        </b-row> </b-container
    ></b-modal>
  </main>
</template>

<style lang="scss" scoped>
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
  text-align: left;
  flex-direction: column;
  align-items: center;
  .label {
    font-weight: bold;
  }

  .val {
  }
}
</style>
