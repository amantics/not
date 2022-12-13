<template>
  <div class="input" :class="[focused && 'input--focused']">
    <input
      type="text"
      @focus="focused = true"
      @blur="focused = false"
      :value="modelValue"
      @input="handleChange"
    />
    <span class="sign">{{ sign ?? "$" }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  modelValue: number;
  sign?: string;
}

const handleChange = (e) => {
  let val = e.target.value;
  val = val.replace(/\.[0-9]*$/, (a: string) => a.slice(0, 3));
  if (!val.match(/^[0-9]*(\.[0-9]{1,2})?$/g)) {
    e.target.value = val.replace(/([a-zA-Z]+)|[^(.|\d+)]/g, "");
    return;
  }
  e.target.value = val;
  emit("update:modelValue", val);
};
const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
const focused = ref(false);
</script>

<style scoped lang="scss">
.input {
  display: flex;
  gap: 0.5rem;
  background-color: $secondary-bg-color;
  color: $primary-text-color;
  padding: 1rem;
  border: 1px solid $line-color;

  &--focused {
    border-color: $primary-color;
  }

  input {
    color: inherit;
    border: none;
    background-color: transparent;
    flex: 1;
    width: 100%;

    &:focus {
      outline: none;
    }
  }

  .sign {
    opacity: 0.5;
    font-size: 1.4rem;
  }
}
</style>
