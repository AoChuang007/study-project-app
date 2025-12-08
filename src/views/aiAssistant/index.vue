<!--
 * @Author: Chuang Ao chuang.ao@ly.com
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-08 15:03:30
 * @FilePath: /study-ai-zy-dev_0602 2/src/views/aiAssistant/index.vue
-->
<template>
  <div class="ai-assistant-container">
    <keep-alive>
      <component :is="isShow ? AiPage : Human" />
    </keep-alive>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AiPage from "./components/aiPage/index.vue";
import Human from "./components/human/index.vue";

const isShow = ref(false);
</script>

<style lang="less" scoped>
.ai-assistant-container {
  overflow: hidden;
  height: 100vh;
  width: 100%;
}
</style>
