<template>
  <div class="rank-page">
    <topNav title="排行榜"></topNav>
    <div class="titleBox">
      <div class="first" @click="chose = true">
        <p :class="chose ? 'active' : ' inactive'">学习时长</p>
        <div class="line" v-if="chose"></div>
      </div>
      <div class="secound" @click="chose = false">
        <p :class="!chose ? 'active' : ' inactive'">所获积分</p>
        <div class="line" v-if="!chose"></div>
      </div>
    </div>

    <div class="starBox">
      <img
        src="@/assets/rank/star.png"
        alt=""
        v-for="i in starNumber"
        :key="i"
        :class="'star' + i"
      />
    </div>

    <div class="choseDay" v-if="chose">
      <div :class="choseDay ? 'active' : 'inactive'" @click="choseDay = true">
        日榜
      </div>
      <div :class="!choseDay ? 'active' : 'inactive'" @click="choseDay = false">
        总榜
      </div>
    </div>
    <div class="pillarBox">
      <div class="bg">
        <img src="@/assets/rank/left.png" alt="" class="left" />
        <img src="@/assets/rank/center2.png" alt="" class="center" />
        <img src="@/assets/rank/right.png" alt="" class="right" />
        <p class="rankNum first">1</p>
        <p class="rankNum second">2</p>
        <p class="rankNum third">3</p>
        <img src="@/assets/rank/goldKing.png" alt="" class="gold" />
        <img src="@/assets/rank/silver.png" alt="" class="silver" />
        <img src="@/assets/rank/copper.png" alt="" class="copper" />
      </div>
      <div class="top-three">
        <div
          v-for="item in rankListReal.slice(0, 3)"
          :key="item.id"
          class="top-user"
          :class="`rank-${item.rank}`"
          @click="goToUserInfo(item)"
        >
          <img
            :src="item.picture || pic1"
            :alt="item.name || item.username || '用户'"
            class="user-avatar"
            :class="`picture-${item.rank}`"
          />
          <p class="user-name">{{ item.name || item.username || "用户" }}</p>
        </div>
      </div>
    </div>
    <!-- 剩余的排名 -->
    <div class="remainRank">
      <div class="liuhai"></div>
      <div class="remainBox">
        <div
          v-for="item in rankListReal.slice(3)"
          :key="item.id"
          class="rank-item"
        >
          <div class="rank-number">{{ item.rank }}</div>
          <img
            :src="item.picture || pic1"
            :alt="item.name || item.username || '用户'"
            class="user-avatar"
          />
          <div class="user-info">
            <p class="user-name">{{ item.name || item.username || "用户" }}</p>
          </div>
          <div class="user-time">
            <span v-if="chose && choseDay">{{
              formatTimeDisplay(item.dailyHours) || item.todaytime || "0h0min"
            }}</span>
            <span v-else-if="chose && !choseDay">{{
              formatTimeDisplay(item.totalHours) || item.alltime || "0h"
            }}</span>
            <span v-else>{{ item.points || 0 }}分</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 自己的排名 -->
    <div class="myselfRank">
      <div class="my-rank-content">
        <div class="my-rank-number">
          <span v-if="getMyRank()">{{ getMyRank() }}</span>
          <span v-else class="no-rank"></span>
        </div>
        <img :src="myInfo.picture" :alt="myInfo.name" class="my-avatar" />
        <div class="my-info">
          <p class="my-name">{{ myInfo.name }}</p>
          <p class="my-time">
            <span v-if="chose && choseDay">{{ myInfo.todaytime }}</span>
            <span v-else-if="chose && !choseDay">{{ myInfo.alltime }}</span>
            <span v-else>{{ myInfo.points }}分</span>
          </p>
        </div>
        <div class="my-rank-status">
          <span v-if="getMyRank()">第{{ getMyRank() }}名</span>
          <span v-else>暂未上榜</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import pic1 from "@/assets/rank/picture1.png";
import pic2 from "@/assets/rank/picture2.png";
import pic3 from "@/assets/rank/picture3.png";
import pic4 from "@/assets/rank/picture4.png";
import pic5 from "@/assets/rank/picture5.png";
import pic6 from "@/assets/rank/picture6.png";
import pic7 from "@/assets/rank/picture7.png";
import pic8 from "@/assets/rank/picture8.png";
import topNav from "@/components/top/nomal.vue";
import { getUserInfo } from "@/views/personalCenter/api/index.js";
import {
  getDailyStudyTimeRank,
  getPointsRank,
  getStudyStats,
  getTotalStudyTimeRank,
  getUserInfoById,
} from "@/views/rank/api/index.js";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const picturesArr = [pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8];

const router = useRouter();
const starNumber = 6;
const chose = ref(true);
const choseDay = ref(true);

// 真实接口数据
const rankListReal = ref([]);

// 个人信息
const myInfo = ref({
  id: null,
  name: "加载中...",
  picture: pic8, // 默认头像
  todaytime: "0h0min",
  alltime: "0h",
  points: 0,
  badge: 5, // 暂时不需要，保持默认值
});

// 将小时数转换为时分格式的通用函数
const formatTimeDisplay = (hours) => {
  if (!hours && hours !== 0) return null;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h${m}min`;
};

// 获取学习统计数据
const fetchStudyStats = async () => {
  try {
    const response = await getStudyStats();
    if (response.data) {
      const data = response.data;

      // 更新个人信息中的学习数据
      myInfo.value.todaytime = formatTimeDisplay(data.dailyHours) || "0h0min";
      myInfo.value.alltime = formatTimeDisplay(data.totalHours) || "0h";
      myInfo.value.points = data.points || 0;
      myInfo.value.id = data.id || data.userId;
    }
  } catch (error) {
    console.error("获取学习统计数据失败:", error);
  }
};

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await getUserInfo();
    if (response.data) {
      const data = response.data;
      myInfo.value.name = data.username || data.nickname || "未知用户";
      myInfo.value.id = data.id;
      // 如果后端返回了头像字段，使用它，否则保持默认
      if (data.avatar || data.picture) {
        myInfo.value.picture = data.avatar || data.picture;
      }
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    myInfo.value.name = "获取失败";
  }
};

// 根据用户ID获取详细信息并合并到排行榜数据
const mergeUserDetailsToRankData = async (rankData) => {
  try {
    // 并发获取所有用户的详细信息
    const userDetailsPromises = rankData.map(async (item) => {
      if (item.userId || item.id) {
        try {
          const userResponse = await getUserInfoById(item.userId || item.id);
          if (userResponse && userResponse.data) {
            const userDetail = userResponse.data;
            return {
              ...item,
              name:
                userDetail.username ||
                userDetail.nickname ||
                item.name ||
                `用户${item.id}`,
              picture:
                userDetail.avatarUrl ||
                item.picture ||
                item.avatar ||
                picturesArr[((item.rank || 1) - 1) % 8],
              phone: userDetail.phone,
              email: userDetail.email,
              bio: userDetail.bio,
              gender: userDetail.gender,
              birthday: userDetail.birthday,
            };
          }
        } catch (error) {
          console.error(
            `获取用户${item.userId || item.id}详细信息失败:`,
            error
          );
        }
      }
      return item;
    });

    const mergedData = await Promise.all(userDetailsPromises);
    return mergedData;
  } catch (error) {
    console.error("合并用户详细信息失败:", error);
    return rankData;
  }
};

// 获取排行榜数据的接口
const getRankData = async () => {
  try {
    let response;

    if (chose.value) {
      // 学习时长
      if (choseDay.value) {
        response = await getDailyStudyTimeRank(); // 日榜
      } else {
        response = await getTotalStudyTimeRank(); // 总榜
      }
    } else {
      // 所获积分
      response = await getPointsRank();
    }

    // 处理接口返回的数据
    if (response && response.data) {
      let rankData = response.data.list || response.data || [];

      // 处理数据格式，确保字段统一
      rankData = rankData.map((item, index) => ({
        ...item,
        rank: item.rank || index + 1,
        name: item.name || item.username || `用户${item.id || index + 1}`,
        picture: item.picture || item.avatar || picturesArr[index % 8],
        points: item.points || 0,
        // 保持原有字段以兼容不同的数据格式
        todaytime:
          item.todaytime || formatTimeDisplay(item.dailyHours) || "0h0min",
        alltime: item.alltime || formatTimeDisplay(item.totalHours) || "0h",
      }));

      // 获取用户详细信息并合并到排行榜数据中
      const mergedRankData = await mergeUserDetailsToRankData(rankData);

      rankListReal.value = mergedRankData;
      console.log("获取排行榜数据成功:", response.data);
      console.log("合并用户详细信息后的rankListReal:", rankListReal.value);
    } else {
      // 如果接口暂未实现，使用模拟数据
      console.log("接口暂未实现，使用模拟数据");
      rankListReal.value = rankList.value;
    }
  } catch (error) {
    console.error("获取排行榜数据失败:", error);
    // 出错时使用模拟数据
    rankListReal.value = rankList.value;
  }
};

// 计算个人排名
const getMyRank = () => {
  const myRank = rankListReal.value.find((item) => item.id === myInfo.value.id);
  return myRank ? myRank.rank : null;
};

// 跳转到用户信息页面
const goToUserInfo = (userInfo) => {
  router.push({
    name: "selfInformation",
    query: {
      userInfo: JSON.stringify(userInfo),
    },
  });
};

// 监听选择变化，重新获取数据
watch([chose, choseDay], () => {
  getRankData();
});

// 页面加载时获取初始数据
onMounted(async () => {
  // 并行获取用户信息和学习统计数据
  await Promise.all([fetchUserInfo(), fetchStudyStats()]);
  // 获取排行榜数据
  getRankData();
});

const rankList = ref([
  {
    id: 1,
    rank: 1,
    name: "张俊杰",
    picture: pic1,
    todaytime: "4h", //今日时长
    alltime: "120h", //总学习时长
    points: 2145, //积分
    badge: 9, //徽章数量
  },
  {
    id: 2,
    rank: 2,
    name: "王明阳",
    picture: pic2,
    todaytime: "5h", //今日时长
    alltime: "115h", //总学习时长
    points: 2145, //积分
    badge: 5, //徽章数量
  },
  {
    id: 3,
    rank: 3,
    name: "陈飞与",
    picture: pic3,
    todaytime: "5h32min", //今日时长
    alltime: "110h", //总学习时长
    points: 2145, //积分
    badge: 8, //徽章数量
  },
  {
    id: 4,
    rank: 4,
    name: "刘一鸣",
    picture: pic4,
    todaytime: "72h36min", //今日时长
    alltime: "72h36min", //总学习时长
    points: 2145, //积分
    badge: 9, //徽章数量
  },
  {
    id: 5,
    rank: 5,
    name: "李兰风",
    picture: pic5,
    todaytime: "68h36min", //今日时长
    alltime: "72h36min", //总学习时长
    points: 2145, //积分
    badge: 9, //徽章数量
  },
  {
    id: 6,
    rank: 6,
    name: "马思远",
    picture: pic6,
    todaytime: "64h36min", //今日时长
    alltime: "72h36min", //总学习时长
    points: 2145, //积分
    badge: 9, //徽章数量
  },
  {
    id: 7,
    rank: 7,
    name: "张小丽",
    picture: pic7,
    todaytime: "59h36min", //今日时长
    alltime: "72h36min", //总学习时长
    points: 2145, //积分
    badge: 9, //徽章数量
  },
  {
    id: 7,
    rank: 8,
    name: "张小丽",
    picture: pic5,
    todaytime: "72h36min", //今日时长
    alltime: "72h36min", //总学习时长
    points: 2145, //积分
    badge: 9, //徽章数量
  },
  {
    id: 7,
    rank: 9,
    name: "张小丽",
    picture: pic2,
    todaytime: "72h36min", //今日时长
    alltime: "72h36min", //总学习时长
    points: 2145, //积分
    badge: 9, //徽章数量
  },
]);
</script>

<style lang="less" scoped>
.rank-page {
  min-height: 100vh;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  position: relative;
  .titleBox {
    display: flex;
    justify-content: space-around;
    font-family: "Alibaba PuHuiTi 2";
    font-size: 16px;
    font-weight: bold;
    line-height: 21px;
    letter-spacing: 0px;

    position: relative;
    z-index: 10;
    .line {
      width: 52px;
      height: 3px;
      border-radius: 8px;
      background: #80c1f6;
    }
    .first,
    .secound {
      margin-top: 11px;
      display: flex;
      flex-direction: column;
      align-items: center;
      p {
        margin-bottom: 2px;
      }
      .active {
        color: #3d3d3d;
      }
      .inactive {
        color: #a4a4a4;
      }
    }
  }
  .starBox {
    .star1 {
      width: 18px;
      height: 21px;
      position: absolute;
      left: 9px;
      top: 104px;
    }
    .star2 {
      width: 12px;
      height: 14px;
      position: absolute;
      left: 50px;
      top: 76px;
    }
    .star3 {
      width: 15px;
      height: 17px;
      position: absolute;
      left: 61px;
      top: 139px;
    }
    .star4 {
      width: 20px;
      height: 23px;
      position: absolute;
      right: 12px;
      top: 156px;
    }
    .star5 {
      width: 12px;
      height: 14px;
      position: absolute;
      right: 36px;
      top: 149px;
    }
    .star6 {
      width: 11px;
      height: 13px;
      position: absolute;
      right: 31px;
      top: 205px;
    }
  }
  .choseDay {
    position: absolute;
    z-index: 10;
    right: 36px;
    top: 98px;
    background: rgba(255, 255, 255, 0.6);
    width: 95px;
    height: 20px;
    border-radius: 16px;

    display: flex;
    align-items: center;
    text-align: center;

    font-family: "Alibaba PuHuiTi 2.0";
    font-size: 14px;
    font-weight: bold;
    line-height: 21px;
    letter-spacing: 0px;
    .active {
      width: 46px;
      height: 20px;
      border-radius: 16px;
      background: #a8d5fa;
      color: #3d3d3d;
    }
    .inactive {
      width: 46px;
      height: 20px;
      color: #a4a4a4;
    }
  }
  .pillarBox {
    display: flex;

    .bg {
      font-family: "Sansita One";
      font-size: 40px;
      font-weight: normal;
      line-height: 40px;
      letter-spacing: 0px;

      color: #ffffff;

      text-shadow: 0px 4px 10px rgba(255, 255, 255, 0.3);

      .left {
        position: absolute;
        right: 175px;
        top: 78px;
      }
      .center {
        position: absolute;
        top: 172px;
        right: -1px;
      }
      .right {
        position: absolute;
        top: 116px;
        left: 175px;
      }
      .first {
        position: absolute;
        top: 231px;
        left: 182px;
      }
      .second {
        position: absolute;
        top: 254px;
        left: 87px;
      }
      .third {
        position: absolute;
        top: 259px;
        right: 83px;
      }
      .gold {
        position: absolute;
        top: 65px;
        left: 175px;
      }
      .silver {
        position: absolute;
        top: 104px;
        left: 56px;
      }
      .copper {
        position: absolute;
        top: 125px;
        right: 13.55px;
      }
    }

    .top-three {
      .top-user {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 4px;
        }

        .user-name {
          font-family: "Source Han Sans";
          font-size: 12px;
          font-weight: bold;
          line-height: normal;
          letter-spacing: 0em;
          color: #3d3d3d;
        }

        .user-time,
        .user-points {
          font-size: 10px;
          color: #666;
          margin: 0;
        }

        &.rank-1 {
          top: 104px;
          left: 50%;
          transform: translateX(-50%);
        }

        &.rank-2 {
          top: 145px;
          left: 25%;
          transform: translateX(-50%);
        }

        &.rank-3 {
          top: 176px;
          right: 25%;
          transform: translateX(50%);
        }
        .picture-1 {
          width: 64px;
          height: 64px;
          margin-bottom: 8px;
        }
        .picture-2 {
          width: 53px;
          height: 53px;
          margin-bottom: 8px;
        }
        .picture-3 {
          width: 49px;
          height: 49px;
        }
      }
    }
  }
  .remainRank {
    position: absolute;
    top: 295px;
    .liuhai {
      position: relative;
      z-index: 1;
      width: 375px;
      height: 22px;
      border-radius: 16px 16px 1px 1px;

      background: linear-gradient(180deg, #ffffff 0%, #78bcf9 75%);
    }
    .remainBox {
      position: absolute;
      top: 0px;
      width: 375px;
      height: 305px;
      border-radius: 16px 16px 0px 0px;
      padding: 38px 31px 0 14px;
      box-sizing: border-box;
      overflow-y: auto;
      overflow-x: hidden;

      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.75),
          rgba(255, 255, 255, 0.75)
        ),
        linear-gradient(
          180deg,
          #028fe9 0%,
          #e2f4ff 88%,
          rgba(238, 248, 253, 0) 100%
        );

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.8);
      }

      .rank-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: none;
        }

        .rank-number {
          font-family: "Alibaba PuHuiTi 2.0";
          font-size: 16px;
          font-weight: bold;
          line-height: 21px;
          color: #3d3d3d;

          margin-right: 16px;
        }

        .user-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 20px;
        }

        .user-info {
          flex: 1;

          .user-name {
            font-family: "Source Han Sans";
            font-size: 12px;
            font-weight: bold;
            line-height: normal;
            letter-spacing: 0em;
            color: #3d3d3d;
            margin: 0;
          }
        }

        .user-time {
          font-family: "Alibaba PuHuiTi 2.0";
          font-size: 16px;
          font-weight: bold;
          line-height: 21px;
          letter-spacing: 0px;
          color: #3d3d3d;
        }
      }
    }
  }
  .myselfRank {
    width: 100%;
    height: 64px;
    background: #ffffff;
    position: fixed;
    bottom: 0px;
    display: flex;
    align-items: center;
    padding: 0 48px 0 16px;
    justify-content: space-between;
    box-sizing: border-box;
    box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.1);

    .my-rank-content {
      display: flex;
      align-items: center;
      width: 100%;

      .my-rank-number {
        width: 8px;
        height: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 18px;
        font-family: "Alibaba PuHuiTi 2.0";
        font-size: 16px;
        font-weight: bold;
        line-height: 21px;
        color: #3d3d3d;
        .no-rank {
          width: 8px;
          height: 0px;
          border-top: 2px solid #000000;
        }
      }

      .my-avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 18px;
      }

      .my-info {
        flex: 1;

        .my-name {
          font-family: "Source Han Sans";
          font-size: 12px;
          font-weight: bold;
          color: #3d3d3d;
          margin: 0 0 11px 0;
        }

        .my-time {
          font-family: "Source Han Sans";
          font-size: 13px;
          font-weight: bold;
          color: #3d3d3d;
          margin: 0;
        }
      }

      .my-rank-status {
        font-family: "Source Han Sans";
        font-size: 12px;
        font-weight: 500;
        color: #3d3d3d;
      }
    }
  }
}
</style>
