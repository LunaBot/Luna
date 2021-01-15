<template>
  <div>Loading...</div>
</template>

<script>
export default {
  name: 'LoadingPage',
  props: {
    redirect: String
  },
  mounted() {
    if (this.redirect) {
      this.$router.push({
        path: this.redirect
      });
    }
  }
};
</script>