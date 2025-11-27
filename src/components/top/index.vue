<template>
  <div>
    <van-nav-bar :title="title" class="nav"  style="font-family: 'Alibaba PuHuiTi 2.0';">
      <template #right>
        <!-- <van-icon name="search" size="18" /> -->
        <img src="@/assets/icons/tool.png" alt="" />
      </template>
    </van-nav-bar>
  </div>
</template>

<script>
export default {
  name: "topNav",
  props: {
    title: {
      type: String,
    },
  },
};
</script>

<style lang="less" scoped>
.nav {
  z-index: 10;
  background: linear-gradient(204deg, #5bcfff -8%, #097df4 157%);
  width: 100%;
  height: 44px;
  --van-font-bold:800;
  --van-nav-bar-title-text-color: #fff;
  --van-nav-bar-title-font-size: 20px;
}
</style>