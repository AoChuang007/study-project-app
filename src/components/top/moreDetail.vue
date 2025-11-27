<template>
  <div>
    <van-nav-bar class="nav" style="font-family: 'Alibaba PuHuiTi 2.0'">
      <template #title>
        <img src="@/assets/top/starSmall.png" alt="" class="starSmall" />
        <img src="@/assets/top/topbg1.png" alt="" class="topbg1" />
        <img src="@/assets/top/topbg2.png" alt="" class="topbg2" />
        <img src="@/assets/personal/picture2.png" alt="" class="picture2" />
        <img src="@/assets/top/yellowStar.png" alt="" class="yellowStar" />

        <div class="info1">
          <p class="name">{{ username }}</p>
          <p class="level">Lv.{{ level }}</p>
        </div>
        <div class="info2">
          <p class="text3">今日已学习</p>
          <p class="text4">{{ time }}</p>
          <p class="text3">小时</p>
        </div>
        <div class="info3">
          <p class="text1">x</p>
          <p class="text2">{{ starNumber }}</p>
        </div>
      </template>
      <template #right>
        <!-- <van-icon name="search" size="18" /> -->
        <img src="@/assets/icons/tool.png" alt="" />
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
  .info2 {
    font-family: "Alibaba PuHuiTi 2.0";
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;
    text-align: center;
    letter-spacing: 0px;
    width: 91px;
    height: 12px;
    position: absolute;
    left: 119px;
    top: 16px;
     display: flex;
    align-items: center;
    justify-content: space-between;
    .text3 {
      color: #ffffff;
      font-weight: 500;
      font-size: 9px;
    }
    .text4 {
        color: #fce252;
      font-weight: 700;
      font-size: 11px;
    }
  }
  .info3 {
    width: 22.5px;
    height: 20px;
    line-height: 16px;
    letter-spacing: 0.06em;
    color: #ffffff;
    position: absolute;
    right: 52.75px;
    top: 17px;
    display: flex;
    align-items: center;

    .text1 {
      font-family: Alibaba PuHuiTi 3;
      font-weight: 800;
      font-size: 12px;
    }
    .text2 {
      font-family: "Alibaba PuHuiTi 3.0";
      font-weight: 600;
      font-size: 16px;
    }
  }
}
</style>