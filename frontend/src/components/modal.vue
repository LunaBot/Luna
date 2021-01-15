<template>
  <transition name="fade">
    <div
      v-if="showing"
      class="fixed inset-0 w-full h-screen flex items-center justify-center bg-quitedark z-50"
      @click.self="closeIfShown"
    >
      <div
        class="relative max-h-screen w-full max-w-2xl bg-white dark:bg-quitedark shadow-lg rounded-lg p-8 flex"
      >
        <button
          v-if="showClose"
          aria-label="close"
          class="absolute top-0 right-0 text-xl text-gray-500 my-2 mx-4"
          @click.prevent="close"
        >
          {{ closeText }}
        </button>
        <div class="overflow-auto max-h-screen w-full">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    showing: {
      required: true,
      type: Boolean,
    },
    closeText: {
      type: String,
      default: '×',
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    backgroundClose: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    showing(value: boolean) {
      const body = document.querySelector('body');
      const overflowClass = 'overflow-hidden';
      return value
        ? body?.classList.add(overflowClass)
        : body?.classList.remove(overflowClass);
    },
  },
  methods: {
    close() {
      const body = document.querySelector('body');
      const overflowClass = 'overflow-hidden';
      body?.classList.remove(overflowClass);
      this.$emit('close');
    },
    closeIfShown() {
      if (this.showClose && this.backgroundClose) {
        this.close();
      }
    },
  },
  mounted: function () {
    if (this.showClose) {
      document.addEventListener('keydown', (event) => {
        if (event.code.toLowerCase() === 'escape') {
          this.close();
        }
      });
    }
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.6s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>