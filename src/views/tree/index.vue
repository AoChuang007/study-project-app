<template>
  <div class="index">
    <topNav2
      :username="userInfo.username"
      :level="userInfo.level"
      :time="userInfo.time"
      :starNumber="userInfo.starNumber"
      class="top"
    />
    <div class="topLeft">
      <img src="@/assets/tree/bg1.png" alt="" class="bg1" />
      <div class="word">
        <p class="p1">第{{ pass }}关</p>
        <p class="p2">已完成{{ hasFinish }} / {{ allWork }}题</p>
        <van-progress
          :percentage="percentageNum"
          :show-pivot="false"
          stroke-width="8px"
          class="progress"
          color="linear-gradient(270deg, #0985F5 0%, rgba(9, 133, 245, 0) 100%)"
          track-color="#fff"
        />
      </div>
    </div>
    <div class="main">
      <img src="@/assets/tree/tree.png" alt="" class="tree" />
      <div class="button" @click="startChallenge" :class="{ disabled: isLoading }">
        <img src="@/assets/tree/start.png" alt="" />
        <p v-if="!isLoading">开始闯关</p>
        <p v-else>加载中...</p>
        <van-loading v-if="isLoading" size="16px" color="#fff" style="margin-left: 8px;" />
      </div>
      <div class="treeList">
        <div class="treeItem" v-for="level in levelsList" :key="level.id">
          <div class="treeItemBox">
            <img src="@/assets/tree/item.png" alt="" v-if="!level.isActive" />
            <img src="@/assets/tree/itemPass.png" alt="" v-if="level.isActive" />
            <div :class="level.isActive ? 'passText' : 'text'">第{{ level.levelNumber }}关</div>
          </div>
          <div class="starGroup">
            <img
              v-for="i in 3"
              :key="i"
              :src="getStarImage(level, i)"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
    <div class="topRight">
      <div class="circleBox" v-for="(item, index) in toolList" :key="index" @click="handleToolClick(item, index)">
        <div class="circle">
          <img :src="item.icon" alt="" />
        </div>
        <p class="text">{{ item.name }}</p>
      </div>
    </div>
    <tabber class="font" />
  </div>
  <!-- 悬浮球 -->
  <van-floating-bubble
    axis="xy"
    magnetic="x"
    @click="goToAiAssistant"
    class="transparent-bubble"
    style="background: transparent;gap:0px;"
  >
    <img src="@/assets/tree/float-ball.png" alt="AI助手" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
  </van-floating-bubble>
</template>

<script setup>
import starImg from "@/assets/tree/star.png";
import starPassImg from "@/assets/tree/starPass.png";
import tabber from "@/components/tabber/index.vue";
import topNav2 from "@/components/top/moreDetail.vue";
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { getUserLevels } from "./api/index.js";
import { getGoalsByUserId } from "@/views/target/api/index.js";
import { getStudyStats } from "@/views/rank/api/index.js";
import { showToast } from "vant";

const router = useRouter();
const userStore = useUserStore();

// 关卡数据
const levelsList = ref([]);
const allWork = ref(9);
const hasFinish = ref(2);

// 学习时长数据
const studyTimeData = ref({
  dailyHours: 0,
  totalHours: 0
});

// 计算总星星数量
const totalStars = computed(() => {
  return levelsList.value.reduce((total, level) => {
    return total + (level.starsEarned  || 0);
  }, 0);
});

// 加载状态
const isLoading = ref(false);

const goToAiAssistant = () => {
  router.push('/aiAssistant');
};

// 从store获取真实用户数据
const userInfo = computed(() => {
  const storeUserInfo = userStore.userInfo || {};
  return {
    name: storeUserInfo.name || storeUserInfo.username || "用户",
    level: storeUserInfo.level || 1,
    time: studyTimeData.value.dailyHours || 0, // 使用接口获取的今日学习时间
    starNumber: totalStars.value, // 使用计算出的总星星数量
    points: storeUserInfo.points || storeUserInfo.score || 0,
    linktime: storeUserInfo.linktime || storeUserInfo.consecutiveDays || 1,
  };
});

const toolList = [
  {
    id: 1,
    name: "分享",
    icon: "/src/assets/tree/share.png",
  },
  {
    id: 2,
    name: "排行榜",
    icon: "/src/assets/tree/rank.png",
  },
  {
    id: 3,
    name: "商城",
    icon: "/src/assets/tree/icon.png",
  },
    {
    id: 4,
    name: "历史记录",
    icon: "/src/assets/tree/icon3.png",
  },
];

// 当前关卡号（待闯关的关卡）
const pass = computed(() => {
  const activeLevels = levelsList.value.filter(level => level.isActive === 1);
  if (activeLevels.length > 0) {
    // 如果所有关卡都完成了（8关全部isActive=1），显示最后一关
    if (activeLevels.length === allWork.value) {
      return activeLevels[activeLevels.length - 1].levelNumber;
    }
    // 否则返回最后一个isActive=1关卡的关卡号（待闯关）
    return activeLevels[activeLevels.length - 1].levelNumber;
  }
  return 1; // 默认第1关
});

// 获取星星图片
const  getStarImage = (level, starIndex) => {
  // 检查是否是最后一个isActive=1的关卡（待闯关关卡）
  const activeLevels = levelsList.value.filter(l => l.isActive === 1);
  const isLastActiveLevel = activeLevels.length > 0 && level.id === activeLevels[activeLevels.length - 1].id;
  
  // 如果所有关卡都完成了（8关全部isActive=1），所有关卡都显示星星
  const allCompleted = activeLevels.length === allWork.value;
  
  if (level.isActive && (!isLastActiveLevel || allCompleted)) {
    // 已完成的关卡或全部完成时，根据starsEarned显示对应数量的亮星
    return starIndex <= level.starsEarned ? starPassImg : starImg;
  } else {
    // 未通关或待闯关（非全部完成），全部显示暗星
    return starImg;
  }
};

// 进度条
const percentageNum = computed(() => {
  return Math.round((hasFinish.value / allWork.value) * 100);
});

// 处理工具项点击事件
const handleToolClick = (item, index) => {
  console.log(item, index)
  if (index === 1) { // 第二个项目（排行榜）
    router.push('/tree/rank');
  }
  if (index === 2) { // 第三个项目（商城）
    router.push({
      path: '/tree/shopping',
      query: {
        username: userInfo.value.name,
        level: userInfo.value.level,
        time: userInfo.value.time,
        starNumber: userInfo.value.starNumber,
        points: userInfo.value.points,
        linktime: userInfo.value.linktime
      }
    });
  }
  if (index === 3) { // 第四个项目（历史记录）
    router.push('/tree/history');
  }
  // 可以在这里添加其他工具项的处理逻辑
};

// 开始闯关点击事件
const startChallenge = async () => {
  try {
    // 设置加载状态
    isLoading.value = true;
    
    // 调用getUserLevels接口获取关卡数据
    const response = await getUserLevels();
    const levels = response.data || response;
    
    // 找到最后一个isActive为1的关卡ID
    const completedLevels = levels.filter(level => level.isActive === 1);
    
    // 检查是否所有关卡都已完成
    if (completedLevels.length === levels.length) {
      // 所有关卡都已完成，显示轻提示
      showToast('恭喜！您已经完成了所有关卡！');
      return;
    }
    
    const nextLevel = completedLevels.length > 0 ? completedLevels[completedLevels.length - 1] : null;
    
    if (nextLevel) {
      // 调用getGoalsByUserId接口获取目标数据
      const goalsResponse = await getGoalsByUserId();
      const goals = goalsResponse.data || goalsResponse;
      
      // 提取所有目标的id到goalIds数组中
      const goalIds = goals.map(goal => goal.id);
      
      // 跳转到passLevels页面并传递关卡ID和目标IDs
      router.push({
        path: '/tree/passLevels',
        query: {
          levelId: nextLevel.id,
          goalIds: JSON.stringify(goalIds)
        }
      });
    } else {
      // 如果没有找到未激活的关卡，可以提示用户已完成所有关卡
      console.log('所有关卡已完成');
    }
  } catch (error) {
    console.error('获取关卡数据失败:', error);
  } finally {
    // 无论成功还是失败都要关闭加载状态
    isLoading.value = false;
  }
};

// 获取关卡数据
const fetchLevelsData = async () => {
  try {
    const response = await getUserLevels();
    const levels = response.data || response;
    levelsList.value = levels;
    
    // 更新已完成关卡数
    const completedLevels = levels.filter(level => level.isActive === 1);
    // 如果所有关卡都完成了，显示全部关卡数
    if (completedLevels.length === levels.length) {
      hasFinish.value = completedLevels.length;
    } else {
      // 否则排除待闯关的关卡
      hasFinish.value = completedLevels.length > 0 ? completedLevels.length - 1 : 0;
    }
    allWork.value = levels.length;
  } catch (error) {
    console.error('获取关卡数据失败:', error);
  }
};

// 获取学习时长数据
const fetchStudyTimeData = async () => {
  try {
    const response = await getStudyStats();
    if (response.data) {
      studyTimeData.value = {
        dailyHours: response.data.dailyHours || 0,
        totalHours: response.data.totalHours || 0
      };
    }
  } catch (error) {
    console.error('获取学习时长数据失败:', error);
  }
};

// 页面加载时获取关卡数据
onMounted(() => {
  fetchLevelsData();
  fetchStudyTimeData();
});
</script>

<style lang="less" scoped>
.index {
  // overflow: hidden;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    160deg,
    #abcfff 2%,
    #ccf4fe 27%,
    #fafeff 66%,
    #b2c4d6 83%
  );
  // position:relative;
  // display: flex;
  // justify-content: space-between;
  .top {
    position: flex;
    top: 0px;
  }
  .topLeft {
    position: relative;
    width: 120px;
    height: 124.01px;
    margin-left: 2px;
    margin-top: -11px;
    z-index: 8;
    .bg1 {
      width: 111.09px;
      height: 116.1px;
    }
    .word {
      position: absolute;
      top: 54px;
      left: 13.5px;
      margin: auto;
      width: 84px;
      height: 51px;
      text-align: center;
      display: flex;
      align-items: center;
      // justify-content: space-between;
      flex-direction: column;

      .progress {
        width: 84px;
        margin-top: 6px;
      }
      .p1 {
        font-family: "Alibaba PuHuiTi 3.0";
        font-size: 14px;
        font-weight: 800;
        line-height: 20px;
        color: #ffffff;
      }
      .p2 {
        font-family: "Alibaba PuHuiTi 2.0";
        font-size: 12px;
        font-weight: 800;
        line-height: 16px;
        letter-spacing: 0px;
        color: #f4f4f4;
        width: 74px;
      }
    }
  }
  .main {
    position: absolute;
    // 补20
    bottom: 51px;
    width: 100%;
    height: 600px;
    z-index: 5;
    .tree {
      margin-left: 39px;
    }
    .button {
      position: absolute;
      left: 126px;
      bottom: 39px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 128px;
      height: 42px;
      border-radius: 21px;
      background: #ffffff;
      border: 1px solid #0985f5;
      box-shadow: 2px 2px 4px 0px rgba(9, 133, 245, 0.25);
      color: #0985f5;
      font-family: Roboto;
      font-size: 16px;
      font-weight: 500;
      line-height: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      img {
        margin-right: 5.5px;
      }
      &.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }
      &:hover:not(.disabled) {
        transform: translateY(-2px);
        box-shadow: 2px 4px 8px 0px rgba(9, 133, 245, 0.35);
      }
    }
    .treeList {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-column-gap: 5px;
      grid-row-gap: 12.7px;
      width: 283px;
      // 关键修改：翻转容器并反向排列
      transform: rotateX(180deg);
      align-content: end;
      grid-auto-flow: row;
      position: absolute;
      left: 42px;
      bottom: 129.7px;
      align-items: start;
      .treeItem {
        // 为网格项添加对应的翻转样式以保持内容正常显示
        width: 47.44px;
        height: 68.3px;
        transform: rotateX(180deg);
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-items: center;
        .treeItemBox {
          font-family: "Alibaba PuHuiTi 2.0";
          font-size: 12px;
          font-weight: bold;
          line-height: 20px;
          letter-spacing: 0px;
          position: relative;
          margin-bottom: 2.3px;
          .passText {
            color: #ffffff;
            text-shadow: 1px 1px 1px #7bbbf4;
            position: absolute;
            top: 7px;
            left: 4px;
          }
          .text {
            color: #369cf7;
            text-shadow: 1px 1px 1px rgba(149, 149, 149, 0.25);
            position: absolute;
            top: 7px;
            left: 4px;
          }
        }
        .starGroup {
          width: 47.44px;
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
        }
      }
    }
    /* 调整第 3 行与第 2 行的间距 */
    // .treeItem:nth-child(n + 7):nth-child(-n + 9) {
    //   margin-top: 34.7px; /* 第 3 行顶部额外增加 30px 间距 */
    // }
    .treeItem:nth-child(3n + 2) {
      margin-top: 23px;
    }

    //第三列的所有元素（索引为3的列）
    .treeItem:nth-child(3n + 3) {
      margin-top: 79px;
      margin-left: 23px;
    }
    .treeItem:nth-child(4) {
      margin-right: 5.5px;
    }
    .treeItem:nth-child(5) {
      margin-left: 27px;
    }
    .treeItem:nth-child(6) {
      //4.4+23
      margin-left: 27.4px;
    }
    .treeItem:nth-child(7) {
      margin-left: 38.56px;
      margin-top: 22px;
    }
    .treeItem:nth-child(8) {
      margin-left: 37px;
      margin-top: 22px;
    }
    .treeItem:nth-child(9) {
      // 23+1.11
      margin-left: 24.11px;
      margin-top: 81px;
    }
  }
  .topRight {
    width: 32px;
    height: 554px;
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-content: flex-start;
    position: absolute;
    right: 17px;
    top: 63px;
    .circleBox {
      width: 40px;
      height: 45px;
      margin-bottom: 16px;
      cursor: pointer;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      .circle {
        background: rgba(255, 255, 255, 0.75);

        box-shadow: 2px 2px 2px 0px rgba(9, 133, 245, 0.2);
        background: rgba(255, 255, 255, 0.75);

        box-shadow: 2px 2px 2px 0px rgba(9, 133, 245, 0.2);
        width: 32px;
        height: 32px;
        border-radius: 24px;
        display: flex;
        img {
          margin: auto;
        }
      }
      .text {
      width: auto;
        font-family: Alibaba PuHuiTi 2;
        font-size: 10px;
        color: #535353;
        text-align: center;
      }
    }
  }
  .font {
    position: fixed;
    bottom: 0;
  }
}
</style>
