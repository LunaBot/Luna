<template>
  <div>
    <template v-if="me">
      <span v-if="me.guilds.length === 0">Please join a guild to manage it.</span>
      <ul v-else>
        <li v-for="guild in me.guilds" :key="guild.id">
          <router-link
            :to="{
              name: 'Modules',
              params: {
                serverId: guild.id,
              },
            }"
            >{{ guild.name }}</router-link
          >
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '../store';

export default defineComponent({
  name: 'Dashboard',
  components: {},
  computed: {
    me() {
      return store.getters.user;
    }
  },
});
</script>

<style>
</style>