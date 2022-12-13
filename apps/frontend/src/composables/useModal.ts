import { ref } from "vue";

function useModal(openDefault = false) {
  const isOpen = ref(openDefault);
  const toggleOpen = (newOpen: boolean) => {
    console.log("in toggle modal", newOpen);
    isOpen.value = newOpen ?? !isOpen.value;
  };
  return { isOpen, toggleOpen };
}

export default useModal;
