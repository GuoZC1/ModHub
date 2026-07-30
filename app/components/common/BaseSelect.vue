<template>
  <div class="custom-select relative w-full" ref="selectContainer">
    <button
      type="button"
      class="relative w-full rounded-lg border bg-slate-900 px-4 py-2 text-left text-sm text-slate-700 outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-primary/30"
      :class="isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-400'"
      @click="toggleDropdown"
    >
      <span class="block truncate pr-6">{{ selectedLabel }}</span>
      <svg
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-900 shadow-lg"
    >
      <ul class="max-h-56 overflow-y-auto py-1">
        <li
          v-for="option in options"
          :key="option.value"
          class="cursor-pointer truncate px-3 py-2 text-sm text-white transition-colors hover:bg-primary/20 hover:text-primary"
          :class="{ 'bg-primary/20 text-primary': modelValue === option.value }"
          @click="handleSelect(option)"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Select platform",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const selectContainer = ref(null);

const selectedLabel = computed(() => {
  const current = props.options.find((option) => option.value === props.modelValue);
  if (current) return current.label;
  return props.placeholder;
});

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function handleSelect(option) {
  emit("update:modelValue", option.value);
  emit("change", option);
  isOpen.value = false;
}

function handleClickOutside(e) {
  if (selectContainer.value && !selectContainer.value.contains(e.target)) {
    isOpen.value = false;
  }
}

watch(
  () => props.modelValue,
  () => {
    isOpen.value = false;
  }
);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.custom-select ul::-webkit-scrollbar {
  width: 6px;
}

.custom-select ul::-webkit-scrollbar-track {
  background: #fff2f3;
}

.custom-select ul::-webkit-scrollbar-thumb {
  background: #fecaca;
  border-radius: 3px;
}

.custom-select ul::-webkit-scrollbar-thumb:hover {
  background: #fca5a5;
}
</style>