<template>
  <div v-if="!_module"></div>
  <router-link v-else :to="'/dashboard/794131371999494146/settings/modules/' + _module.name.toLowerCase()" class="w-full lg:w-1/4 px-4 mb-4 lg:mb-4">
    <div class="flex flex-row h-full border rounded shadow p-4">
      <div class="flex flex-col pr-2">
        <img src="https://via.placeholder.com/50" class="w-24" />
      </div>
      <div class="flex flex-col">
        <h3 class="text-3xl mb-3 font-semibold font-heading font-semibold">
          {{ _module.name }}
        </h3>
        <span>{{ _module.description }}</span>
      </div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { Module } from '../types';

export default {
  name: 'Module',
  props: {
    _module: Object as PropType<Module>
  }
};
</script>

<style scoped>
</style>