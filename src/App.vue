<!--
 * @Descripttion: your project
 * @version: 1.0
 * @Author: chuang.ao
 * @Date: 2024-11-03 11:38:39
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-01 19:04:31
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
// @import "@/styles/index.less";
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
// .fade-enter-active,
// .fade-leave-active {
//   transition: opacity 0.3s ease;
// }

// .fade-enter-from,
// .fade-leave-to {
//   opacity: 0;
// }
// #app {
//   min-height: 100%;
// }
// @font-face {
//   font-family: "Alibaba PuHuiTi 2.0";
//   font-style: normal;
//   font-weight: 400;
//   src:
//     // src\assets\font\AlibabaPuHuiTi\AlibabaPuHuiTi-2-55-Regular.otf
//     // src\assets\font\AlibabaPuHuiTi\AlibabaPuHuiTi-2-55-Regular.ttfurl("src/assets/font/AlibabaPuHuiTi/AlibabaPuHuiTi-2-55-Regular.otf")
//       format("opentype"),
//     url("src/assets/font/AlibabaPuHuiTi/AlibabaPuHuiTi-2-55-Regular.ttf")
//       format("truetype");
//   /* 可选：指定字体显示策略（优化加载体验） */
//   font-display: swap;
// }
// @font-face {
//   font-family: "Alibaba PuHuiTi 3.0";
//   font-style: normal;
//   font-weight: 400;
//   src:
//     url("src/assets/font/AlibabaPuHuiTi/AlibabaPuHuiTi-3-55-Regular.otf")
//       format("opentype"),
//     url("src/assets/font/AlibabaPuHuiTi/AlibabaPuHuiTi-3-55-Regular.ttf")
//       format("truetype");
//   /* 可选：指定字体显示策略（优化加载体验） */
//   font-display: swap;
// }
// @font-face {
//   font-family: "GFS Didot";
//   font-style: normal;
//   font-weight: 400;
//   src:
//     url("src/assets/font/gfsdidot/gfsdidot-regular-webfont.woff2")
//       format("woff2"),
//     url("src/assets/font/gfsdidot/gfsdidot-regular-webfont.woff") format("woff"),
//     url("src/assets/font/gfsdidot/GFSDidot-Regular.ttf") format("truetype");
//   /* 可选：指定字体显示策略（优化加载体验） */
//   font-display: swap;
// }
// @font-face {
//   font-family: "Sansita One";
//   font-style: normal;
//   font-weight: 400;
//   src: url("src/assets/font/Sansita One.ttf") format("truetype");
//   /* 可选：指定字体显示策略（优化加载体验） */
//   font-display: swap;
// }
// @font-face {
//   font-family: "DingTalk JinBuTi";
//   font-style: normal;
//   font-weight: 400;
//   src: // src\assets\font\DingTalk JinBuTi.ttfurl("src/assets/font/DingTalk JinBuTi.ttf")
//     format("truetype");
//   /* 可选：指定字体显示策略（优化加载体验） */
//   font-display: swap;
// }
</style>
