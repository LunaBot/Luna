<template>
  <div>Loading...</div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadingPage',
  props: {
    redirect: String,
  },
  mounted() {
    if (this.redirect) {
      this.$router.push({
        path: this.redirect,
      });
    }
  },
});
</script>