<template>
  <div class="footBox">
    <!-- <img src="@/assets/personal/bg2.png" alt="" class="centered-image" z-index="-1"> -->

    <div
      v-for="(item, index) in navItems"
      :key="index"
      class="nav-item"
      :class="{ active: activeIndex === index }"
      @click="handleNavClick(index, item.path)"
    >
      <img :src="activeIndex === index ? item.activeIcon : item.icon" alt="" />
      <p class="text">{{ item.label }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  default as homeIcon,
  default as homeIconActive,
} from "@/assets/icons/home.png";
import personActiveIcon from "@/assets/icons/person_active.png";
import personInactiveIcon from "@/assets/icons/person_inactive.png";
import reportIcon from "@/assets/icons/report.png";
import reportIconActive from "@/assets/icons/report_active.png";
import targetIcon from "@/assets/icons/target.png";
import targetIconActive from "@/assets/icons/target_active.png";
import treeIcon from "@/assets/icons/tree.png";
import treeIconActive from "@/assets/icons/tree_active.png";

const router = useRouter();
const route = useRoute();
const activeIndex = ref(0);
const navItems = ref([
  {
    label: "目标管理",
    icon: targetIcon,
    path: "/target",
    activeIcon: targetIconActive,
  },
  {
    label: "智能报告",
    icon: reportIcon,
    path: "/report",
    activeIcon: reportIconActive,
  },
  {
    label: "学习看板",
    icon: homeIcon,
    path: "/studyLook",
    activeIcon: homeIconActive,
  },
  {
    label: "爬树乐园",
    icon: treeIcon,
    path: "/tree",
    activeIcon: treeIconActive,
  },
  {
    label: "个人中心",
    icon: personInactiveIcon,
    path: "/personalCenter",
    activeIcon: personActiveIcon,
  },
]);

// 根据当前路由路径设置激活的导航项
const setActiveIndexByPath = (path) => {
  const index = navItems.value.findIndex((item) => item.path === path);
  if (index !== -1) {
    activeIndex.value = index;
  }
};

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    setActiveIndexByPath(newPath);
  }
);

// 组件挂载时设置初始激活状态
onMounted(() => {
  setActiveIndexByPath(route.path);
});

// 处理导航点击
const handleNavClick = (index, path) => {
  if (path !== "###") {
    router.push(path);
  }
};
</script>

<style lang="less" scoped>
.footBox {
  background: url("@/assets/personal/bg2.png") no-repeat;
  background-position: center center; /* 图片居中 */
  background-repeat: no-repeat; /* 不重复 */
  background-size: auto; /* 保持原始尺寸 */
  position: absolute;
  bottom: 0px;
  margin: 0;
  padding: 0;
  height: 49px;
  width: 375px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0px -1px 6px 0px #9dbbd7;
  z-index: 10;

  .nav-item {
    margin-top: 4px;
    margin-bottom: 1px;
    height: 44px;
    // width: 94px;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;
    flex-direction: column;

    .text {
      margin-top: 2px;
      color: #3d3d3d;
      font-family: Source Han Sans;
      text-align: left;
      font-size: 10px;
      letter-spacing: 0.1em;
    }

    &.active .text {
      margin-top: 3px;
      color: #2884ed;
    }
  }
}
.centered-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 居中 */
  /* 保持图片原始尺寸 */
  width: auto;
  height: auto;
  max-width: none;
  max-height: none;
}
.nav-item:nth-child(3) {
  position: relative;
  top: -25px;
  left: 0.5px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0px;
  .text {
    margin: 0px;
    position: absolute;
    bottom: -21px;
  }
}
.nav-item:nth-child(3).active {
  background-image: linear-gradient(
      180deg,
      #ffffff 9%,
      rgba(255, 255, 255, 0) 100%
    ),
    radial-gradient(50% 50% at 50% 50%, #ffffff 46%, #2ab0ff 100%);
  background-color: rgba(255, 255, 255, 0.35); /* 单独设置背景色 */
  /* 如果需要强制覆盖 */
}
</style>
