<template>
  <div>
    <van-nav-bar class="nav" style="font-family: 'Alibaba PuHuiTi 2.0'">
      <template #title>
        <img src="@/assets/top/starSmall.png" alt="" class="starSmall" />
        <img src="@/assets/top/topbg1.png" alt="" class="topbg1" />

        <img src="@/assets/personal/picture2.png" alt="" class="picture2" />

        <div class="info1">
          <p class="name">{{ username }}</p>
          <p class="level">Lv.{{ level }}</p>
        </div>
        <div class="search">
          <img src="@/assets/top/searchIcon.png" alt="" />
          <input type="text" class="searchInput" />
        </div>
        <div class="logo">
          <img src="@/assets/login/logo.png" alt="" />
        </div>
      </template>
    </van-nav-bar>
  </div>
</template>

<script>
export default {
  name: "topNav2",
  props: {
    username: {
      type: String,
      default: "用户名",
    },
    level: {
      type: Number,
      default: 1,
    },
    time: {
      type: Number,
      default: 0,
    },
    starNumber: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang="less" scoped>
.nav {
  position: relative;
  z-index: 10;
  background: linear-gradient(204deg, #5bcfff -8%, #097df4 157%);
  width: 100%;
  height: 44px;
  --van-font-bold: 800;
  --van-nav-bar-title-text-color: #fff;
  --van-nav-bar-title-font-size: 20px;
  .picture2 {
    width: 34px;
    height: 34px;
    position: absolute;
    left: 16px;
    top: 5px;
  }
  .starSmall {
    position: absolute;
    left: 12px;
    top: 5px;
  }
  .topbg1 {
    position: absolute;
    left: 16px;
    top: 10px;
  }
  .topbg2 {
    position: absolute;
    left: 107px;
    top: 10px;
  }
  .yellowStar {
    position: absolute;
    right: 79.43px;
    top: 14px;
  }
  .info1 {
    width: 55px;
    height: 20px;
    position: absolute;
    left: 52px;
    top: 12px;
    font-family: " Alibaba PuHuiTi 2.0";
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .name {
      font-weight: 700;
      color: #ffffff;
    }
    .level {
      font-weight: 900;
      background: linear-gradient(180deg, #ffffff 0%, #fce252 98%);
      -webkit-background-clip: text; /* Safari/Chrome 支持 */
      background-clip: text; /* 标准语法 */
      color: transparent; /* 关键：使文本透明以显示背景渐变 */
    }
  }
  .search {
    background: rgba(255, 255, 255, 0.45);
    width: 176px;
    height: 24px;
    border-radius: 9999px;
    position: absolute;
    right: 79px;
    top: 10px;
    display: flex;
    align-items: center;

    img {
      margin-left: 8px;
    }
    .searchInput {
      width: 154px;
      height: 12px;
      background: transparent;
      border: none;
      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 12px;
      font-weight: normal;
    }
  }
  .logo {
    object-fit: cover;
    position: absolute;
    right: 9.43px;
    top: 10px;
    width: 57.57px;
    height: 24px;
  }
}
</style>