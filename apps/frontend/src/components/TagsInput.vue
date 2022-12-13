<template>
  <div class="tags" :class="[focused && 'tags--focused']">
    <div class="tag" v-for="tag in modelValue" :key="tag">
      <span class="value">{{ tag }}</span>
      <ion-icon
        @click="remove(tag)"
        class="remove"
        name="close-outline"
      ></ion-icon>
    </div>
    <input
      @focus="focused = true"
      @blur="handleBlur"
      ref="inputEl"
      type="text"
      :placeholder="placeholder"
      v-model.trim="input"
      @keyup.enter="add"
    />
  </div>
  <p class="tags__hint">Ajoutez du texte et appuyez sur la touche Entrée</p>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  modelValue: string[];
  placeholder?: string;
}

const handleBlur = () => {
  focused.value = false;
  add();
};
const input = ref("");
const inputEl = ref<HTMLInputElement>();
const focused = ref(false);

const tagsMap = computed<Record<string, boolean>>(() =>
  props.modelValue.reduce((a, b) => ({ ...a, [b]: true }), {})
);
const add = () => {
  if (!input.value) return;
  if (tagsMap.value[input.value]) return;
  emit("update:modelValue", [...props.modelValue, input.value]);
  input.value = "";
};
const remove = (val: string) => {
  emit(
    "update:modelValue",
    props.modelValue.filter((v) => v !== val)
  );
};
const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
</script>

<style lang="scss">
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-radius: 0.5rem;
  row-gap: 0.8rem;
  border: 1px solid $line-color;
  padding: 1rem;
  background-color: $secondary-bg-color;
  cursor: text;

  &--focused {
    border-color: $primary-color;
  }

  .tag {
    cursor: auto;
    display: flex;
    align-items: center;
    background-color: $primary-color;
    color: $dark-color;
    font-size: 1.4rem;
    border-radius: 2rem;

    .value {
      padding: 0.5rem 0;
      padding-left: 1rem;
    }

    .remove {
      display: inline-block;
      transition: all 0.2s ease;
      padding: 0 0.5rem;
      font-size: 1.6rem;
      height: 100%;
      color: $dark-color;
      opacity: 0.8;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }
  }

  input {
    padding: 0.3rem 0;
    background-color: transparent;
    border: none;
    color: $primary-text-color;

    &:focus {
      outline: none;
    }
  }

  &__hint {
    font-size: 1.1rem;
    opacity: 0.4;
    transition: all 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
