<template>
  <div class="container">
    <div class="login">
      <div class="intro">
        <h1>{{ route.name === "register" ? "S'inscrire" : "S'identifier" }}</h1>
        <p class="text">Bonjour, bienvenue 👋</p>
        <p class="instruction" v-if="route.name === 'login-promoteur'">
          Si c'est votre première visite, votre mot de passe est votre CIN
          (minuscule).
        </p>
        <p
          class="feedback"
          :class="[`feedback--${message.type}`]"
          v-if="message.text"
        >
          {{ message.text }}
        </p>
      </div>
      <form class="form" @submit.prevent="handleSubmit">
        <v-label
          :message="fieldsErrors[name]"
          type="error"
          :name="labels[name] ?? name"
          class="label"
          v-for="(field, name) in data"
          :key="name"
        >
          <v-select
            v-model="data[name]"
            v-if="name === 'role'"
            :options="selectOptions[name]"
            position="top"
          />
          <input
            v-else
            :type="inputType[name]"
            :placeholder="placeholders[name]"
            v-model.trim="data[name]"
          />
        </v-label>
        <load-button
          :loading="!!fetcher.loading.value"
          class="submit"
          type="submit"
        >
          connexion
        </load-button>
      </form>
      <div class="register" v-if="route.name !== 'login-promoteur'">
        <p class="text">
          {{
            route.name === "login"
              ? "Vous n'avez pas de compte?"
              : "Vous avez déjà un compte?"
          }}
        </p>
        <router-link
          :to="route.name === 'login' ? '/register' : '/login'"
          class="link"
          >{{ route.name === "login" ? "Créer un compte" : "Connectez-vous" }}
          <ion-icon name="arrow-forward-outline" class="arrow"></ion-icon>
        </router-link>
      </div>
      <router-link
        v-if="route.name.includes('login')"
        :to="route.name === 'login' ? '/login-promoteur' : '/login'"
        class="section"
        >Section du {{ route.name === "login" ? "promoteur" : "membre" }}
        <ion-icon name="arrow-forward-outline" class="arrow"></ion-icon>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch } from "vue";
import VLabel from "@components/VLabel.vue";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import { UserRole } from "../../../../server/src/enums/userRole.enum";
import VSelect from "@components/VSelect.vue";
import useFetcher from "@/composables/useFetcher";
import { User } from "../../../../server/src/users/user.entity";
import LoadButton from "@components/LoadButton.vue";

const initialMessageState = {
  type: "",
  text: "",
};
const message = ref(initialMessageState);
const route = useRoute();
const router = useRouter();
const getInitialState = (routeName: RouteRecordName) => {
  switch (routeName) {
    case "login":
      return {
        data: {
          email: "",
          password: "",
        },
        placeholders: {
          email: "Email",
          password: "Mot de passe",
        },
      };
    case "register":
      return {
        data: {
          name: "",
          email: "",
          password: "",
          role: UserRole.NOTAIRE,
        },
        placeholders: {
          email: "Email",
          password: "Mot de passe",
          name: "John Smith",
        },
      };
    case "login-promoteur":
      return {
        data: {
          CIN: "",
          password: "",
        },
        placeholders: {
          CIN: "CIN",
          password: "Mot de passe",
        },
      };
    default:
      return {
        data: {},
        placeholders: {},
      };
  }
};
const inputType = {
  email: "email",
  password: "password",
  name: "text",
  CIN: "text",
  role: "select",
};
const labels = {
  email: "Email",
  password: "Mot de passe",
  name: "Nom",
  CIN: "CIN",
  role: "Type de compte",
};

const selectOptions = {
  role: Object.keys(UserRole)
    .filter((role) => role !== UserRole.PROMOTEUR)
    .map((v) => ({ label: v, value: v })),
};

const fieldsErrors = ref({});

const initialState = getInitialState(route.name ?? "login");
const data = ref(initialState.data);
const placeholders = ref(initialState.placeholders);
watch(
  () => route.name,
  (newRouteName) => {
    const newState = getInitialState(newRouteName ?? "login");
    data.value = newState.data;
    placeholders.value = newState.placeholders;
  }
);

const fetcher = useFetcher();
const setUser = inject("setUser") as (user: User) => void;

type Response = { access_token: string; user: User; error?: string };
const handleSubmit = async () => {
  if (Object.values(data.value).some((v) => !v)) {
    message.value = {
      type: "error",
      text: "Veuillez remplir tous les champs",
    };
    return;
  }
  const res = await fetcher.post<Response>(
    `/auth/${route.name as string}`,
    data.value
  );
  if (res.error) {
    message.value = {
      type: "error",
      text: res.error,
    };
    return;
  }
  message.value = initialMessageState;
  localStorage.setItem("token", res.access_token);
  setUser(res.user);
  router.push("/");
};
</script>

<style scoped lang="scss">
.container {
  display: flex;
  height: 100vh;
  overflow: auto;
}

.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 80%;
  gap: 2rem;
  margin: auto;
  margin-top: 40%;

  @include tablet {
    width: 60%;
    margin: auto;
  }
  @include desktop {
    width: 35%;
  }
  @include extra-lg-desktop {
    width: 25%;
  }

  .instruction {
    font-size: 1.4rem;
    opacity: 0.5;
  }

  .intro {
    display: flex;
    gap: 1rem;
    flex-direction: column;

    h1 {
      font-weight: 500;
    }
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .label {
    gap: 0.5rem;
    text-transform: capitalize;

    input {
      background-color: $secondary-color;
      color: $primary-text-color;
      border: 1px solid $line-color;
      padding: 1rem;
      transition: all 0.2s ease;

      &:focus {
        border-color: $primary-color;
        outline: none;
      }
    }
  }

  .submit {
    width: 100%;
    padding: 1rem;
  }
}

.register {
  display: flex;
  font-size: 1.2rem;
  gap: 0.5rem;
  align-items: flex-end;
  justify-content: center;

  .text {
    opacity: 0.7;
  }
}

.link,
.section {
  color: $primary-color;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-end;
  gap: 0.2rem;

  &:hover {
    color: $primary-hover-color;
  }

  .arrow {
    font-size: 1.6rem;
    transform: rotate(-45deg);
  }
}

.section {
  justify-content: center;
  font-size: 1.4rem;
}
</style>
