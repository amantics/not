<template>
  <div
    class="modal-wrapper"
    :class="[!show && 'modal-wrapper--hidden']"
    @click.self="toggle(false)"
  >
    <Transition name="modal" appear>
      <div class="modal" v-if="show">
        <slot name="header">
          <div class="header">
            <p class="title">{{ title ?? "Modal" }}</p>
            <span class="close" @click="toggle(false)"
              ><ion-icon name="close-outline"
            /></span>
          </div>
        </slot>
        <div class="content">
          <div class="operation" v-if="selectedOperation">
            <div class="label">
              <ion-icon name="swap-horizontal-outline"></ion-icon>
              <span class="text">Opération /</span>
            </div>
            <span class="reference">{{ selectedOperation.reference }}</span>
          </div>
          <slot name="content">no content</slot>
        </div>
        <slot name="footer">
          <div class="footer">
            <button @click="toggle(false)" class="cancel">
              {{ cancelText ?? "annuler" }}
            </button>
            <button
              @click="handleSubmit"
              class="submit"
              :class="[loading && 'loading']"
              :disabled="loading"
            >
              <Loader :loading="loading"
                >{{ submitText ?? "soumettre" }}
              </Loader>
            </button>
          </div>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { TOperation } from "@/utils/types";
import { RefValue } from "vue/macros";
import Loader from "@components/Loader.vue";

const show = ref(props.initialShow);
const selectedOperation = ref<RefValue<TOperation> | null>(null);

const toggle = (
  newState?: boolean,
  cb?: ((op: any) => any) | TOperation | null
) => {
  show.value = newState ?? !show.value;
  if (cb) {
    if (typeof cb === "function") {
      cb(selectedOperation);
    } else {
      selectedOperation.value = cb;
    }
  }
  if (!show.value) {
    props.onClose?.();
  }
};
defineExpose({
  toggle,
  selectedOperation,
});

const loading = ref(false);

const handleSubmit = async () => {
  if (!props.onSubmit || loading.value) return;
  loading.value = true;
  const shouldClose = await props.onSubmit();
  toggle(!shouldClose);
  loading.value = false;
};

interface Props {
  title?: string;
  onSubmit?: () => boolean | Promise<boolean>;
  onClose?: () => void;
  submitText?: string;
  cancelText?: string;
  initialShow?: boolean;
}

const props = defineProps<Props>();

// handle escape key
const close = (e) => {
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
.loader {
  @include size(1.4rem);
}

.content {
  max-height: 80vh;
  padding: 1rem;
  overflow: auto;

  .operation {
    display: flex;
    font-size: 1.3rem;
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
    }
  }
}

.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(black, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  transition: all 0.2s ease;

  &--hidden {
    visibility: hidden;
    opacity: 0;
  }

  .modal {
    background-color: $secondary-color;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    padding: 1rem;
    border-radius: 0.5rem;
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid $line-color;
      padding: 0.5rem 0;
      @include desktop {
        padding: 0.8rem 0;
      }

      .title {
        font-weight: bold;
        font-size: 1.8rem;
      }

      .close {
        cursor: pointer;
        opacity: 0.5;
        font-size: 2rem;

        &:hover {
          opacity: 1;
        }
      }
    }

    .footer {
      display: flex;
      border-top: 1px solid $line-color;
      margin-top: 1rem;
      padding: 1rem 0;
      padding-top: 1.5rem;
      gap: 1rem;
      align-items: center;
      justify-content: flex-end;

      button {
        text-transform: capitalize;
        padding: 0.5rem 1.8rem;
        cursor: pointer;
        @include tablet {
          padding: 0.8rem 2rem;
        }
        @include extra-lg-desktop {
          padding: 0.8rem 2.5rem;
        }
      }

      .cancel {
        background-color: transparent;
        color: $primary-text-color;
        border: none;
        opacity: 0.4;
        transition: all 0.2s ease;

        &:hover {
          opacity: 1;
        }
      }

      .submit {
        background-color: $primary-color;
        color: $dark-color;
        border-radius: 0.5rem;
        border: none;
        transition: all 0.2s ease;

        &:hover {
          background-color: darken($primary-color, 10%);
        }
      }

      .loading {
        opacity: 0.5;
        cursor: progress;
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
