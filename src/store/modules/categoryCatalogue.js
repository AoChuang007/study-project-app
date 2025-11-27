import { defineStore } from 'pinia';

export const useCatalogueStore = defineStore('categoryCatalogue', {
  state: () => ({
    currentIndex: 1,
  }),

  actions: {
    updateIndex(newIndex) {
      this.currentIndex = newIndex+1;
    },
  },
});