<template>
  <section>
    <div class="container px-4 mx-auto">
      <nav class="flex items-center py-6">
        <router-link :to="{ name: isAuthenticated ? 'Dashboard' : 'Home' }" class="button text-3xl font-semibold leading-none">
          <img class="h-10" src="/logo.png" :alt="logo.alt" />
        </router-link>
        <div class="ml-auto">
          <router-link
            :to="{ name: isAuthenticated ? 'Logout' : 'Login' }"
            class="inline-block px-4 py-3 text-xs font-semibold leading-none bg-blurple hover:shadow-lg text-white rounded"
            >{{ isAuthenticated ? 'Logout' : 'Signin with Discord' }}</router-link
          >
        </div>
      </nav>
    </div>
  </section>
</template>

<script lang="ts">
import store from '../store';
export default {
  name: 'Navigation',
  props: {
    id: String,
    name: String,
    description: String,
    commands: Array,
    broken: Boolean,
    internal: Boolean,
    enabled: Boolean,
    events: Array,
    endpoints: Array,
  },
  data() {
    return {
      logo: {
        alt: 'logo'
      }
    }
  },
  computed: {
    isAuthenticated() {
      return store.getters.auth.isAuthenticated;
    }
  }
};
</script>

<style>
</style>