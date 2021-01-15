<template>
  <section>
    <div class="container px-4 mx-auto">
      <navigation/>
    </div>
  </section>
</template>

<script lang="ts">
import Navigation from './navigation.vue';

export default {
  components: { Navigation },
  name: 'Header'
};
</script>

<style>
</style>