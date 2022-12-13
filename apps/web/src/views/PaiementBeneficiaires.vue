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
  "minuteFile",
  "taxPaymentFile",
  "inscriptionFiles",
  "benificiaryPaimentStatus",
] as (keyof TTransaction)[];

const items = inject("items");
const addNotification = inject<TAddNotification>("addNotification");

const tableFields = keys.map((key) => ({ key, label: fields[key] }));
const selected = ref<RefTransaction>(null);

const initialState = {
  benefiterId: "",
  amount: 0,
};
const formData = ref(initialState);

const handleSubmit = () => {
  if (!selected.value) return;
  selected.value.amount = formData.value.amount;
  selected.value.benificiaryPaimentStatus = "réalisé";

  addNotification?.({
    ref: selected.value.ref,
    message: `CDG a payé les bénéficiaires`,
    intendedTo: convertRolesToIndexes(["bank", "notaire"]),
    paths: {
      bank: "operations-en-cours",
      notaire: "depot",
    },
  });
  selected.value = null;
  formData.value = initialState;
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
          :href="data.item.depositFile?.name ?? '#'"
          @click.prevent="downloadFile(data.item.depositFile)"
          >{{ data.value ? "Recu" : "En attente" }}</b-button
        >
      </template>
      <template #cell(minuteFile)="data">
        <b-button
          variant="link"
          :disabled="!data.value"
          :href="data.value?.name ?? '#'"
          @click.prevent="downloadFile(data.value)"
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
        <b-badge
          v-if="data.value === 'réalisé'"
          pill
          :variant="variants[data.value.toLowerCase()]"
          >{{ data.value }}</b-badge
        >
        <b-badge v-else-if="data.item.ended" pill variant="info"
          >apurée</b-badge
        >
        <b-button
          v-b-modal.modal
          variant="primary"
          v-else
          @click="(selected = data.item), (formData.amount = data.item.amount)"
          >Payer</b-button
        >
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
      title="Payer bénéficiaire"
      ok-title="Payer"
      @ok="handleSubmit"
    >
      <form @submit.prevent="handleSubmit">
        <b-container>
          <b-row>
            <b-col>
              <b-form-group
                label-class="label"
                label-for="id"
                label="Bénéficiaire ID"
              >
                <b-form-input
                  id="id"
                  v-model="formData.benefiterId"
                  type="text"
                  placeholder="Bénéficiaire ID"
                ></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group
                label-class="label"
                label-for="amount"
                label="Montant"
              >
                <b-form-input
                  v-model="formData.amount"
                  type="number"
                  placeholder="Montant"
                ></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>
      </form>
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
</style>
