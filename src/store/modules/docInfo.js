import { defineStore } from 'pinia';

export const useInfoStore = defineStore('docInfo',{
  state: () => ({
    info: 1,
  }),
  actions: {
    setInfo(newInfo) {
      this.info = newInfo + 1;
    },
  },
});