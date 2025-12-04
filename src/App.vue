<!--
 * @Descripttion: your project
 * @version: 1.0
 * @Author: chuang.ao
 * @Date: 2024-11-03 11:38:39
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-03 14:57:37
-->
<template>
  <!-- 暗黑主题 -->
  <!-- <van-config-provider theme="dark"></van-config-provider> -->
  <RouterView>
    <template #default="{ Component, route }">
      <!-- <transition name="fade"> -->
      <keep-alive v-if="route.meta.keepAlive">
        <component :is="Component" :key="route.path" />
      </keep-alive>
      <component v-else :is="Component" :key="route.path" />
      <!-- <component :is="Component" :key="route.path" /> -->
      <!-- </transition> -->
    </template>
  </RouterView>
</template>

<script setup>
import "vant/es/dialog/style";
import "vant/es/image-preview/style";
import "vant/es/notify/style";
import "vant/es/toast/style";
import "vant/lib/index.css";
</script>

<style lang="less">
// 全局样式
@import "@/styles/index.less";
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
