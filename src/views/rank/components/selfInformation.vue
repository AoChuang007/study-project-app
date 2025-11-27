<template>
  <div class="selfInformation">
    <topNav></topNav>
    <img src="@/assets/rank/information/bg.png" alt="" class="bg" />
    <div class="user-info-container" v-if="userInfo">
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
            :class="{ 'badge-obtained': isBadgeObtained(index) }"
            v-for="index in 10"
            :key="index"
          >
            <img
              :src="getBadgeImage(index)"
              :alt="`徽章${index}`"
              class="badge-item"
            />
            <p class="badge-name">{{ badgeNames[index] }}</p>
            <p class="wait" v-if="!isBadgeObtained(index)">待解锁</p>
          </div>
          <span class="text"
            >累计勋章
            <span class="special">{{ obtainedBadgeCount }}</span> 块</span
          >
        </div>
      </div>
      <div class="rank-info">
        <div class="small-box">
          <span
            ><span class="special">{{
              convertTimeToHours(userInfo.todaytime)
            }}</span>
            小时</span
          >
          <p>今日已学</p>
        </div>
        <div class="small-box">
          <span
            ><span class="special">{{ userInfo.points }}</span> 分</span
          >
          <p>所获积分</p>
        </div>
        <div class="small-box">
          <span
            ><span class="special">{{
              convertTimeToHours(userInfo.alltime)
            }}</span>
            小时</span
          >
          <p>累计已学</p>
        </div>
      </div>
    </div>
    <div v-else class="no-data">
      <p>暂无用户信息</p>
    </div>
  </div>
</template>

<script setup>
import topNav from "@/components/top/nomal.vue";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const userInfo = ref(null);

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
const badgeNames = {
  1: "学习唤醒师",
  2: "沉默终结者",
  3: "知识重逢客",
  4: "学习重启手",
  5: "沉寂突破者",
  6: "沉默打破手",
  7: "学习回归使",
  8: "久别学习伴",
  9: "互动重启员",
  10: "学习归队兵",
};

// 获取徽章图片地址的方法
const getBadgeImage = (badgeIndex) => {
  // 判断徽章是否已获得，如果已获得显示1-10的图片，否则显示11-20的图片
  const isObtained = isBadgeObtained(badgeIndex);
  const imageIndex = isObtained ? badgeIndex : badgeIndex + 10;
  return badgeImages[imageIndex] || "src/assets/rank/badge/badge1.png"; // 默认图片
};

// 判断徽章是否已获得
const isBadgeObtained = (badgeIndex) => {
  if (!userInfo.value || !userInfo.value.badge) return false;

  let obtainedBadges = [];

  // 如果badge是数组，直接使用
  if (Array.isArray(userInfo.value.badge)) {
    obtainedBadges = userInfo.value.badge;
  }
  // 如果badge是数字，生成从1到该数字的数组
  else if (typeof userInfo.value.badge === "number") {
    obtainedBadges = Array.from(
      { length: userInfo.value.badge },
      (_, i) => i + 1
    );
  }

  return obtainedBadges.includes(badgeIndex);
};

// 计算获得的徽章数量
const obtainedBadgeCount = computed(() => {
  if (!userInfo.value || !userInfo.value.badge) return 0;

  // 如果badge是数组，返回数组长度
  if (Array.isArray(userInfo.value.badge)) {
    return userInfo.value.badge.length;
  }

  // 如果badge是数字，直接返回该数字
  if (typeof userInfo.value.badge === "number") {
    return userInfo.value.badge;
  }

  return 0;
});

// 将时间格式转换为小时数值
const convertTimeToHours = (timeStr) => {
  if (!timeStr) return 0;

  // 匹配小时和分钟
  const hourMatch = timeStr.match(/(\d+)h/);
  const minMatch = timeStr.match(/(\d+)min/);

  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minMatch ? parseInt(minMatch[1]) : 0;

  // 转换为小时（不保留小数）
  return Math.round(hours + minutes / 60);
};

// 获取路由参数中的用户信息
onMounted(() => {
  if (route.query.userInfo) {
    try {
      userInfo.value = JSON.parse(route.query.userInfo);
    } catch (error) {
      console.error("解析用户信息失败:", error);
    }
  }
});
</script>

<style lang="less" scoped>
.selfInformation {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  // padding-bottom: 20px;
  // position:relative;
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
  .user-info-container {
    position: relative;
    z-index: 2;
    width: 100%;
    .message1 {
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
      margin-bottom: 13px;
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
          position: absolute;
          left: 204px;
          bottom: 46px;
          font-family: "Alibaba PuHuiTi 2.0";
          font-size: 14px;
          font-weight: normal;
          line-height: 20px;
          text-align: center;
          letter-spacing: 0px;
          color: #000000;

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
    .rank-info {
      margin: 0 auto;
      width: 343px;
      height: 100px;
      border-radius: 8px;

      display: flex;
      justify-content: space-around;
      align-items: center;

      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.7),
          rgba(255, 255, 255, 0.7)
        ),
        linear-gradient(
          180deg,
          #a0d4ff 0%,
          rgba(255, 255, 255, 0) 53%,
          rgba(255, 255, 255, 0) 100%
        );

      .small-box {
        font-family: "Alibaba PuHuiTi 2.0";
        font-size: 14px;
        font-weight: normal;
        line-height: 20px;
        text-align: center;
        letter-spacing: 0px;
        .special {
          font-family: Sansita One;
          font-size: 28px;
          font-weight: normal;
          line-height: 40px;
          letter-spacing: 0px;
          color: #3fb3fb;

          text-shadow: 0px 4px 10px rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
}
</style>