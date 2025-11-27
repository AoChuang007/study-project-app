<template>
  <div class="moreBage">
    <topNav></topNav>
    <img src="@/assets/rank/information/bg.png" alt="" class="bg" />

    <div class="message1">
      <p class="name">{{ userInfo.name }}</p>
      <img :src="userInfo.picture" alt="" class="avatar" />
    </div>
    <div class="badge-count">
        <div class="title">
          <img src="@/assets/rank/information/icon.png" alt="" />
          <p>所获勋章</p>
        </div>
        <div class="badge-list">
          <div
            class="badge-small-box"
            :class="{ 'badge-obtained': isBadgeObtained(badge) }"
            v-for="badge in allBadges"
            :key="badge.id"
          >
            <img
              :src="getBadgeImage(badge)"
              :alt="badge.badgeName"
              class="badge-item"
            />
            <p class="badge-name">{{ badge.badgeName }}</p>
            <p class="wait" v-if="!isBadgeObtained(badge)">待解锁</p>
          </div>
          <span class="text" :class="allBadges.length <= 4 ? 'position-relative' : 'position-absolute'"
            >累计勋章
            <span class="special">{{ obtainedBadgeCount }}</span> 块</span
          >
        </div>
      </div>
  </div>
</template>

<script setup>
import topNav from "@/components/top/nomal.vue";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { getUserObtainedBadges, getUserUnobtainedBadges } from "../api/index.js";

const route = useRoute();
const userInfo = ref({});
const obtainedBadges = ref([]);
const unobtainedBadges = ref([]);
const allBadges = ref([]);

// 获取勋章数据
const fetchBadgesData = async () => {
  try {
    const [obtainedRes, unobtainedRes] = await Promise.all([
      getUserObtainedBadges(),
      getUserUnobtainedBadges()
    ]);
    
    obtainedBadges.value = obtainedRes.data || [];
    unobtainedBadges.value = unobtainedRes.data || [];
    
    // 合并所有勋章数据，已获得的在前
    allBadges.value = [...obtainedBadges.value, ...unobtainedBadges.value];
  } catch (error) {
    console.error("获取勋章数据失败:", error);
  }
};

// 在组件挂载时获取路由传递的用户信息和勋章数据
onMounted(async () => {
  if (route.query.userInfo) {
    try {
      userInfo.value = JSON.parse(route.query.userInfo);
    } catch (error) {
      console.error("解析用户信息失败:", error);
      // 设置默认值
      userInfo.value = {
        name: "用户",
        picture: "../src/assets/rank/picture8.png",
      };
    }
  }
  
  // 获取勋章数据
  await fetchBadgesData();
});
// 徽章图片地址配置
const badgeImages = {
  // 获得状态的徽章 (1-10)
  1: "src/assets/rank/badge/badge1.png",
  2: "src/assets/rank/badge/badge2.png",
  3: "src/assets/rank/badge/badge3.png",
  4: "src/assets/rank/badge/badge4.png",
  5: "src/assets/rank/badge/badge5.png",
  6: "src/assets/rank/badge/badge6.png",
  7: "src/assets/rank/badge/badge7.png",
  8: "src/assets/rank/badge/badge8.png",
  9: "src/assets/rank/badge/badge9.png",
  10: "src/assets/rank/badge/badge10.png",
  // 未获得状态的徽章 (11-20)
  11: "src/assets/rank/badge/badge11.png",
  12: "src/assets/rank/badge/badge12.png",
  13: "src/assets/rank/badge/badge13.png",
  14: "src/assets/rank/badge/badge14.png",
  15: "src/assets/rank/badge/badge15.png",
  16: "src/assets/rank/badge/badge16.png",
  17: "src/assets/rank/badge/badge17.png",
  18: "src/assets/rank/badge/badge18.png",
  19: "src/assets/rank/badge/badge19.png",
  20: "src/assets/rank/badge/badge20.png",
};

// 徽章名称配置
// const badgeNames = {
//   1: "学习唤醒师",
//   2: "沉默终结者",
//   3: "知识重逢客",
//   4: "学习重启手",
//   5: "沉寂突破者",
//   6: "沉默打破手",
//   7: "学习回归使",
//   8: "久别学习伴",
//   9: "互动重启员",
//   10: "学习归队兵",
// };

// 获取徽章图片地址的方法
const getBadgeImage = (badge) => {
  // 如果勋章数据中有图片地址，直接使用
  if (badge.badgeImage) {
    return badge.badgeImage;
  }
  
  // 否则使用默认图片逻辑
  const isObtained = isBadgeObtained(badge);
  const imageIndex = isObtained ? (badge.id % 10 || 10) : ((badge.id % 10 || 10) + 10);
  return badgeImages[imageIndex] || "src/assets/rank/badge/badge1.png"; // 默认图片
};

// 判断徽章是否已获得
const isBadgeObtained = (badge) => {
  // 检查该勋章是否在已获得的勋章列表中
  return obtainedBadges.value.some(obtainedBadge => obtainedBadge.id === badge.id);
};

// 计算获得的徽章数量
const obtainedBadgeCount = computed(() => {
  return obtainedBadges.value.length;
});

</script>

<style lang="less" scoped>
.moreBage {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  overflow: hidden;
  .bg {
    position: absolute;
    top: -50px;
    left: -96px;
    z-index: 1;
    /* 保持图片原始尺寸 */
    width: auto;
    height: auto;
    max-width: none;
    max-height: none;
  }
  .message1 {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    .name {
      font-family: Roboto;
      font-size: 14px;
      font-weight: 600;
      line-height: 21px;
      letter-spacing: 0px;
      color: #000000;
      margin: 7px 0 3px;
    }
    .avatar {
      width: 66px;
      height: 69px;
    }
  }
  .badge-count {
      margin-top: -10px;
      .title {
        display: flex;
        justify-content: flex-start;

        font-family:"Alibaba PuHuiTi 2.0";
font-size: 14px;
font-weight: normal;
line-height: 21px;
letter-spacing: 0px;
color: #000000;
        img {
          margin-left: 30px;
          margin-right: 7px;
        }
      }

      .badge-list {
        display: flex;
        flex-wrap: wrap;
        row-gap: 27px;
        column-gap: 24px;
        margin-top: 6px;

        position: relative;

        background: rgba(255, 255, 255, 0.4);
        border-radius: 8px;
        width: 343px;
        // height: 275px;
        margin: 6px auto 0;
        padding: 12px 13px 7px 14px;

        .badge-small-box {
          background: #f5f5f5;
          position: relative;
          box-shadow: 0px 4px 6px 0px #b7d7eb;
          width: 61px;
          height: 91px;
          border-radius: 8px;
          // margin-right: 3px;

          display: flex;
          justify-content: center;
          align-items: center;
          // align-content: space-around;
          flex-direction: column;

          .badge-item {
            object-fit: contain;
          }

          .badge-name {
            font-family: "Alibaba PuHuiTi 2.0";
            font-size: 10px;
            font-weight: normal;
            line-height: 20px;
            letter-spacing: 0px;

            color: #3d3d3d;
            text-align: center;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 55px;
          }

          .wait {
            font-size: 7px;
          }

          // 已获得徽章的样式
          &.badge-obtained {
            background: #f5f5f5;
            border: 1px solid #2884ed;

            box-shadow: 0px 4px 6px 0px #b7d7eb;

            .badge-name {
              color: #2884ed;
              font-weight: 500;
            }
          }
        }

        .text {
          font-family: "Alibaba PuHuiTi 2.0";
          font-size: 14px;
          font-weight: normal;
          line-height: 20px;
          text-align: center;
          letter-spacing: 0px;
          color: #000000;
          
          // 当勋章数量大于4个时，使用绝对定位
          &.position-absolute {
            position: absolute;
            left: 204px;
            bottom: 46px;
          }
          
          // 当勋章数量小于等于4个时，另起一行显示在右下角
          &.position-relative {
            width: 100%;
            text-align: right;
            margin-bottom: 20px;
            padding-right: 24px;
          }

          .special {
            font-family: "Sansita One";
            font-size: 36px;
            font-weight: normal;
            line-height: 40px;
            letter-spacing: 0px;
            text-shadow: 0px 4px 10px rgba(255, 255, 255, 0.3);
            color: #3fb3fb;
            margin: 9px 0px;
          }
        }
      }
    }
}
</style>