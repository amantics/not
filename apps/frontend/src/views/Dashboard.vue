<template>
  <div class="dashboard">
    <div class="main">
      <h1 class="header">Dashboard</h1>
      <div class="cards">
        <stats-card
          v-for="(stat, key) in stats"
          :key="key"
          :content="stat"
          :icon="icons[key]"
          :name="labels[key]"
          class="card"
          :class="[key]"
        />
      </div>
      <Sales />
    </div>

    <Activities />
  </div>
</template>

<script setup lang="ts">
import Sales from "@components/Sales";
import Activities from "@components/Activities";
import StatsCard from "@components/StatsCard.vue";
import { computed, inject, Ref } from "vue";
import { TOperation } from "@/utils/types";
import { CreditStatus } from "../../../server/src/enums/creditStatus.enum";

const operations = inject<Ref<TOperation[]>>("items");
const stats = computed(() => {
  let endedOperations = 0;
  let ongoingOperations = 0;
  let initiatedOperations = 0;
  operations?.value.forEach((operation) => {
    if (operation.ended) {
      return endedOperations++;
    }
    if (operation.creditStatus === CreditStatus.PENDING) {
      return initiatedOperations++;
    }
    if (operation.creditStatus === CreditStatus.GRANTED) {
      return ongoingOperations++;
    }
  });
  return {
    initiatedOperations,
    ongoingOperations,
    endedOperations,
  };
});

const labels = {
  endedOperations: "transactions appurées",
  ongoingOperations: " transactions en cours",
  initiatedOperations: "transactions initiées",
};
const icons = {
  endedOperations: "checkmark-circle-outline",
  ongoingOperations: "trending-up-outline",
  initiatedOperations: "arrow-forward-outline",
};
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  @include desktop {
    display: grid;
    grid-template-columns: 1fr 26%;
    height: 100vh;
  }
}

.main {
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 100%;
  overflow: auto;
  @include tablet {
    gap: 3rem;
    padding: 2rem;
  }
  @include desktop {
    max-height: 100vh;
  }

  .cards {
    display: grid;
    gap: 1.5rem;
    @include tablet {
      gap: 1rem;
      grid-template-columns: repeat(3, 1fr);
    }

    .card {
      border-radius: 1rem;
      @include tablet {
        border-radius: revert;
        &:nth-child(2) {
          border: none;
        }
      }
    }
  }
}

.ongoingOperations {
}

.initiatedOperations {
}

.endedOperations {
}
</style>
