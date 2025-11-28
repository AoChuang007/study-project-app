<template>
  <div class="shopping">
    <topNav title="积分商城">
      <template #right>
        <img
          src="@/assets/tree/icon2.png"
          alt=""
          class="location"
          @click="showAddLocationModal"
        />
      </template>
    </topNav>
    <div class="title">
      <p>进积分商城，享受更多好礼</p>
      <p class="text">参与活动轻松赢积分</p>
    </div>
    <div class="myself">
      <div class="box">
        <p class="title">我的学习积分</p>
        <p class="number">{{ userInfo.points }}</p>
        <!-- 学习积分 -->
      </div>
      <div class="box">
        <div class="second-box" @click="goToTarget">继续打卡学习</div>
        <p class="linktime">已连续打卡{{ userInfo.linktime }}天</p>
      </div>
    </div>
    <div class="tool">
      <div class="first">
        <img src="@/assets/tree/shopping/icon1.png" alt="" />
        <p>购物车</p>
      </div>
      <div class="second">
        <img src="@/assets/tree/shopping/icon2.png" alt="" />
        <p>我的订单</p>
      </div>
      <div class="third">
        <img src="@/assets/tree/shopping/icon3.png" alt="" />
        <p>积分明细</p>
      </div>
    </div>
    <div class="shop-box">
      <div v-for="(item, index) in shopList" :key="index" class="shop-item">
        <div class="logo-box">
          <img src="@/assets/tree/shopping/logo.png" alt="" class="logo" />
        </div>
        <div class="small-box">
          <img :src="item.src" alt="" class="picture" />
          <p class="discribe">{{ item.discribe }}</p>
          <p class="price">{{ item.price }}积分</p>
          <p class="already">已兑{{ item.already }}份</p>
        </div>
      </div>
    </div>

    <!-- 添加地址弹窗 -->
    <addLocation
      v-model:visible="showAddLocation"
      @confirm="handleAddressConfirm"
      @cancel="handleAddressCancel"
    />
  </div>
</template>

<script setup>
import pic1 from "@/assets/tree/shopping/picture1.png";
import pic2 from "@/assets/tree/shopping/picture2.png";
import pic3 from "@/assets/tree/shopping/picture3.png";
import pic4 from "@/assets/tree/shopping/picture4.png";
import topNav from "@/components/top/nomal.vue";
import { showToast } from "vant";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import addLocation from "./addLocation.vue";

const route = useRoute();
const router = useRouter();
const userInfo = ref({
  name: "小智",
  level: 2,
  time: 4.25,
  starNumber: 6,
  points: 1200,
  linktime: 1,
});

// 添加地址弹窗相关
const showAddLocation = ref(false);

// 显示添加地址弹窗
const showAddLocationModal = () => {
  showAddLocation.value = true;
};

// 处理地址确认
const handleAddressConfirm = (addressData) => {
  console.log("收到地址信息:", addressData);
  // 这里可以处理地址数据，比如保存到本地存储或发送到服务器
  showToast({
    message: "地址添加成功！",
    type: "success",
    duration: 2000,
  });
};

// 处理地址取消
const handleAddressCancel = () => {
  console.log("取消添加地址");
};

// 从路由参数中获取用户信息
onMounted(() => {
  if (route.query.name) {
    userInfo.value = {
      name: route.query.name,
      level: parseInt(route.query.level) || 2,
      time: parseFloat(route.query.time) || 4.25,
      starNumber: parseInt(route.query.starNumber) || 6,
      points: parseInt(route.query.points) || 1200,
      linktime: parseInt(route.query.linktime) || 1,
    };
  }
});

// 跳转到目标管理页面
const goToTarget = () => {
  router.push("/target");
};
// 商品列表
const shopList = [
  {
    src: pic1,
    discribe: "手绘可爱随身记事本",
    price: 1000,
    already: 30,
  },
  {
    src: pic2,
    discribe: "人生是旷野而不是轨道-手账本",
    price: 5000,
    already: 10,
  },
  {
    src: pic3,
    discribe: "简约风b5高颜值耐用-笔记本",
    price: 5500,
    already: 30,
  },
  {
    src: pic4,
    discribe: "按动式高颜值耐用速干-中性笔",
    price: 1000,
    already: 10,
  },
];
</script>

<style lang="less" scoped>
.shopping {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  object-fit: cover;
  background: linear-gradient(339deg, #abcfff 8%, #def8ff 48%);
  .location {
    width: 20px;
    height: 26px;
  }
  .title {
    margin-top: 13px;
    margin-left: 16px;
    font-family: "Alibaba PuHuiTi 2.0";
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    letter-spacing: 0px;
    color: #3d3d3d;
    .text {
      font-size: 11px;
      font-weight: normal;
    }
  }
  .myself {
    width: 345px;
    height: 90px;
    margin: 14px auto;
    padding: 0 16px 0px 25px;
    background: radial-gradient(
        67% 67% at 57% 50%,
        rgba(255, 255, 255, 0.75) 0%,
        rgba(255, 235, 235, 0) 100%
      ),
      linear-gradient(119deg, #c4e6fa 15%, rgba(61, 184, 241, 0.41) 116%);

    box-shadow: 3px 4px 10px 0px rgba(43, 89, 115, 0.37);

    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .box {
      display: flex;
      flex-direction: column;
      align-items: center;
      .linktime {
        font-size: 8px;
        font-weight: normal;
        line-height: 21px;
        color: #3d3d3d;
      }
    }

    .title {
      font-family: "Alibaba PuHuiTi 2.0";
      font-size: 14px;
      font-weight: normal;
      line-height: 21px;
      color: #3d3d3d;
      margin: 0 0 8px 0;
    }

    .number {
      font-family: "Alibaba PuHuiTi 2.0";
      font-size: 24px;
      font-weight: bold;
      line-height: 21px;
      color: #3d3d3d;
      margin: 0;
    }

    .second-box {
      width: 82px;
      height: 21px;
      border-radius: 10px;
      font-family: "Alibaba PuHuiTi 2.0";
      font-size: 11px;
      font-weight: normal;
      line-height: 21px;
      text-align: center;
      margin-bottom: 8px;
      color: #3d3d3d;

      background: radial-gradient(50% 50% at 50% 50%, #ffffff 0%, #daf9ff 97%);

      box-shadow: 2px 2px 10px 0px rgba(75, 129, 147, 0.34);
    }

    > div:last-child {
      text-align: center;

      p {
        font-family: "Alibaba PuHuiTi 2.0";
        font-size: 10px;
        color: #999999;
        margin: 0;
      }
    }
  }
  .tool {
    margin-top: 13px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .first,
    .second,
    .third {
      display: flex;
      align-items: center;
      img {
        width: 25px;
        height: 25px;
      }
      p {
        margin-left: 8px;
        font-family: "Alibaba PuHuiTi 2.0";
        font-size: 12px;
        font-weight: normal;
        line-height: 21px;
        letter-spacing: 0px;
        color: #3d3d3d;
      }
    }
  }
  .shop-box {
    margin-top: 25px;
    display: flex;
    justify-content: space-around;
    // align-items: flex-start;
    flex-wrap: wrap;
    // padding-left: 16px;
    .shop-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      margin-bottom: 14px;
      .logo-box {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 162px;
        height: 18px;
        border-radius: 9px 9px 0px 0px;
        background: #ffffff;

        position: relative;
        z-index: 5;
      }
      .small-box {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        width: 162px;
        height: 212px;
        background: #f9feff;
        border-radius: 0 0 9px 9px;
        position: relative;
        padding-top: 135px;
        // padding-left: 7px;

        font-family: "Alibaba PuHuiTi 2.0";
        font-size: 11px;
        font-weight: normal;
        line-height: 21px;
        letter-spacing: 0px;

        overflow: hidden;

        img {
          position: absolute;
          top: -17px;
          right: 0px;
        }
        .discribe {
          margin-left: 7px;
          margin-top: 5px;
          color: #3d3d3d;
        }
        .price {
          margin-top: 5px;
          margin-left: 7px;
          font-size: 16px;
          color: #dcb038;
        }
        .already {
          margin-left: 11px;
          font-size: 9px;
          font-weight: 300;
          color: #3d3d3d;
        }
      }
    }
  }
}
</style>
