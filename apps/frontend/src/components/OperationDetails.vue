<template>
  <div
    class="wrapper"
    :class="[!isVisible && 'wrapper--hidden']"
    @click.self="toggle(false)"
  >
    <Transition name="modal" appear>
      <div class="main" v-if="isVisible">
        <div class="header">
          <div class="operation">
            <div class="label">
              <ion-icon name="swap-horizontal-outline"></ion-icon>
              <span class="text">Opération /</span>
            </div>
            <span class="reference">{{ operation.reference }}</span>
          </div>
          <ion-icon
            name="close-outline"
            class="close"
            @click="toggle(false)"
          ></ion-icon>
        </div>
        <div class="details">
          <div class="fields">
            <div
              class="field"
              v-for="field in fields"
              :key="field.key"
              :class="`field-${field.key}`"
            >
              <span class="label">{{ field.label }}</span>
              <span class="value">
                <template v-if="['sellers', 'buyers'].includes(field.key)">{{
                  operation[field.key]?.join(", ")
                }}</template>
                <template
                  v-else-if="
                    ['date', 'createdAt', 'updateAt'].includes(field.key)
                  "
                  >{{
                    format(new Date(operation[field.key] ?? new Date()), "P")
                  }}
                </template>

                <v-badge
                  v-else-if="isPending(field.key, operation)"
                  :value="DepositStatus.PENDING"
                />
                <download-btn
                  :value="operation[field.key]"
                  v-else-if="downloadableFields.includes(field.key)"
                />
                <template v-else-if="field.key === 'amount'"
                  >{{ padMoney(operation[field.key]) }} DH
                </template>
                <dropdown
                  v-else-if="['guaranteeFiles'].includes(field.key)"
                  icon="cloud-download-outline"
                  position-x="right"
                  position-y="bottom"
                  :options="generateGuaranteeOptions(operation[field.key])"
                  :disabled="operation[field.key]?.length === 0"
                />

                <v-badge
                  v-else-if="statusFields.includes(field.key)"
                  :value="operation[field.key]"
                />
                <v-badge
                  v-else-if="['fundsUnblocked'].includes(field.key)"
                  :value="operation[field.key] ? 'GRANTED' : 'PENDING'"
                  :text="
                    operation[field.key] ? 'débloqué' : 'non encore débloqué'
                  "
                />
                <v-badge
                  v-else-if="['ended'].includes(field.key)"
                  :value="operation[field.key] ? 'GRANTED' : 'ONGOING'"
                  :text="operation[field.key] ? 'apurée' : 'en cours'"
                />
                <template v-else>{{ operation[field.key] }}</template>
              </span>
            </div>
          </div>
          <div class="log">
            <span class="log__title">Historique</span>
            <p class="placeholder" v-if="!history.length">Aucune action</p>
            <div class="entries" v-else>
              <div v-for="log in history" :key="log.createdAt" class="entry">
                <span class="date">{{
                  format(new Date(log.createdAt), "LLL dd, yyyy KK:mm")
                }}</span>
                <ion-icon
                  :name="activityIcon[log.message]"
                  :key="log.message"
                  class="icon"
                ></ion-icon>
                <p class="text">{{ Messages[log.message] }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <button class="close" @click="toggle(false)">close</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { TOperation } from "@/utils/types";
import {
  connectOperationsFactory,
  generateGuaranteeOptions,
  getFields,
  getOperationsContract,
  padMoney,
} from "@/utils/helpers";
import { format } from "date-fns";
import { DepositStatus } from "../../../server/src/enums/depositStatus.enum";
import {
  downloadableFields,
  isPending,
  statusFields,
} from "@/utils/operationDisplayHelpers";
import VBadge from "@components/VBadge.vue";
import Dropdown from "@components/Dropdown.vue";
import DownloadBtn from "@components/DownloadBtn.vue";
import {
  Messages,
  NotificationPayload,
} from "../../../../libs/shared/src/lib/notifications";
import { activityIcon } from "@/utils/constants";

const isVisible = ref(false);
const history = ref<NotificationPayload[]>([]);
const operation = ref<TOperation | undefined>();

const operations = connectOperationsFactory();
const contract = getOperationsContract();

watch(operation, (currentOperation, previousOperation) => {
  if (!currentOperation) {
    if (previousOperation) {
      const notifyFilter = operations.filters.Notify(
        previousOperation?.reference,
        null,
        null
      );
      contract.removeAllListeners(notifyFilter);
    }

    return;
  }
  const notifyFilter = operations.filters.Notify(
    currentOperation.reference,
    null,
    null
  );
  operations.queryFilter(notifyFilter).then(async (events) => {
    const historyLog = [];
    for (let i = events.length - 1; i >= 0; i--) {
      historyLog.push(JSON.parse(events[i].args[2]));
    }
    history.value = historyLog;
    const startBlockNumber = await operations.provider.getBlockNumber();
    contract.on(
      notifyFilter,
      (primaryKey, operationReference, payload, event) => {
        if (event.blockNumber <= startBlockNumber) {
          return;
        }
        const payloadParsed: NotificationPayload = JSON.parse(payload);
        history.value = [payloadParsed, ...history.value];
      }
    );
  });
});

const toggle = (value?: boolean, selectedOperation?: TOperation) => {
  operation.value = selectedOperation;
  isVisible.value = value ?? !isVisible.value;
};

defineExpose({
  toggle,
});

const fields = getFields([
  "buyers",
  "sellers",
  "amount",
  "date",
  "sellingFile",
  "creditStatus",
  "engagementNotaryFile",
  "fundsUnblocked",
  "depositFile",
  "minuteSignatureFile",
  "taxPaymentFile",
  "guaranteeFiles",
  "beneficiaryPaymentStatus",
  "ended",
]);
// handle escape key
const close = (e: any) => {
  if (e.key === "Escape") {
    toggle(false);
  }
};
onMounted(() => {
  window.addEventListener("keydown", close);
});
onUnmounted(() => {
  window.removeEventListener("keydown", close);
});
</script>

<style scoped lang="scss">
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(black, 0.5);
  display: flex;
  z-index: 9999;
  justify-content: center;
  transition: all 0.2s ease;

  &--hidden {
    visibility: hidden;
    opacity: 0;
  }

  .main {
    background-color: $secondary-color;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    padding: 1rem;
    border-radius: 0.5rem;
    position: relative;
    height: fit-content;
    width: 80%;
    margin: auto;
    @include tablet {
      width: 60%;
    }
    @include desktop {
      width: 40%;
    }
    @include extra-lg-desktop {
      width: 30%;
    }

    .header {
      padding: 1rem 0;

      .close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 2rem;
        opacity: 0.5;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 1;
        }
      }

      .operation {
        display: flex;
        font-size: 1.6rem;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;

        .label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.3;
        }

        .reference {
          font-weight: bold;
        }
      }
    }

    .details {
      overflow: auto;
      max-height: 70vh;

      .fields {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(2, 1fr);
        @include desktop {
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .field {
          display: flex;
          gap: 1rem;
          flex-direction: column;

          .label {
            font-size: 1.2rem;
            font-weight: bold;
            opacity: 0.5;
          }

          .value {
            font-weight: bold;
          }
        }
      }

      .log {
        border-top: 1px solid $line-color;
        padding-top: 1rem;
        margin-top: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .placeholder {
          text-align: center;
          font-size: 1.4rem;
          opacity: 0.5;
          padding: 1rem 0;
        }

        &__title {
          font-size: 1.4rem;
          opacity: 0.5;
        }

        .entries {
          display: flex;
          flex-direction: column;

          .entry {
            align-items: center;
            font-size: 1.4rem;
            border-bottom: 1px solid $line-color;
            padding: 1rem 0;
            display: flex;
            gap: 1rem;

            &:last-of-type {
              border-bottom: none;
            }

            .date {
              font-size: 1.2rem;
              opacity: 0.5;
            }

            .icon {
              color: $primary-color;
            }
          }
        }
      }
    }

    .footer {
      margin-top: 1rem;
      display: flex;
      padding: 1rem;

      .close {
        padding: 1rem 2rem;
        width: 100%;
        background-color: $secondary-hover-color;
        color: $primary-text-color;
        text-transform: capitalize;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: alls 0.2s ease;
        @include tablet {
          width: fit-content;
          margin-left: auto;
        }
        @include desktop {
          padding: 1rem 3rem;
        }

        &:hover {
          background-color: $secondary-color;
        }
      }
    }
  }
}

.modal-leave-active {
  transition: all 0.1s ease;
}

.modal-enter-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  transform: translateY(-20%);
  opacity: 0;
}
</style>
