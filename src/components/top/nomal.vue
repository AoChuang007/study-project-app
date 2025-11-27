<template>
  <div>
    <van-nav-bar
      :title="title"
      class="nav"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <slot name="right"></slot>
      </template>
    </van-nav-bar>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  title: {
    type: String,
    required: false,
  }
})

const route = useRouter();
const onClickLeft = () => {
  route.back();
};
</script>

<style lang="less" scoped>
.nav {
  z-index: 10;
  background: linear-gradient(204deg, #5bcfff -8%, #097df4 157%);
   font-family: 'Alibaba PuHuiTi 2.0';
  width: 100%;
  height: 44px;
  --van-font-bold: 800;
  --van-nav-bar-title-text-color: #fff;
  --van-nav-bar-title-font-size: 16px;
  --van-nav-bar-icon-color: #ffffff;
}
</style>