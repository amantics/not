import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "@views/Home.vue";
import Dashboard from "@views/Dashboard.vue";
import Auth from "@views/auth/Auth.vue";

const routes: Array<RouteRecordRaw> = [
  ...["login", "login-promoteur", "register"].map((name) => ({
    path: `/${name}`,
    name,
    component: Auth,
  })),
  {
    path: "/",
    name: "home",
    component: Home,
    children: [
      {
        path: "/",
        name: "dashboard",
        component: Dashboard,
      },
      {
        path: "/new-operations",
        name: "new-operations",
        component: () => import("@views/notaire/NewOperations.vue"),
      },
      {
        path: "/engagement-notary",
        name: "engagement-notary",
        component: () => import("@views/notaire/EngagementNotary.vue"),
      },
      {
        path: "/deposit",
        name: "deposit",
        component: () => import("@views/notaire/Deposit.vue"),
      },
      {
        path: "/minute",
        name: "minute",
        component: () => import("@views/notaire/Minute.vue"),
      },
      {
        path: "/initiate-beneficiary",
        name: "initiate-beneficiary",
        component: () => import("@views/notaire/InitiateBeneficiary.vue"),
      },
      {
        path: "/initialize-tax-payment",
        name: "initialize-tax-payment",
        component: () => import("@views/notaire/InitializeTaxPayment.vue"),
      },
      {
        path: "/ended",
        name: "ended",
        component: () => import("@views/notaire/Ended.vue"),
      },
      {
        path: "/incoming-operations",
        name: "incoming-operations",
        component: () => import("@views/banque/IncomingOperations.vue"),
      },
      {
        path: "/ongoing-operations",
        name: "ongoing-operations",
        component: () => import("@views/banque/OngoingOperations.vue"),
      },
      {
        path: "/funds-deposit",
        name: "funds-deposit",
        component: () => import("@views/cdg/FundsDeposit.vue"),
      },
      {
        path: "/beneficiary-payment",
        name: "beneficiary-payment",
        component: () => import("@views/cdg/BeneficiaryPayment.vue"),
      },
      {
        path: "/accept-tax-payment",
        name: "accept-tax-payment",
        component: () => import("@views/cdg/AcceptTaxPayment.vue"),
      },
      {
        path: "/tax-payment",
        name: "tax-payment",
        component: () => import("@views/dgi/TaxPayment.vue"),
      },
      {
        path: "/formalize-guaranties",
        name: "formalize-guaranties",
        component: () => import("@views/ancfcc/FormalizeGuaranties.vue"),
      },
      {
        path: "/operations",
        name: "operations",
        component: () => import("@views/promoteur/Operations.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (!localStorage.getItem("token")) {
    if (
      to.name !== "login" &&
      to.name !== "login-promoteur" &&
      to.name !== "register"
    ) {
      return next({ name: "login" });
    }
  } else {
    if (
      to.name === "login" ||
      to.name === "login-promoteur" ||
      to.name === "register"
    ) {
      return next({ name: "dashboard" });
    }
  }
  next();
});

export default router;
