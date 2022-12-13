import { RouteRecordName, useRoute, useRouter } from "vue-router";
import { ref, watch } from "vue";

function useQueryWatch() {
  const route = useRoute();
  const router = useRouter();
  const query = ref<string>((route.query.q as string) ?? "");
  watch(query, (value) => {
    router.replace({
      name: route.name as RouteRecordName,
      query: { q: value },
    });
  });
  watch(route, (value) => {
    if (value.query.q !== query.value) {
      query.value = value.query.q as string;
    }
  });
  const filterTransactions = (transaction: TTransaction) => {
    const includesQuery = (value: string) => {
      return value.toLowerCase().includes(query.value.toLowerCase());
    };
    return (
      includesQuery(transaction.ref) ||
      transaction.buyers.some(includesQuery) ||
      transaction.sellers.some(includesQuery)
    );
  };
  return { query, route, filterTransactions };
}

export default useQueryWatch;
