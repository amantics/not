import { createRouter, createWebHistory } from "vue-router";
import { links } from "@/utils/constants";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [...Object.values(links).flat()],
});

export default router;
