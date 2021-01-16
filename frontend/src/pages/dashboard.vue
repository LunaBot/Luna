<template>
  <div>
    <template v-if="me">
      <span v-if="guilds.length === 0">Please join a guild to manage it.</span>
      <ul v-else>
        <li v-for="guild in guilds" :key="guild.id">
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
import type { GuildInfo } from 'passport-discord';
import { defineComponent } from 'vue';
import store from '../store';

export default defineComponent({
  name: 'Dashboard',
  components: {},
  computed: {
    guilds() {
      // Is the owner
      const isOwner = (guild: GuildInfo) => guild.owner;
      // Has "ADMINISTRATOR" permission
      const isAdmin = (guild: GuildInfo) => (guild.permissions & 0x8) === 0x8;
      // Has "MANAGE_SERVER" permission
      const isModerator = (guild: GuildInfo) => (guild.permissions & 0x20) === 0x20;

      // Only show guilds that you own, administrate or moderate
      return store.getters.user.guilds?.filter(guild => isOwner(guild) || isAdmin(guild) || isModerator(guild));
    },
    me() {
      return store.getters.user;
    }
  },
});
</script>

<style>
</style>