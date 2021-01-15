<template>
  <h2 class="text-5xl mt-2 mb-6 leading-tight font-semibold font-heading">Modules</h2>
  <section class="py-8 px-4">
    <div class="flex flex-wrap -mx-4" v-if="invalid">
      <span>Invalid Server ID</span>
    </div>
    <div class="flex flex-wrap -mx-4" v-else>
      <module
        v-for="_module in enabledModules"
        :key="_module.name"
        v-bind="{ _module }"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModuleComponent from '../components/module.vue';
import type { Module } from '../types';
import { fetch } from '../fetch';

export default defineComponent({
  name: 'Modules',
  components: {
    Module: ModuleComponent,
  },
  props: {
    serverId: String
  },
  data(): { modules: Module[], invalid: boolean } {
    return {
      modules: [],
      invalid: false,
    };
  },
  computed: {
    enabledModules(): Module[] {
      return this.modules.filter(_module => !_module.broken && !_module.internal)
    }
  },
  async mounted() {
    const modules = await fetch(
      `/api/servers/${this.serverId}/modules`
    ).then((response) => response.json()).catch(() => {});

    if (modules && modules.length === 0) {
      this.invalid = true;
      return;
    }
    this.modules = modules;
  }
});
</script>

<style>
</style>