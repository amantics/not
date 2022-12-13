<script lang="ts" setup>
import { inject, nextTick, ref } from "vue";
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

const selected = ref<RefTransaction>(null);

const handleSubmit = () => {
  if (!selected.value) return;
  selected.value.deposited = true;
  addNotification?.({
    ref: selected.value.ref,
    message: `Notaire a signé le reçu de dépôt`,
    intendedTo: convertRolesToIndexes(["bank", "CDG"]),
    paths: {
      CDG: "depot-fonds",
      bank: "operations-en-cours",
    },
  });
  nextTick(() => {
    selected.value = null;
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
          :disabled="!data.value && data.item.ended"
          >Fichier</b-button
        >
      </template>
      <template #cell(deposited)="data">
        <b-button
          v-if="data.value"
          variant="link"
          @click.prevent="downloadFile(data.item.depositFile)"
          :href="data.item.depositFile?.name ?? '#'"
          :disabled="!data.item.depositFile"
          >Recu</b-button
        >
        <b-badge v-else-if="data.item.ended" pill variant="info"
          >apurée</b-badge
        >
        <b-button
          v-b-modal.sign
          @click="selected = data.item"
          v-else-if="data.item.fondStatus === 'débloqué'"
          variant="primary"
          >Déposer</b-button
        >
        <b-button v-else disabled variant="link">N/A</b-button>
      </template>
      <template #cell(engagementNotary)="data">
        <b-button
          variant="link"
          @click.prevent="downloadFile(data.value)"
          :href="data.value?.name ?? '#'"
          v-if="data.item.pret === 'accordé' && data.value"
          >Fichier</b-button
        >
        <b-button v-else disabled variant="link">N/A</b-button>
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
      <template #cell(amount)="data"> {{ data.value ?? "N/A" }} </template>
    </b-table>
    <b-modal
      id="sign"
      ref="sign"
      cancel-title="Annuler"
      title="Signature de dépôt"
      ok-title="Signer"
      @ok="handleSubmit"
    >
      <div class="field">
        <span class="label">Montant (MAD):</span>
        <span class="val">{{ selected?.amount ?? 0 }}</span>
      </div>
      <div class="field">
        <span class="label">Référence:</span>
        <span class="val">#{{ selected?.ref }}</span>
      </div>
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
  .label {
    font-weight: bold;
  }

  .val {
  }
}
</style>
