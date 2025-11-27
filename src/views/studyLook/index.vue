<template>
  <div class="index" @scroll="handleScroll" ref="indexRef">
    <topNav :username="userInfo.username" :level="userInfo.level" class="top" />
    <tabber class="tabber" />
    <div
      class="showAttention"
      :class="{ collapsed: isCollapsed }"
      ref="attentionRef"
    >
      <div class="attentionText" :class="{ hidden: isCollapsed }">
        <p class="nomalText">专注市场超过全国</p>
        <p class="sText">{{ percentage }}</p>
        <p class="nomalText">用户</p>
      </div>
      <div class="arrow-icon" :class="{ visible: isCollapsed }">
        <img src="@/assets/studyLook/down.png" alt="" />
      </div>
    </div>
    <div class="circle">
      <div class="manyCircles" :class="{ collapsed: isCircleCollapsed }">
        <img
          src="@/assets/studyLook/left.png"
          alt=""
          class="lefticon"
          :class="{ flipped: isCircleCollapsed }"
          @click="toggleCircleCollapse"
        />

        <div class="dayTime">
          <div class="dayTimeBox">
            <div class="Numtext">
              <span class="integer">{{ integerPart }}</span>
              <span class="decimal">.{{ decimalPart }}</span>
              <span class="h">h</span>
            </div>

            <img src="@/assets/studyLook/day.png" alt="" class="iconCircle" />
          </div>
          <p class="dayTimeText">今日时长</p>
        </div>
        <div class="dayTime" :class="{ hidden: isCircleCollapsed }">
          <div class="dayTimeBox">
            <div class="Numtext">
              <span class="integer">{{ integerPartWeek }}</span>
              <span class="decimal">.{{ decimalPartWeek }}</span>
              <span class="h">h</span>
            </div>
            <img src="@/assets/studyLook/week.png" alt="" class="iconCircle" />
          </div>
          <p class="dayTimeText">总时长</p>
        </div>
        <div class="classFinish" :class="{ hidden: isCircleCollapsed }">
          <van-circle
            :current-rate="rantClassNum"
            :stroke-width="120"
            :speed="100"
            :color="gradientColor"
            class="classCircle"
            start-position="left"
          >
            <img
              src="@/assets/studyLook/classFinish.png"
              alt=""
              class="iconCircle"
            />
            <img src="@/assets/studyLook/dot.png" alt="" class="dot" />

            <p>
              <span class="classFinishText">{{ userInfo.targetAll - userInfo.targetUnFinish }}/</span>
              <span class="classAllText">{{ userInfo.targetAll }}</span>
            </p>
          </van-circle>
          <p class="classText">未完成目标</p>
        </div>
        <div class="classFinish" :class="{ hidden: isCircleCollapsed }">
          <van-circle
            :current-rate="rantTargetNum"
            :stroke-width="120"
            :speed="100"
            :color="gradientColor"
            class="classCircle"
            start-position="left"
          >
            <img src="@/assets/studyLook/dot.png" alt="" class="dot" />
            <img
              src="@/assets/studyLook/targetFinish.png"
              alt=""
              class="iconCircle"
            />

            <p>
              <span class="classFinishText">{{ userInfo.targetUnFinish }}/</span>
              <span class="classAllText">{{ userInfo.targetAll }}</span>
            </p>
          </van-circle>
          <p class="classText">已完成目标</p>
        </div>
      </div>
      <div class="tipBox" :class="{ visible: isCircleCollapsed }">
        <img src="@/assets/studyLook/star.png" alt="" class="star" />
        <img src="@/assets/studyLook/aiTips.png" alt="" class="tipsIcon" />
        <!-- <p class="tipText" :class="{ collapsed: !isCircleCollapsed }">{{ aiTips }}</p> -->
         <p class="tipText">{{ aiTips }}</p>
      </div>
    </div>
    <div class="efficiencyBox">
      <div class="eFirst">
        <img src="@/assets/studyLook/efficientIcon.png" alt="" />
        <p class="eText">效率曲线图</p>
      </div>
      <div class="eSecondOut">
        <div class="eSpace"></div>
        <div class="eSecondIn">
          <div class="choseTime">
            <div class="choseTimeText">
              <div
                v-for="(item, index) in data"
                :key="index"
                :class="
                  chosedDate === item.value ? 'chosedDate' : 'unChosedDate'
                "
                @click="handClick(item.value)"
              >
                <p class="text">{{ item.data }}</p>
              </div>
            </div>
            <!-- <div class="more">
              <img
                src="@/assets/studyLook/moreIcon.png"
                alt=""
                class="moreIcon"
              />
              <span>更多</span>
            </div> -->
          </div>
          <div class="line"></div>
          <div class="bottonbox1">
            <div class="dayBox" v-show="chosedDate === 'day'">
              <div class="tu" ref="dayChartRef"></div>
              <div class="right">
                <div class="first">
                  <p class="nomalTime fistText">黄金时间：</p>
                  <p class="time">
                    <span class="titleText">{{
                      timePeriod(genelize.primetime)
                    }}</span>
                    <span class="specialTime">{{
                      formatTimeRange(genelize.primetime)
                    }}</span>
                    <span class="titleText">点</span>
                  </p>
                </div>
                <div class="second">
                  <p class="nomalTime fistText">低效警戒:</p>
                  <span class="time">
                    <span class="titleText">{{
                      timePeriod(genelize.lowEfficient)
                    }}</span>
                    <span class="specialTime2">{{
                      formatTimeRange(genelize.lowEfficient)
                    }}</span>
                    <span class="titleText">点</span>
                  </span>
                </div>
                <div class="third">
                  <p class="nomalTime fistText">记忆强化:</p>
                  <!-- <span>{{ genelize.night }}</span> -->
                  <p class="titleText">
                    睡前 <span class="specialTime3">1~2</span>小时
                  </p>
                </div>
                <div class="fourth">
                  <img
                    src="@/assets/studyLook/starPerple.png"
                    alt=""
                    class="star"
                  />
                  <p class="nomalTime fourth4">
                    <span class="specialTime4">小结：</span>{{ genelize.sum }}
                  </p>
                </div>
              </div>
            </div>
            <div class="dayBox" v-show="chosedDate === 'week'">
              <div class="tu" ref="weekChartRef"></div>
              <div class="right">
                <div class="weekFirst">
                  <img src="@/assets/studyLook/peak.png" alt="" />
                  <span class="nomalText"
                    >效率峰值：<span class="specialText1">{{
                      maxResult[0]
                    }}</span></span
                  >
                </div>
                <div class="weekSecond">
                  <img src="@/assets/studyLook/lowEbb.png" alt="" />
                  <span class="nomalText"
                    >效率低谷：<span class="specialText2">{{
                      maxResult[1]
                    }}</span></span
                  >
                </div>
                <div class="weekThird">
                  <img
                    src="@/assets/studyLook/starPerple.png"
                    alt=""
                    class="star"
                  />
                  <span class="nomalText2"
                    ><span class="specialTime4">小结：</span
                    >{{ genelizeWeek.sum }}</span
                  >
                </div>
              </div>
            </div>
            <div class="dayBox" v-show="chosedDate === 'month'">
              <div class="tu" ref="monthChartRef"></div>
              <div class="right">
                <div class="weekFirst">
                  <span class="nomalText"
                    >效率峰值：<span class="specialText1">{{
                      monthResult[0]
                    }}</span></span
                  >
                </div>
                <div class="weekSecond">
                  <span class="nomalText"
                    >效率低谷：<span class="specialText2">{{
                      monthResult[1]
                    }}</span></span
                  >
                </div>
                <div class="weekThird">
                  <img
                    src="@/assets/studyLook/starPerple.png"
                    alt=""
                    class="star"
                  />
                  <span class="nomalText2"
                    ><span class="specialTime4">小结：</span
                    >{{ genelizeMonth.sum }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <behaviorAnalysis 
      class="behaviorAnalysis" 
      :person-data="personData" 
      :crowd-data="crowdData" 
    />
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
import topNav from "@/components/top/search.vue";
import tabber from "@/components/tabber/index.vue";
import behaviorAnalysis from "./components/behaviorAnalysis.vue";
import * as echarts from "echarts";
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { getLearningAnalysis, getUnfinishedGoals } from "./api/index.js";
import { getStudyStats } from "@/views/rank/api/index.js";
import { getGoalsByUserId } from "@/views/target/api/index.js";

const router = useRouter();
const userStore = useUserStore();

const goToAiAssistant = () => {
  router.push('/aiAssistant');
};

// 存储从API获取的真实数据
const studyTimeData = ref({
  dailyHours: 0,
  totalHours: 0
});
const targetData = ref({
  totalTargets: 0,
  unfinishedTargets: 0
});

// 从store获取真实用户数据
const userInfo = computed(() => {
  const storeUserInfo = userStore.userInfo || {};
  return {
    username: storeUserInfo.name || storeUserInfo.username || "用户",
    level: storeUserInfo.level || 1,
    time: studyTimeData.value.dailyHours || 0,
    allTime: studyTimeData.value.totalHours || 0,
    starNumber: storeUserInfo.starNumber || storeUserInfo.stars || 0,
    classAll: storeUserInfo.classAll || storeUserInfo.totalClasses || 0,
    classFinish: storeUserInfo.classFinish || storeUserInfo.completedClasses || 0,
    targetAll: targetData.value.totalTargets || 0,
    targetUnFinish: targetData.value.unfinishedTargets || 0,
  };
});

const genelize = ref({
  primetime: "09:00-11:00",
  lowEfficient: "12:00-13:00",
  night: "睡前 1~2 小时",
  sum: "晨间高效;午间休整;晚间巩固",
});
const genelizeWeek = computed(() => ({
  sum: learningAnalysisSummary.value?.week || "高效利用‌周四攻克难题提升成果,周六安排休闲活动,避免学习疲劳",
}));
const genelizeMonth = computed(() => ({
  sum: learningAnalysisSummary.value?.month || "高效利用‌周四攻克难题提升成果,周六安排休闲活动,避免学习疲劳",
}));
const aiTips = ref(
  "1:有明确可衡量的短期目标,可以更快产生完成动机~2:任务难度需与个人能力匹配,更易进入高度专注~3:学习质量与环境高度相关,请客观对待勿盲目焦虑~"
);
// 获取百分比
const percentage = ref(Math.floor(Math.random() * 100) + "%");

// 为了不同的css,处理时间显示
const integerPart = computed(() => {
  const [integer] = userInfo.value.time.toString().split(".");
  return integer;
});

const decimalPart = computed(() => {
  const [, decimal = "00"] = userInfo.value.time.toString().split(".");
  return decimal;
});

// formattedAllTime
const integerPartWeek = computed(() => {
  const [integer] = userInfo.value.allTime.toString().split(".");
  return integer;
});

const decimalPartWeek = computed(() => {
  const [, decimal = "00"] = userInfo.value.allTime.toString().split(".");
  return decimal;
});
// 进度条 - 已完成目标的进度
const rantClassNum = computed(() => {
  if (userInfo.value.targetAll === 0) return 0;
  const completedTargets = userInfo.value.targetAll - userInfo.value.targetUnFinish;
  return Math.round(
    (completedTargets / userInfo.value.targetAll) * 100
  );
});
// rantTargetNum - 未完成目标的进度
const rantTargetNum = computed(() => {
  if (userInfo.value.targetAll === 0) return 0;
  return Math.round(
    (userInfo.value.targetUnFinish / userInfo.value.targetAll) * 100
  );
});
// 渐变色
const gradientColor = {
  "0%": "#7DBEFF",
  "100%": "#fff",
};
// 时间段判断
// 配置时间段
const timeConfig = {
  morning: { start: 8, end: 12 }, // 上午 8:00-12:00
  afternoon: { start: 12, end: 18 }, // 下午 12:00-18:00
  evening: { start: 18, end: 24 }, // 晚上 18:00-24:00
  night: { start: 0, end: 6 }, // 凌晨 0:00-6:00
};

// 获取当前时间段
const timePeriod = (currentTime) => {
  const hours = parseInt(currentTime.split("-")[0].split(":")[0]);

  if (hours >= timeConfig.morning.start && hours < timeConfig.morning.end) {
    return "上午";
  } else if (
    hours >= timeConfig.afternoon.start &&
    hours < timeConfig.afternoon.end
  ) {
    return "下午";
  } else if (
    hours >= timeConfig.evening.start &&
    hours < timeConfig.evening.end
  ) {
    return "晚上";
  } else {
    return "凌晨";
  }
};
// 格式化时间
const formatTimeRange = (timeStr) => {
  const [start, end] = timeStr.split("-");
  const getHour = (time) => parseInt(time.split(":")[0], 10);
  return `${getHour(start)}~${getHour(end)}`;
};
// 查看效率曲线选择的不同频率
const chosedDate = ref("day");

const data = ref([
  { data: "日", value: "day" },
  { data: "周", value: "week" },
  { data: "月", value: "month" },
]);
const handClick = (value) => {
  chosedDate.value = value;
};
// 效率曲线图
const dayChartRef = ref(null);
const weekChartRef = ref(null);
const monthChartRef = ref(null);
let dayChart = null;
let weekChart = null;
let monthChart = null;
const dayData = ref([90, 10, 45, 60, 95, 80, 0, 75, 90, 45, 80, 72]);
const weekData = ref([70, 75, 76, 80, 75, 45, 62]);
const monthData = ref([65, 50, 60, 79, 65, 95, 40, 52, 62, 76, 80, 75]);
const personData = ref([]);
const crowdData = ref([]);
const learningAnalysisSummary = ref("");
const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
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

// 获取目标数据
const fetchTargetData = async () => {
  try {
    // 获取所有目标
    const allGoalsResponse = await getGoalsByUserId();
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
  }
};

// 获取学习分析数据
const fetchLearningAnalysis = async () => {
  try {
    const response = await getLearningAnalysis();
    const data = response.data.learningAnalysis;
    
    // 更新图表数据
    dayData.value = data.dayData;
    weekData.value = data.weekData;
    monthData.value = data.monthData;
    personData.value = data.personData;
    crowdData.value = data.crowdData;
    learningAnalysisSummary.value = data.summary;

    console.log(personData.value);
    
    // 重新初始化图表
    nextTick(() => {
      initChart();
    });
  } catch (error) {
    console.error('获取学习分析数据失败:', error);
  }
};

// 获取所有数据
const fetchAllData = async () => {
  await Promise.all([
    fetchStudyTimeData(),
    fetchTargetData(),
    fetchLearningAnalysis()
  ]);
};

// 找到最小值的下一个
// 找到最小值索引
const minIndex = computed(() => dayData.value.indexOf(Math.min(...dayData.value)));
const afterIndex = computed(() => minIndex.value + 1);
// 找到最大值的下一个
const maxIndex = computed(() => dayData.value.indexOf(Math.max(...dayData.value)));
const privOneIndex = computed(() => maxIndex.value - 1);
const privTwoIndex = computed(() => maxIndex.value - 2);

// 星期数组
// 找到最大值和最小值的索引
const maxWeekIndex = computed(() => {
  return weekData.value.indexOf(Math.max(...weekData.value));
});

const minWeekIndex = computed(() => {
  return weekData.value.indexOf(Math.min(...weekData.value));
});

// 返回结果数组 [最大值星期, 最小值星期]
const maxResult = computed(() => {
  return [weekDays[maxWeekIndex.value], weekDays[minWeekIndex.value]];
});
// 月份
const monthDays = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];
// 找到最大值和最小值的索引
const maxMonthIndex = computed(() => {
  return monthData.value.indexOf(Math.max(...monthData.value));
});

const minMonthIndex = computed(() => {
  return monthData.value.indexOf(Math.min(...monthData.value));
});

// 返回结果数组 [最大值日期, 最小值日期]
const monthResult = computed(() => {
  return [monthDays[maxMonthIndex.value], monthDays[minMonthIndex.value]];
});

const getDayOption = computed(() => ({
  grid: {
    // 新增关键配置
    top: 15,
    right: 0,
    bottom: 10,
    left: 10,
    containLabel: true, // 确保坐标轴标签显示完整
  },
  xAxis: {
    scale: true,
    type: "category",
    boundaryGap: false,
    data: [
      "7:00",
      "8:00",
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
    axisLabel: {
      fontSize: 8,
      fontFamily: "思源黑体",
      color: "#7E7E7E",
    },
  },
  yAxis: {
    scale: true,
    type: "value",
    min: 0,
    max: 100,
    interval: 20,
    splitLine: { show: false }, // 隐藏X轴网格线
    axisLabel: {
      fontSize: 8,
      fontFamily: "思源黑体",
      color: "#7E7E7E",
    },
  },
  series: [
    {
      data: dayData.value,
      type: "line",
      lineStyle: {
        color: "#289CF9",
        width: 2,
      },
      areaStyle: {
        color: "rgba(155, 218, 255, 0.45)",
      },
      symbolSize: 1.65,
      symbol: "circle",
      itemStyle: {
        color: "#FFFFFF",
        borderColor: "#FFFFFF",
        borderWidth: 2,
      },
      markPoint: {
        symbol: "circle",
        symbolSize: 1.65,
        data: [
          {
            type: "min",
            itemStyle: {
              color: "#FFFFFF",
              borderColor: "#BCBCBC",
              borderWidth: 2,
            },
            label: { show: false },
          },

          {
            type: "max",
            itemStyle: {
              color: "#fff",
              borderColor: "#FDE047",
              borderWidth: 2,
            },
            label: { show: false },
          },

          // 最小的下一个
          {
            coord: [afterIndex.value, dayData.value[afterIndex.value]], // [x, y] 坐标
            itemStyle: {
              color: "#FFFFFF",
              borderColor: "#BCBCBC",
              borderWidth: 2,
            },
          },
          // 最大的上一个
          {
            coord: [privOneIndex.value, dayData.value[privOneIndex.value]], // [x, y] 坐标
            itemStyle: {
              color: "#fff",
              borderColor: "#FDE047",
              borderWidth: 2,
            },
          },
          {
            coord: [privTwoIndex.value, dayData.value[privTwoIndex.value]], // [x, y] 坐标
            itemStyle: {
              color: "#fff",
              borderColor: "#FDE047",
              borderWidth: 2,
            },
          },
        ],
      },
    },
  ],
}));
const getWeekOption = computed(() => ({
  grid: {
    // 新增关键配置
    top: 15,
    right: 10,
    bottom: 10,
    left: 10,
    containLabel: true, // 确保坐标轴标签显示完整
  },
  xAxis: {
    scale: true,
    type: "category",
    boundaryGap: false,
    data: weekDays,

    axisLabel: {
      fontSize: 8,
      fontFamily: "思源黑体",
      color: "#6E7079",
    },
  },
  yAxis: {
    scale: true,
    type: "value",
    min: 0,
    max: 100,
    interval: 20,
    axisLabel: {
      fontSize: 8,
      fontFamily: "思源黑体",
      color: "#6E7079",
      formatter: "{value}%", // 添加这行，将数值显示为百分比
    },
  },
  series: [
    {
      data: weekData.value,
      type: "line",
      lineStyle: {
        color: "#289CF9",
        width: 2,
      },
      areaStyle: {
        color: "rgba(155, 218, 255, 0.45)",
      },
      symbolSize: 1.63,
      symbol: "circle",
      itemStyle: {
        color: "#FFFFFF",
        borderColor: "#0985F5",
        borderWidth: 1,
      },
      markPoint: {
        symbol: "circle",
        symbolSize: 1.65,
        data: [
          {
            type: "min",
            itemStyle: {
              color: "#FFFFFF",
              borderColor: "#009E15",
              borderWidth: 2,
            },
            label: { show: false },
          },

          {
            type: "max",
            itemStyle: {
              color: "#fff",
              borderColor: "#F50909",
              borderWidth: 2,
            },
            label: { show: false },
          },
        ],
      },
    },
  ],
}));
const getMonthOption = computed(() => ({
  grid: {
    // 新增关键配置
    top: 15,
    right: 0,
    bottom: 10,
    left: 10,
    containLabel: true, // 确保坐标轴标签显示完整
  },
  xAxis: {
    scale: true,
    type: "category",
    boundaryGap: false,
    data: monthDays,

    axisLabel: {
      fontSize: 7,
      fontFamily: "思源黑体",
      color: "#7E7E7E",
    },
  },
  yAxis: {
    scale: true,
    type: "value",
    min: 0,
    max: 100,
    interval: 20,
    splitLine: { show: false }, // 隐藏X轴网格线
    axisLabel: {
      fontSize: 8,
      fontFamily: "思源黑体",
      color: "#7E7E7E",
    },
  },
  series: [
    {
      data: monthData.value,
      type: "line",
      lineStyle: {
        color: "#289CF9",
        width: 2,
      },
      areaStyle: {
        color: "rgba(155, 218, 255, 0.45)",
      },
      symbolSize: 0,
      symbol: "circle",
      itemStyle: {
        color: "#FFFFFF",
        borderColor: "#0985F5;",
        borderWidth: 1,
      },
      markPoint: {
        symbol: "circle",
        symbolSize: 1.65,
        data: [
          {
            type: "min",
            itemStyle: {
              color: "#FFFFFF",
              borderColor: "#009E15",
              borderWidth: 2,
            },
            label: { show: false },
          },

          {
            type: "max",
            itemStyle: {
              color: "#fff",
              borderColor: "#F50909",
              borderWidth: 2,
            },
            label: { show: false },
          },
        ],
      },
    },
  ],
}));
// 初始化图表
const initChart = () => {
  if (!dayChartRef.value) return;
  if (!weekChartRef.value) return;
  if (!monthChartRef.value) return;
  // 调试输出
  console.log("Initializing chart on element:", dayChartRef.value);

  try {
    if (dayChartRef.value) {
      dayChart = echarts.init(dayChartRef.value);
      dayChart.setOption(getDayOption.value);
    }

    if (weekChartRef.value) {
      weekChart = echarts.init(weekChartRef.value);
      weekChart.setOption(getWeekOption.value);
    }

    if (monthChartRef.value) {
      monthChart = echarts.init(monthChartRef.value);
      monthChart.setOption(getMonthOption.value);
    }
    // window.addEventListener('resize', resizeChart)
    console.log("Chart initialized successfully");
  } catch (error) {
    console.error("Chart initialization failed:", error);
  }
};
// 监听标签切换
watch(chosedDate, (newTab) => {
  nextTick(() => {
    switch (newTab) {
      case "day":
        dayChart?.resize();
        break;
      case "week":
        weekChart?.resize();
        break;
      case "month":
        monthChart?.resize();
        break;
    }
  });
});

// 组件挂载时初始化
// onMounted(() => {
//   initChart()
// })
// 组件卸载前清理
onUnmounted(() => {
  if (dayChart) {
    // window.removeEventListener('resize',resizeChart)
    dayChart.dispose();
    weekChart.dispose();
    monthChart.dispose();
    dayChart = null;
    weekChart = null;
    monthChart = null;
  }
});

const indexRef = ref(null);
const attentionRef = ref(null);
const isCollapsed = ref(false);
const isCircleCollapsed = ref(false);
const scrollThreshold = 50; // 滚动阈值
const lastScrollTop = ref(0);

// 切换圆圈收缩状态
const toggleCircleCollapse = () => {
  isCircleCollapsed.value = !isCircleCollapsed.value;
};

// 处理滚动事件
const handleScroll = (e) => {
  if (!attentionRef.value) return;

  const scrollTop = e.target.scrollTop;
  const attentionRect = attentionRef.value.getBoundingClientRect();
  const attentionBottom = attentionRect.bottom;

  // 向上滚动且元素即将消失
  if (scrollTop > lastScrollTop.value && attentionBottom < scrollThreshold) {
    isCollapsed.value = true;
  }
  // 向下滚动且元素即将出现
  else if (
    scrollTop < lastScrollTop.value &&
    attentionBottom > 0 &&
    attentionBottom < scrollThreshold * 2
  ) {
    isCollapsed.value = false;
  }

  lastScrollTop.value = scrollTop;
};

onMounted(() => {
  initChart();
  fetchAllData();
  if (indexRef.value) {
    indexRef.value.addEventListener("scroll", handleScroll);
  }
});

onUnmounted(() => {
  if (indexRef.value) {
    indexRef.value.removeEventListener("scroll", handleScroll);
  }
});
console.log(userInfo.value);
</script>

<style lang="less" scoped>
.index {
  width: 100%;
  // height:  calc(100% - 77px);
  padding-bottom: 84px; /* 导航栏基础高度 */
  margin-bottom: -28px; /* 让内容向上移动 28px，适应凸起部分 */

  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  overflow-y: auto;
  position: relative;
  // padding-bottom: 49px;
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

  .showAttention {
    margin-top: 44px;
    background: linear-gradient(
      270deg,
      rgba(139, 210, 255, 0.5) 0%,
      rgba(139, 210, 255, 0) 50%,
      #a2d7ff 100%
    );
    border-radius: 0px 0px 30px 30px;
    width: 345px;
    height: 24px;
    margin: 44px auto 0px auto;
    position: relative;
    // overflow: hidden;
    transition: all 0.3s ease-in-out;

    text-shadow: 0px 1px 1px rgba(171, 171, 171, 0.35);
    font-family: "Source Han Sans";
    font-size: 14px;
    font-weight: normal;
    line-height: normal;
    letter-spacing: 0em;

    &.collapsed {
      height: 12px;
      transition: all 0.3s ease-in-out;
    }

    .attentionText {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
      height: 100%;

      &.hidden {
        opacity: 0;
        transform: translateY(-100%);
      }

      .nomalText {
        font-weight: 400;
        font-size: 12px;
        color: #3fb3fb;
      }

      .sText {
        font-weight: 500;
        font-size: 14px;
        background: linear-gradient(
          56deg,
          #896cff 27%,
          #ff6fdb 53%,
          #ffc2ae 70%
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-fill-color: transparent;
        color: transparent;
      }
    }

    .arrow-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      transition: all 0.3s ease-in-out;

      &.visible {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  }
  .circle {
    display: flex;
    justify-content: space-around;
    align-items: center;
    .manyCircles {
      width: 347px;
      height: 86px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.65);
      box-shadow: 0px 2px 2px 0px rgba(206, 206, 206, 0.3);
      margin: 18px auto 0px auto;
      transition: width 0.5s ease-in-out;
      overflow: hidden;

      display: flex;
      justify-content: space-around;
      align-items: center;
      position: relative;

      &.collapsed {
        width: 86px;
      }

      .lefticon {
        position: absolute;
        top: 37px;
        left: 8px;
        transition: all 0.5s ease-in-out;
        cursor: pointer;
        z-index: 10;

        &.flipped {
          transform: scaleX(-1);
          left: calc(100% - 20px);
        }
      }

      .dayTime {
        width: 52px;
        height: 71px;
        display: flex;
        flex-direction: column;
        margin-left: 8px;
        transition: all 0.5s ease-in-out;

        &.hidden {
          opacity: 0;
          transform: translateX(-100px);
        }
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
            position: absolute;
            top: 0px;
            left: 6px;
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
      .classFinish {
        position: relative;
        transition: all 0.5s ease-in-out;

        &.hidden {
          opacity: 0;
          transform: translateX(-100px);
        }
        .classText {
          margin-top: 2px;
          text-align: center;
          font-family: "Source Han Sans";
          font-size: 12px;
          color: #444444;

          text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.65);
        }
        .classCircle {
          width: 52px;
          height: 52px;
          position: relative;
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

          font-family: "GFS Didot";
          font-weight: 400;
          font-size: 22px;

          .classFinishText {
            color: #0065d7;
          }
          .classAllText {
            color: #ffffff;
          }
          .dot {
            position: absolute;
            top: 23px;
            left: -1px;
          }
        }
      }
    }
    .tipBox {
      // position: absolute;
      // right: 15px;
      // top: 74px;
      position: relative;

      margin-top: 18px;
      margin-right: 15px;
      width: 0;
      height: 86px;
      background: rgba(255, 255, 255, 0.9);
      // background: linear-gradient(76deg, #896cff 12%, #ff6fdb 52%, #ffc2ae 79%);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: width 0.5s ease-in-out;
      // overflow: hidden;
      z-index: 5;

      background: linear-gradient(
        255deg,
        rgba(191, 231, 183, 0.08) -10%,
        rgba(252, 255, 223, 0.6333) 11%,
        rgba(255, 193, 171, 0.23) 42%,
        rgba(137, 108, 255, 0.17) 76%,
        rgba(255, 255, 255, 0.13) 102%,
        rgba(81, 174, 250, 0.12) 135%
      );

      box-shadow: 0px 2px 2px 0px rgba(206, 206, 206, 0.3);

      &.visible {
        width: 250px;
      }
      .star {
        position: absolute;
        top: 0;
        right: 0;
      }
      .tipsIcon {
        position: absolute;
        top: 8px;
        left: 11px;
      }

      .tipText {
        font-family: "Source Han Sans";
        font-size: 10px;
        color: #444444;
        font-weight: normal;
        line-height: normal;
        letter-spacing: 0em;
        // white-space: nowrap;
        text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.65);
        opacity: 0;
        transition: opacity 0.3s ease-in-out 0.2s;
        padding: 30px 12px 14px 11px;


      }

      .collapsed{
        display: none;
      }

      &.visible .tipText {
        opacity: 1;
      }
    }
  }
  .efficiencyBox {
    width: 345px;
    height: 203px;
    margin: 18px auto 0px auto;
    .eFirst {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .eText {
        font-family: Source Han Sans;
        font-size: 14px;
        font-weight: 500;
        color: #696969;
        text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.65);
        margin-left: 4px;
      }
    }
    .eSecondOut {
      width: 345px;
      height: 175px;
      border-radius: 4px;
      margin-top: 6px;
      background: linear-gradient(
        180deg,
        #279bf8 0%,
        rgba(192, 232, 255, 0) 100%
      );
      .eSpace {
        width: 337px;
        height: 4px;
      }
      .eSecondIn {
        width: 337px;
        height: 170.94px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.75);

        box-shadow: 0px 2px 2px 0px rgba(172, 197, 211, 0.65);
        margin: 0 auto;
        .choseTime {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .more {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;

            font-family: "Source Han Sans";
            font-size: 10px;
            font-weight: 500;
            line-height: normal;
            letter-spacing: 0em;
            color: #8fcdff;
            .moreIcon {
              margin-right: 6.47px;
            }
          }
          .choseTimeText {
            display: flex;
            align-items: center;
            margin-left: 10px;
          }
          .chosedDate {
            width: 32px;
            height: 12px;
            border-radius: 8px;
            margin-right: 4px;

            background: #ffffff;

            border: 0.6px solid #289cf9;
            font-family: "Source Han Sans";
            font-size: 10px;
            font-weight: 500;
            line-height: normal;
            letter-spacing: 0em;
            color: #289cf9;

            display: flex;
            align-items: center;
            justify-content: center;
          }
          .unChosedDate {
            width: 32px;
            height: 12px;
            border-radius: 8px;
            margin-right: 4px;
            background: rgba(39, 155, 248, 0.75);

            color: #f3faff;
            font-family: Source Han Sans;
            font-size: 10px;
            font-weight: 500;
            line-height: normal;
            letter-spacing: 0em;

            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        .line {
          width: 317px;
          height: 1px;
          border-radius: 8px;
          background: #279bf8;
          margin: 4px auto 0px auto;
        }
        .dayBox {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          width: 100%;
          height: 142px;
          .tu {
            width: 232px;
            // height: 65.02%;
            height: 142px;
            // margin-left: 10px;
          }
          .right {
            display: flex;
            flex-direction: column;
            justify-items: flex-start;
            margin-right: 10px;
            height: 100%;
            .first {
              margin-top: 3px;
              width: 72px;
              height: 23px;
              border-radius: 8px;
              background: linear-gradient(0deg, #fff7cd 0%, #ffffff 100%);

              box-shadow: inset 0px 1px 1px 0px rgba(203, 191, 125, 0.5);
              font-family: "Source Han Sans";

              display: flex;
              flex-direction: column;
              justify-items: center;
              align-items: center;
              .fistText {
                margin: 0 auto;
                width: 52px;
              }
              .time {
                height: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .specialTime {
                margin-bottom: 2px;
                font-weight: 700;
                font-size: 10px;
                background: linear-gradient(180deg, #ffd706 0%, #dccc79 100%);
                -webkit-background-clip: text; /* 兼容 WebKit 浏览器 */
                background-clip: text;
                color: transparent; /* 隐藏原始文本颜色 */
              }
            }
            .second {
              margin-top: 6px;
              width: 72px;
              height: 22.78px;
              border-radius: 8px;
              background: linear-gradient(0deg, #dcdcdc 0%, #ffffff 100%);

              box-shadow: inset 0px 1px 1px 0px rgba(196, 196, 196, 0.5);

              display: flex;
              flex-direction: column;
              justify-items: center;
              align-items: center;
              .time {
                height: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .fistText {
                margin: 0 auto;
                width: 52px;
              }
              .specialTime2 {
                font-family: "Source Han Sans";
                font-weight: 700;
                font-size: 10px;
                color: #4b4c4c;

                text-shadow: 0px 1px 1px #ffffff;
              }
            }
            .third {
              margin-top: 6px;
              width: 72px;
              height: 22.78px;
              border-radius: 8px;
              background: linear-gradient(0deg, #ece6ff 0%, #ffffff 100%);

              box-shadow: inset 0px 1px 1px 0px rgba(127, 125, 203, 0.5);
              text-shadow: 0px 1px 1px #ffffff;

              display: flex;
              flex-direction: column;
              justify-items: center;
              align-items: center;
              .fistText {
                height: 10px;
                margin: 0 auto;
                width: 52px;
              }
              .specialTime3 {
                font-family: "Source Han Sans";
                font-weight: 700;
                font-size: 10px;
                background: linear-gradient(180deg, #aa92f9 0%, #866ed3 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                text-fill-color: transparent;
                color: transparent;
              }
            }
            .weekFirst,
            .weekSecond {
              width: 72px;
              height: 23px;
              border-radius: 8px;
              background: #ffffff;

              box-shadow: inset 0px 1px 1px 0px #dddddd;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              .nomalText {
                font-family: Source Han Sans;
                font-size: 8px;
                font-weight: 400;
                line-height: 10px;
                text-shadow: 0px 1px 1px #ffffff;
                color: #4b4c4c;
                .specialText1 {
                  font-weight: 500;
                  font-size: 10px;
                  background: linear-gradient(180deg, #0985f5 0%, #f50909 100%);
                  -webkit-background-clip: text;
                  background-clip: text;
                  -webkit-text-fill-color: transparent;
                  text-fill-color: transparent;
                  color: transparent;
                }
                .specialText2 {
                  font-weight: 500;
                  font-size: 10px;
                  background: linear-gradient(180deg, #0985f5 0%, #009e15 100%);
                  -webkit-background-clip: text;
                  background-clip: text;
                  -webkit-text-fill-color: transparent;
                  text-fill-color: transparent;
                  color: transparent;
                }
              }
            }
            .weekSecond {
              margin-top: 7px;
            }
            .weekThird {
              margin-top: 7px;
              width: 72px;
              height: 61px;
              border-radius: 8px;
              background: #ffffff;

              box-shadow: inset 0px 1px 1px 0px #d8d8d8;
              position: relative;
              .star {
                position: absolute;
                left: 0;
                top: 0;
              }
              .nomalText2 {
                color: #4b4c4c;
                text-shadow: 0px 1px 1px #ffffff;
                font-family: " Source Han Sans";
                font-size: 8px;
                font-weight: normal;
                display: inline-block;
                width: 62px;
                height: 50px;

                margin-left: 5px;

                .specialTime4 {
                  background: linear-gradient(
                    53deg,
                    #896cff 15%,
                    #ff6fdb 51%,
                    #ffc2ae 75%
                  );
                  -webkit-background-clip: text;
                  background-clip: text;
                  -webkit-text-fill-color: transparent;
                  text-fill-color: transparent;
                  color: transparent;
                }
              }
            }
          }
          .fourth {
            margin-top: 6px;
            width: 72px;
            height: 36px;
            border-radius: 8px;
            background: #ffffff;

            box-shadow: inset 0px 1px 1px 0px #d8d8d8;

            position: relative;
            text-shadow: 0px 1px 1px #ffffff;
            .star {
              position: absolute;
              left: 0;
              top: 0;
            }
            .fourth4 {
              margin: 8px 2px;
            }
            .specialTime4 {
              font-family: "Source Han Sans";
              font-weight: normal;
              font-size: 8px;
              line-height: 10px;
              letter-spacing: 0em;
              background: linear-gradient(
                53deg,
                #896cff 15%,
                #ff6fdb 51%,
                #ffc2ae 75%
              );
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              text-fill-color: transparent;
              color: transparent;
            }
          }
        }
      }
    }
  }
}
.integer {
  font-family: GFS Didot;
  font-weight: 400;
  font-size: 28px;
  color: #0065d7;
}
.decimal {
  font-family: GFS Didot;
  font-weight: 400;
  font-size: 10px;
  color: #0065d7;
}
.h {
  font-family: "GFS Didot";
  color: #ffffff;
  font-weight: 400;
  font-size: 10px;
  margin-left: 2px;
}
.iconCircle {
  position: absolute;
  bottom: 0px;
  right: 0px;
}
.nomalTime {
  font-family: "Source Han Sans";
  font-weight: 400;
  font-size: 8px;
  color: #4b4c4c;

  text-shadow: 0px 1px 1px #ffffff;
}
.titleText {
  font-family: "Source Han Sans";
  font-weight: 500;
  font-size: 8px;
  color: #4b4c4c;
}
</style>
