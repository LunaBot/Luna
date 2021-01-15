<template>
  <h2
    class="text-5xl mt-2 mb-6 leading-tight text-quitedark dark:text-white font-semibold font-heading"
  >
    {{ _module?.name }}
  </h2>
  <div class="flex flex-wrap -mx-4" v-if="invalid">
    <span>Invalid Module ID</span>
  </div>
  <section v-else>
    <div class="container px-4 mx-auto">
      <span v-if="error" class="text-red-500">{{ error }}</span>
      <table
        class="w-full bg-white dark:bg-quitedark rounded shadow dark:shadow-none"
      >
        <thead>
          <tr class="text-left text-xs">
            <th class="pl-6 py-4 font-normal">Name</th>
            <th class="px-4 py-4 font-normal">Command</th>
            <th class="px-4 py-4 font-normal">Allowed Roles</th>
            <th class="px-4 py-4 font-normal">Denied Roles</th>
            <th class="px-4 py-4 font-normal">Enabled</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-t" v-for="command in commands" :key="command.name">
            <td class="flex px-6 py-4 text-xs">
              <img src="https://via.placeholder.com/16" class="w-8" />
              <div class="pl-4">
                <p class="font-semibold">{{ command.name }}</p>
                <span class="text-quitedark dark:text-white">{{
                  command.description
                }}</span>
              </div>
            </td>
            <td class="px-4 py-2 text-xs font-semibold">
              <span
                class="inline-block py-1 px-3 text-xs text-blue-600 bg-blue-100 font-semibold rounded-full"
                >{{ command.command }}</span
              >
            </td>
            <td class="px-4 py-2 text-xs">
              <label class="text-gray-700">
                <tags-input
                  element-id="allowedRoles"
                  @tag-added="roleAddedToCommand"
                  @tag-removed="roleRemovedFromCommand"
                  :limit="250"
                  :hide-input-on-limit="true"
                  :only-existing-tags="true"
                  :delete-on-backspace="true"
                  :typeahead-hide-discard="true"
                  :existing-tags="
                    [...(command.allowedRoles || []).map((role) => ({
                      name: role,
                      value: role,
                    })), ...builtInRoles]
                  "
                  :typeahead="true"
                  placeholder="Add a role"
                ></tags-input>
              </label>
            </td>
            <td class="px-4 py-2 text-xs">
              <label class="text-gray-700">
                <tags-input
                  element-id="deniedRoles"
                  @tag-added="roleAddedToCommand"
                  @tag-removed="roleRemovedFromCommand"
                  :limit="250"
                  :hide-input-on-limit="true"
                  :only-existing-tags="true"
                  :delete-on-backspace="true"
                  :typeahead-hide-discard="true"
                  :existing-tags="
                    [...(command.deniedRoles || []).map((role) => ({
                      name: role,
                      value: role,
                    })), ...builtInRoles]
                  "
                  :typeahead="true"
                  placeholder="Add a role"
                ></tags-input>
              </label>
            </td>
            <td>
              <div class="flex pl-4 items-center">
                <label class="text-gray-700">
                  <button
                    :class="`inline-block px-4 py-3 text-xs font-semibold leading-none ${
                      command.enabled ? 'bg-red-500' : 'bg-green-500'
                    } hover:shadow-lg text-white rounded`"
                    @click="
                      editCommand({
                        command: command.command,
                        enabled: !command.enabled,
                      })
                    "
                  >
                    {{ command.enabled ? 'Disable' : 'Enable' }}
                  </button>
                </label>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <modal
    :showing="modals.addRole"
    @close="closeModal('addRole')"
    :showClose="true"
    :backgroundClose="true"
  >
    add role
  </modal>
  <modal
    :showing="modals.removeRole"
    @close="closeModal('closeRole')"
    :showClose="true"
    :backgroundClose="true"
  >
    remove role
  </modal>
</template>

<script lang='ts'>
import { PropType, defineComponent } from 'vue';
// @ts-ignore
import TagsInput from '@voerro/vue-tagsinput';
import Modal from '../components/modal.vue';
import type { Module, Command } from '../types';
import { fetch } from '../fetch';

export default defineComponent({
  name: 'ModuleSettings',
  components: {
    TagsInput,
    Modal,
  },
  props: {
    serverId: String,
    moduleName: String,
    id: String,
    name: String,
    module: Object as PropType<Module>,
  },
  data(): {
    invalid: boolean;
    _module?: Module;
    error?: Object;
    modals: {
      addRole: boolean;
      removeRole: boolean;
    };
    builtInRoles: { key: string; value: string }[];
    selectedTags: { key: string; value: string }[];
    existingTags: { key: string; value: string }[];
  } {
    return {
      invalid: false,
      _module: this.$props.module ?? undefined,
      error: undefined,
      modals: {
        addRole: false,
        removeRole: false,
      },
      builtInRoles: [{
        key: '@everyone',
        value: '@everyone',
      }],
      selectedTags: [],
      existingTags: [],
    };
  },
  computed: {
    commands(): Command[] {
      if (!this._module) return [];
      return this._module?.commands;
    },
  },
  methods: {
    editModule({ enabled }: { enabled: boolean }) {
      if (!this._module) return;
      // Post to endpoint
      // Update local data
      this._module.enabled = enabled;
    },
    async editCommand({
      enabled,
      command,
    }: {
      enabled: boolean;
      command: string;
    }) {
      if (!this._module) return;
      const response = await fetch(
        `/api/servers/${this.serverId}/modules/${this.moduleName}/commands/${command}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            enabled,
            command,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Not "OK"
      if (!response.ok) {
        this.error = await response.text();
        return;
      }

      const index = this._module.commands.findIndex(_command => _command.command === command);
      if (index >= 0) {
        this._module.commands[index].enabled = enabled;
      }
    },
    openModal(name: string) {
      // @ts-ignore
      this.modals[name] = true;
    },
    closeModal(name: string) {
      // @ts-ignore
      this.modals[name] = false;
    },
    roleAddedToCommand(...args: any[]) {
      console.log(...args);
    },
    roleRemovedFromCommand(...args: any[]) {
      console.log(...args);
    },
  },
  async mounted() {
    const _module = await fetch(
      `/api/servers/${this.serverId}/modules/${this.moduleName}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .catch(() => {});

    if (!_module) {
      this.invalid = true;
      return;
    }
    this._module = _module;
  },
});
</script>

<style>
/* @import url('vue-tailwind-modal/dist/vue-tailwind-modal.css'); */
@import url('@voerro/vue-tagsinput/dist/style.css');

/* Once I work out how to enable this only in dark mode we're good to go. */
/* .tags-input-wrapper-default {
  background: rgba(44,47,51,var(--tw-bg-opacity));
}
.tags-input input[type=text], .tags-input input[type=text]::placeholder {
  color: white;
} */
</style>