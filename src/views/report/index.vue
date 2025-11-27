<template>
  <div class="index">
    <topNav
      :username="userInfo.username"
      :level="userInfo.level"
      :time="userInfo.time"
      class="top"
    />
    <tabber class="tabber" />
    <div class="firstBox">
      <img src="@/assets/report/bigPeople.png" alt="" class="people" />
      <img src="@/assets/report/bigPeople2.png" alt="" class="people2" />
      <img src="@/assets/report/circle.png" alt="" class="circle" />
      <div class="itemBox">
        <div
          v-for="(item, index) in reportList"
          :key="index"
          class="item"
          :class="'item-' + index"
        >
          <div class="content1">
            <img src="@/assets/report/dida.png" alt="" class="dida" />
            <p class="grade">{{ item.grade }}</p>
            <p class="evaluation">{{ item.evaluation }}</p>
          </div>
          <p class="time">{{ item.timePeriod }}</p>
        </div>
      </div>
    </div>
    <div class="secondBox">
      <div class="titleBox">
        <img src="@/assets/report/reportIcon1.png" alt="" class="icon1" />
        <p class="title">目标内容占比</p>
      </div>
      <swiper class="swiperBox" :data="knowledgeMasteryData" />
    </div>
    <div class="thirdBox">
      <div class="titleBox">
        <img src="@/assets/report/reportIcon2.png" alt="" class="icon1" />
        <p class="title">目标预估</p>
      </div>
      <div class="contentOut">
        <div class="line"></div>
        <div class="contentIn">
          <div class="timeCostBox">
            <div class="line2"></div>
            <span class="title">时间花费比例</span>
            <!-- tu -->
            <div class="tuBox">
              <binEchars :data="timeCostList" />
              <div>
                <div
                  v-for="(item, index) in timeCostList"
                  :key="index"
                  class="timeCost"
                >
                  <p class="name">{{ item.name }}</p>
                  <p class="percent">
                    {{ item.value }}<span class="baifenhao">%</span>
                  </p>
                  <div class="colorBox" :class="'itemColor-' + index"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="targetDifficulty">
            <span class="title">时间花费比例</span>
            <targetDifficulty :data="difficultyData" />
          </div>
        </div>
      </div>
    </div>
    <div class="fourthBox">
      <div class="titleBox">
        <img src="@/assets/report/reportIcon3.png" alt="" class="icon1" />
        <p class="title">个性化建议</p>
      </div>
      <div class="first">
        <div class="text" v-html="formattedSuggestion"></div>
        <div class="boll">
          <div class="dayTimeBox">
            <div class="Numtext">
              <p>
                <span class="classFinishText"
                  >{{ userInfo.targetUnFinish }}/</span
                >
                <span class="classAllText">{{ userInfo.targetAll }}</span>
              </p>
            </div>
            <img
              src="@/assets/studyLook/targetFinish.png"
              alt=""
              class="iconCircle"
            />
          </div>
          <p class="dayTimeText">目标完成</p>
        </div>
      </div>
      <div class="second">
        <img src="@/assets/report/text.png" alt="" class="text" />
        <img src="@/assets/report/book.png" alt="" class="book" />
        <p class="title">今天是你变得更优秀的开始</p>
      </div>
      <div class="third">
        <div class="in"></div>
        <div class="contentIn">
          <div v-for="(item, index) in backlogList" :key="index" class="item">
            <div class="first">
              <div class="left">
                <div class="boll">
                  <img :src="item.img" alt="" />
                </div>

                <div class="firstLeftSmall">
                  <p class="itemText1">{{ item.name }}</p>
                  <!-- <p class="itemText2">{{ item.time }}</p> -->
                </div>
              </div>
              <!-- 预计时间 -->
              <div class="timeBox">
                <img src="@/assets/report/clock.png" alt="" />
                <p class="timeText">预计用时{{ item.time}}小时</p>
              </div>
            </div>
            <div class="remainder">{{ item.remainder }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 悬浮球 -->
  <van-floating-bubble
    axis="xy"
    magnetic="x"
    @offset-change="onOffsetChange"
    @click="goToAiAssistant"
    class="transparent-bubble"
    style="background: transparent;gap:0px;"
  >
    <img src="@/assets/tree/float-ball.png" alt="AI助手" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
  </van-floating-bubble>
</template>

<script setup>
import topNav from "@/components/top/nosearch.vue";
import tabber from "@/components/tabber/index.vue";
import swiper from "../report/components/swiper.vue";
import binEchars from "../report/components/binEchars.vue";
import targetDifficulty from "../report/components/targetDifficulty.vue";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { getLearningAnalysisReport, getAllGoals, getUnfinishedGoals } from "./api/index.js";
import { getStudyStats } from "@/views/rank/api/index.js";

const router = useRouter();
const userStore = useUserStore();

const onOffsetChange = (offset) => {
  // showToast(`x: ${offset.x.toFixed(0)}, y: ${offset.y.toFixed(0)}`);
};

const goToAiAssistant = () => {
  router.push('/aiAssistant');
};

// 目标数据
const targetData = ref({
  totalTargets: 0,
  unfinishedTargets: 0
});

// 学习时长数据
const studyTimeData = ref({
  dailyHours: 0,
  totalHours: 0,
  weeklyHours: 0
});

// 从store获取用户信息，如果没有则使用默认值
const userInfo = computed(() => {
  const storeUserInfo = userStore.userInfo;
  const totalTargets = targetData.value.totalTargets || 0;
  const unfinishedTargets = targetData.value.unfinishedTargets || 0;
  
  return {
    username: storeUserInfo.name || storeUserInfo.username || "用户",
    level: storeUserInfo.level || 1,
    time: studyTimeData.value.dailyHours || storeUserInfo.time || 0, // 通用学习时间
    weeklyTime: studyTimeData.value.weeklyHours || 0, // 使用接口获取的周学习时间
    starNumber: storeUserInfo.starNumber || storeUserInfo.stars || 0,
    targetFinish: Math.max(0, totalTargets - unfinishedTargets),
    targetUnFinish: unfinishedTargets,
    targetAll: totalTargets,
  };
});

// 专注力分析数据
const reportList = ref([]);

// 时间分布数据
const timeCostList = ref([]);
// 推荐学习数据
const backlogList = ref([]);
// AI建议
const suggestion = ref("");

// 知识掌握度数据 - 传递给swiper组件
const knowledgeMasteryData = ref([]);

// 难度分布数据 - 传递给targetDifficulty组件
const difficultyData = ref([]);

// 默认图片映射
const defaultImages = {
  '英语四级': '../src/assets/report/siji.png',
  '线性代数': '../src/assets/report/daishu.png',
  '程序设计': '../src/assets/report/chengxu.png',
  '数据分析': '../src/assets/report/shulie.png',
  '函数': '../src/assets/report/hanshu.png',
  '概率': '../src/assets/report/gailv.png',
  '立体几何': '../src/assets/report/jihe.png',
  '二项式': '../src/assets/report/erxiangshi.png',
  '数列': '../src/assets/report/shulie.png',
  '阅读': '../src/assets/report/shulie.png',
  '研究生入学考试': '../src/assets/report/daishu.png',
  'React': '../src/assets/report/chengxu.png'
};

// 获取目标数据
const fetchTargetData = async () => {
  try {
    // 获取所有目标
    const allGoalsResponse = await getAllGoals();
    const totalTargets = allGoalsResponse.data ? allGoalsResponse.data.length : 0;
    
    // 获取未完成目标
    const unfinishedGoalsResponse = await getUnfinishedGoals();
    const unfinishedTargets = unfinishedGoalsResponse.data ? unfinishedGoalsResponse.data.length : 0;
    
    targetData.value = {
      totalTargets,
      unfinishedTargets
    };
  } catch (error) {
    console.error('获取目标数据失败:', error);
    // 设置默认值防止NaN
    targetData.value = {
      totalTargets: 0,
      unfinishedTargets: 0
    };
  }
};

// 获取学习分析数据
const fetchLearningAnalysis = async () => {
  try {
    const response = await getLearningAnalysisReport();
    const data = response.data || response;
    
    if (data.learningAnalysis) {
      const analysis = data.learningAnalysis;
      
      // 设置专注力分析数据
      if (analysis.focusAnalysis && analysis.focusAnalysis.data) {
        reportList.value = analysis.focusAnalysis.data;
      }
      
      // 设置知识掌握度数据（传递给swiper组件）
      if (analysis.knowledgeMastery && analysis.knowledgeMastery.data) {
        knowledgeMasteryData.value = analysis.knowledgeMastery.data.map(item => ({
          title: item.title,
          percentage: item.percentage,
          img: defaultImages[item.title] || '../src/assets/report/shulie.png'
        }));
      }
      
      // 设置时间分布数据
      if (analysis.timeDistribution && analysis.timeDistribution.data) {
        timeCostList.value = analysis.timeDistribution.data.map(item => ({
          ...item,
          value: Math.round(item.value / 5)
        }));
      }
      
      // 设置难度分布数据（转换格式给targetDifficulty组件）
      if (analysis.difficultyDistribution && analysis.difficultyDistribution.data) {
        difficultyData.value = analysis.difficultyDistribution.data.map(item => [
          item.name,
          item.level
        ]);
      }
      
      // 设置推荐学习数据
      if (analysis.recommendedLearning && analysis.recommendedLearning.data) {
        backlogList.value = analysis.recommendedLearning.data.map(item => ({
          name: item.name,
          time: item.time,
          remainder: item.remainder,
          img: defaultImages[item.name] || '../src/assets/report/siji.png'
        }));
      }
      
      // 设置AI建议
      if (analysis.aiSuggestion) {
        suggestion.value = analysis.aiSuggestion;
      }
    }
  } catch (error) {
    console.error('获取学习分析数据失败:', error);
    // 可以设置一些默认数据或显示错误提示
  }
};

// 获取学习时长数据
const fetchStudyTimeData = async () => {
  try {
    const response = await getStudyStats();
    if (response.data) {
      studyTimeData.value = {
        dailyHours: response.data.dailyHours || 0,
        totalHours: response.data.totalHours || 0,
        weeklyHours: response.data.weeklyHours || response.data.totalHours * 0.7 || 0 // 假设周学习时间为总时间的70%
      };
    }
  } catch (error) {
    console.error('获取学习时长数据失败:', error);
  }
};

// 组件挂载时获取数据
onMounted(async () => {
  await fetchTargetData();
  await fetchLearningAnalysis();
  await fetchStudyTimeData();
});

// 为特殊格式处理数据
const formattedSuggestion = computed(() => {
  // 1. 先转义HTML特殊字符（防XSS）
  let safeText = suggestion.value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 1. 先匹配时间段并使用特殊标记临时替换，避免干扰数字匹配
  const timeRangeRegex = /(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})/g;
  const timeMarker = "___TIME_RANGE___";
  const timeRanges = [];
  let tempText = safeText.replace(timeRangeRegex, (match) => {
    timeRanges.push(match);
    return timeMarker;
  });

  // 2. 在不包含时间段的文本中匹配所有数字
  const numberRegex = /(\d+)(?=%|\D|$)/g;
  tempText = tempText.replace(numberRegex, '<span class="number">$1</span>');

  // 3. 恢复时间段标记
  timeRanges.forEach((time) => {
    tempText = tempText.replace(
      timeMarker,
      `<span class="time-range">${time}</span>`
    );
  });

  return tempText;
});
// // 计算时间段的间隔函数
// const calculate = (timeStr) => {
//   try {
//     // 验证格式并计算
//     const [startTime, endTime] = timeStr.split(" - ");
//     const [startHour, startMinute] = startTime.split(":").map(Number);
//     const [endHour, endMinute] = endTime.split(":").map(Number);

//     const startTotal = startHour * 60 + startMinute;
//     const endTotal = endHour * 60 + endMinute;

//     return endTotal - startTotal;
//   } catch (error) {
//     // 处理格式错误
//     console.error("时间格式错误:", error);
//     return "格式错误";
//   }
// };
</script>

<style lang="less" scoped>
.index {
  width: 100%;
  height: 100%;
  padding-bottom: 84px; /* 导航栏基础高度 */
  margin-bottom: -28px; /* 让内容向上移动 28px，适应凸起部分 */
  position: relative;
  overflow-y: auto;
  object-fit: cover;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  .tabber {
    position: fixed;
    left: 0;
    bottom: 0px;
  }
  .top {
    width: 100%;
    height: 44px;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
  }
  .firstBox {
    width: 100%;
    height: 272px;
    .people,
    .circle,
    .people2 {
      object-fit: cover;
      position: absolute;
    }
    .people {
      width: 116px;
      height: 179px;
      top: 80px;
      left: 128px;
    }
    .people2 {
      width: 116px;
      height: 139px;
      top: 80px;
      left: 128px;
      z-index: 4;
    }
    .circle {
      width: 245px;
      height: 97px;
      top: 152px;
      left: 64px;
      z-index: 3;
    }
    .itemBox {
      display: flex;
      position: absolute;
      align-items: center;
      justify-content: space-between;
      top: 144px;
      left: 71px;

      width: 233px;
      .item {
        width: 32px;
        // height: 50px;
        height:auto ;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .content1 {
          width: 32px;
          height: 39px;

          display: flex;
          justify-content: flex-start;
          align-items: center;
          flex-direction: column;

          font-family: "Source Han Sans";
          font-size: 11px;
          font-weight: bold;
          line-height: normal;
          letter-spacing: normal;
          color: #ffffff;
          position: relative;
          .grade {
            font-weight: 700;
            font-size: 11px;
            z-index: 6;
          }
          .evaluation {
            font-weight: 700;
            font-size: 6px;
            z-index: 6;
          }
          .dida {
            position: absolute;
            top: 0;
            right: 0;
            z-index: 5;
          }
        }
        .time {
          font-family: "Alibaba PuHuiTi 3.0";
          font-size: 8px;
          font-weight: bold;
          line-height: normal;
          letter-spacing: normal;
          color: #ffffff;
          z-index: 5;
          width: 47px;
          text-align: center;
        }
      }
      // 第二个
      .item-1 {
        position: absolute;
        top: 40px;
        left: 22px;
      }
      // 第三个
      .item-2 {
        position: absolute;
        top: 51px;
        left: 98px;
      }
      // 第四个
      .item-3 {
        position: absolute;
        top: 40px;
        right: 33px;
      }
    }
  }
  .secondBox {
    .titleBox {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-left: 17px;
      .icon1 {
        width: 24px;
        height: 24px;
        margin-right: 3.9px;
      }
      .title {
        text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.65);
        font-family: "Source Han Sans";
        font-size: 14px;
        font-weight: 500;
        line-height: normal;
        letter-spacing: 0em;
        color: #696969;
      }
    }
    .swiperBox {
      margin-top: 12px;
    }
  }
  .thirdBox {
    margin-top: 20.3px;
    .titleBox {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-left: 17px;
      .icon1 {
        width: 24px;
        height: 24px;
        margin-right: 3.9px;
      }
      .title {
        text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.65);
        font-family: "Source Han Sans";
        font-size: 14px;
        font-weight: 500;
        line-height: normal;
        letter-spacing: 0em;
        color: #696969;
      }
    }
    .contentOut {
      width: 345px;
      height: 471px;
      border-radius: 4px;
      background: linear-gradient(
        180deg,
        #ffffff 33%,
        rgba(255, 255, 255, 0) 100%
      );
      margin: 0 auto;
      .line {
        height: 4px;
      }
      .contentIn {
        width: 337px;
        height: 467px;
        border-radius: 4px;
        background: linear-gradient(180deg, #b8dfff 0%, #fafdff 100%);

        box-shadow: 0px 2px 2px 0px #c5ddf0;
        margin: 0 auto;
        .timeCostBox,
        .targetDifficulty {
          .line2 {
            height: 20px;
          }
          .title {
            font-family: "Source Han Sans";
            font-size: 14px;
            font-weight: 500;
            line-height: normal;
            letter-spacing: 0em;
            color: #696969;

            text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.65);

            margin: 20px 0 0 23px;
          }
          .tuBox {
            display: flex;
            justify-content: space-around;
            align-items: center;
            align-content: flex-end;
            .timeCost {
              display: flex;
              align-items: center;
              justify-content: flex-end;

              margin-bottom: 12px;
              width: 94px;
              .name {
                font-family: "Alibaba PuHuiTi 3.0";
                font-size: 10px;
                font-weight: normal;
                line-height: normal;
                letter-spacing: 0em;
                color: #696969;
              }
              .percent {
                font-family: "Alibaba PuHuiTi 3.0";
                font-size: 12px;
                font-weight: 500;
                line-height: 12px;
                letter-spacing: 0em;

                background: linear-gradient(90deg, #4dc7ad 0%, #009cff 95%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;

                margin-left: 2px;
                .baifenhao {
                  background: linear-gradient(90deg, #f49696 6%, #009cff 95%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
              }
              .colorBox {
                width: 24px;
                height: 14px;
                margin-left: 4px;
                border-radius: 3px;
              }
              .itemColor-0 {
                background: #ffffff;
              }
              .itemColor-1 {
                background: #91d4ff;
              }
              .itemColor-2 {
                background: #67c4ff;
              }
              .itemColor-3 {
                background: #32b0ff;
              }
              .itemColor-4 {
                background: #009cff;
              }
            }
          }
        }
        .targetDifficulty {
        }
      }
    }
  }
  .fourthBox {
    margin-top: 20px;
    .titleBox {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-left: 17px;
      .icon1 {
        width: 24px;
        height: 24px;
        margin-right: 3.9px;
      }
      .title {
        text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.65);
        font-family: "Source Han Sans";
        font-size: 14px;
        font-weight: 500;
        line-height: normal;
        letter-spacing: 0em;
        color: #696969;
      }
    }
    .first {
      margin: 0 auto;
      width: 320px;
      margin-top: 9px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .text {
        width: 253px;
        height: 77px;
        border-radius: 8px;
        background: linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.2)
          ),
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.87) 0%,
            rgba(255, 255, 255, 0.33) 97%
          );
        border: 1px solid #ffffff;

        font-family: "Alibaba PuHuiTi 3.0";
        font-weight: 400;
        font-size: 13px;
        color: #3d3d3d;

        padding: 8px 4px;
      }
      .boll {
        width: 52px;
        height: 71px;
        display: flex;
        flex-direction: column;
        margin-left: 8px;
        .dayTimeBox {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background-image: linear-gradient(
              148deg,
              rgba(255, 255, 255, 0.71) 13%,
              rgba(177, 220, 255, 0) 91%
            ),
            radial-gradient(
              50% 50% at 50% 50%,
              #eaf6ff 0%,
              #c2e2fc 50%,
              #ccdcea 100%
            );

          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          text-align: center;
          letter-spacing: 0em;

          .Numtext {
            width: 40px;
            height: 35px;
            font-family: "GFS Didot";
            font-weight: 400;
            font-size: 22px;
            .classFinishText {
              color: #0065d7;
            }
            .classAllText {
              color: #ffffff;
            }
          }
        }
        .dayTimeText {
          margin-top: 2px;
          text-align: center;
          font-family: "Source Han Sans";
          font-size: 12px;
          color: #444444;

          text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.65);
        }
      }
    }
    .second {
      width: 322px;
      height: 88px;
      margin: 0 auto;
      margin-top: 10px;

      border-radius: 8px;
      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.55),
          rgba(255, 255, 255, 0.55)
        ),
        linear-gradient(180deg, #a3d6ff 0%, #ffffff 37%, #b7c6d1 100%);
      border: 1px solid #ffffff;
      box-shadow: 2px 3px 3px 0px rgba(157, 192, 220, 0.45);

      position: relative;
      .text {
        width: 240px;
        height: 30px;
        margin: 19px 0px 0px 11px;
        position: relative;
        z-index: 2;
      }
      .book {
        width: 86.71px;
        height: 46px;
        position: absolute;
        top: 20px;
        // bottom: 6.67px;
        right: 3.24px;
        z-index: 1;
        transform: rotate(-10.73deg);
      }
      .title {
        font-family: Roboto;
        font-size: 12px;
        font-weight: normal;
        line-height: 20px;
        letter-spacing: normal;
        color: #41a7f9;
        margin: 0px 0px 11px 21px;
      }
    }
    .third {
      width: 345px;
      // height: 312px;
      // height: 90.434%;
      margin: 13px auto 0 auto;
      position: relative;
      z-index: 5;
      border-radius: 4px;
      background: linear-gradient(
        180deg,
        #279bf8 0%,
        rgba(192, 232, 255, 0) 100%
      );
      .in {
        width: 345px;
        height: 7.13px;
      }
      .contentIn {
        width: 337px;
        // height: 304.77px;
        // height: 97.67%;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0px 2px 2px 0px rgba(172, 197, 211, 0.65);
        margin: 0 auto;

        display: flex;
        flex-direction: column;
        justify-items: center;
        justify-content: space-around;
        align-items: center;
        .item {
          width: 310px;
          // height: 80px;
          height:auto;
          margin-top: 16px;
          border-radius: 12px;
          /* 8888888 */
          background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0) 0%,
              #ffffff 193%
            ),
            linear-gradient(90deg, #edfaec 0%, #e7fffe 37%);
          box-shadow: 0px 2px 4px 0px #b6dfdd;
          .first {
            margin-top: 6px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;

            .left {
              width: 200px;
              height: 40px;
              margin-left: 13px;

              display: flex;
              justify-content: flex-start;
              align-items: center;

              .boll {
                width: 40px;
                height: 40px;

                border-radius: 50%;
                background: #ffffff;
                padding: 5px;

                display: flex;
                justify-content: center;
                align-items: center;

                img {
                  object-fit: cover;
                  width: 23px;
                  height: 23px;
                }
              }

              .firstLeftSmall {
                margin-left: 9px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: flex-start;
                .itemText1 {
                  font-family: "Alibaba PuHuiTi 3.0";
                  font-size: 12px;
                  font-weight: 500;
                  line-height: 24px;
                  letter-spacing: 0px;
                  color: #505050;
                }
                .itemText2 {
                  font-family: " Alibaba PuHuiTi 3.0";
                  font-size: 10px;
                  font-weight: normal;
                  line-height: 16px;
                  letter-spacing: 0px;
                  color: #6b7280;
                }
              }
            }
            .timeBox {
              display: flex;
              justify-content: space-between;
              align-items: center;

              margin-right: 20px;
              img {
                width: 11px;
                height: 11px;
              }
              .timeText {
                font-family: "Alibaba PuHuiTi 3.0";
                font-size: 10px;
                font-weight: 300;
                line-height: 20px;
                color: #6b7280;
                margin-left: 4px;
              }
            }
          }
          .remainder {
            font-family: "Alibaba PuHuiTi 3.0";
            font-size: 13px;
            font-weight: 300;
            line-height: 20px;
            letter-spacing: normal;
            color: #4b5563;

            margin: 6px 0 9px 19px;
          }
        }
        .item:last-child {
          margin-bottom: 13px;
        }
                .item:first-child {
          margin-top: 13px;
        }
      }
    }
  }
}
.iconCircle {
  position: absolute;
  bottom: 0px;
  right: 0px;
}
:deep(.time-range) {
  margin: 0px 3px;
  font-family: "Alibaba PuHuiTi 3.0";
  font-weight: 400;
  font-size: 13px;
  color: #fda464;
}
:deep(.number) {
  margin: 0px 3px;
  font-weight: 500;
  font-size: 13px;
  color: #3d3d3d;
  font-family: "Alibaba PuHuiTi 3.0";
}
</style>