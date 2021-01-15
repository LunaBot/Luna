<template>
  <!-- Header -->
  <header-component />

  <!-- Content -->
  <main>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <loading v-if="loading"></loading>
      <router-view v-else></router-view>
    </div>
  </main>

  <!-- Footer -->
  <footer-component />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HeaderComponent from './components/header.vue';
import FooterComponent from './components/footer.vue';
import Loading from './components/loading.vue';
import store from './store';

export default defineComponent({
  name: 'App',
  components: {
    HeaderComponent,
    Loading,
    FooterComponent,
  },
  computed: {
    loading() {
      return store.state.loading;
    },
  },
  async mounted() {
    await store.dispatch.setLoading(false);
  },
});
</script>

<style>
</style>