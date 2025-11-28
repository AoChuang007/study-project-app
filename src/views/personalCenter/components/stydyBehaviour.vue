<template>
  <div class="study-behaviour">
    <topNav title="学习行为日历"></topNav>

    <!-- 学习打卡信息卡片 -->
    <div class="study-card">
      <img src="@/assets/personal/behaviour/icon2.png" alt="" class="icon2" />
      <div class="study-info">
        <div class="study-icon">
          <img src="@/assets/personal/behaviour/icon1.png" alt="学习打卡" />
          <div class="study-title">学习打卡</div>
        </div>
        <div class="study-data">
          <div class="study-stats">
            <div class="study-hours">
              <div class="first">
                <span class="number">{{ studyHours }}</span>
                <span class="unit">小时</span>
              </div>
              <span class="desc">今日已学</span>
            </div>
            <div class="study-days">
              <div class="first">
                <span class="number">{{ continuousDays }}</span>
                <span class="unit">天</span>
              </div>
              <span class="desc">连续打卡</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 打卡提示 -->
    <div class="punch-tip">
      <!-- src\assets\personal\behaviour\people.png -->
      <img
        src="@/assets/personal/behaviour/people.png"
        alt="吉祥物"
        class="people"
      />
      <div class="tip-text">"快来打卡领积分"</div>
    </div>

    <!-- 日历组件 -->
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="month-selector">
          <span class="current-month"
            >{{ currentYear }}年{{ currentMonth }}月</span
          >
          <div class="month-arrows">
            <img
              src="@/assets/personal/behaviour/left.png"
              alt="arrow-left"
              @click="prevMonth"
            />
            <img
              src="@/assets/personal/behaviour/right.png"
              alt="arrow-right"
              @click="nextMonth"
            />
          </div>
        </div>
        <div class="sign-toggle">
          <span>签到提醒</span>
          <van-switch
            v-model="signReminder"
            size="small"
            active-color="#097DF4"
          />
        </div>
      </div>

      <!-- 星期表头 -->
      <div class="week-header">
        <div class="week-day" v-for="day in weekDays" :key="day">{{ day }}</div>
      </div>

      <!-- 日期网格 -->
      <div class="days-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            empty: day === null,
            active: day !== null && isActiveDay(day),
            today: day !== null && isToday(day),
            selected: day !== null && selectedDay === day,
            inactive: day !== null && isPastDay(day),
          }"
          @click="day !== null && selectDay(day)"
        >
          {{ day }}
          <!-- src\assets\personal\behaviour\bingou.png -->
          <img
            src="@/assets/personal/behaviour/bingou.png"
            alt=""
            v-if="isActiveDay(day)"
          />
        </div>
      </div>
    </div>

    <!-- 打卡按钮 -->
    <div class="punch-button-container">
      <button class="punch-button" @click="punchIn" :disabled="loading">
        {{ loading ? "打卡中..." : "打卡" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import topNav from "@/components/top/nomal.vue";
import { closeToast, showLoadingToast, showToast } from "vant";
import { computed, onMounted, ref } from "vue";
// 导入API接口
import {
  checkIn,
  getContinuousDays,
  getOneYearCheckIn,
  getTodayCheckInStatus,
} from "../api/studyBehavior.js";

// 学习数据
const studyHours = ref(0);
const continuousDays = ref(0);
const loading = ref(false);

// 日历数据
const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);
const selectedDay = ref(currentDate.value.getDate());
const signReminder = ref(false);

// 星期表头
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

// 当月天数
const daysInMonth = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  return new Date(year, month, 0).getDate();
});

// 计算当月1号是星期几（0-6，0表示星期日）
const firstDayOfMonth = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  return new Date(year, month - 1, 1).getDay();
});

// 生成日历网格数据，包括前面的空白占位符
const calendarDays = computed(() => {
  const days = [];

  // 添加空白占位符
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null);
  }

  // 添加当月的天数
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push(i);
  }

  return days;
});

// 已打卡的日期，格式为 {month: 月份, days: [日期数组]}
const activeDays = ref([]);

// 检查是否是今天
const isToday = (day) => {
  const today = new Date();
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() + 1 &&
    currentYear.value === today.getFullYear()
  );
};

// 检查是否已打卡
const isActiveDay = (day) => {
  // 查找当前月份的打卡记录
  const currentMonthRecord = activeDays.value.find(
    (record) => record.month === currentMonth.value
  );
  // 如果找到当前月份的记录，检查日期是否在打卡列表中
  return currentMonthRecord ? currentMonthRecord.days.includes(day) : false;
};

// 检查今日打卡状态
const checkTodayStatus = async () => {
  try {
    const response = await getTodayCheckInStatus();
    if (response && response.code === 200) {
      // 根据返回的数据判断今日是否已打卡
      // 如果data是"今日已签到"，说明已打卡
      const isCheckedIn = response.data === "今日已签到";
      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();

      if (isCheckedIn) {
        // 更新今日打卡状态到activeDays中
        let currentMonthRecord = activeDays.value.find(
          (record) => record.month === todayMonth
        );
        if (!currentMonthRecord) {
          currentMonthRecord = { month: todayMonth, days: [] };
          activeDays.value.push(currentMonthRecord);
        }
        if (!currentMonthRecord.days.includes(todayDay)) {
          currentMonthRecord.days.push(todayDay);
        }
      }
    }
  } catch (error) {
    console.error("检查今日打卡状态失败:", error);
  }
};

// 检查是否是过去的日期（小于当前日期且未打卡）
const isPastDay = (day) => {
  const currentDate = new Date();
  const selectedDate = new Date(currentYear.value, currentMonth.value - 1, day);

  // 日期小于今天且未打卡
  return selectedDate < currentDate && !isActiveDay(day);
};

// 选择日期
const selectDay = (day) => {
  selectedDay.value = day;
};

// 上个月
const prevMonth = async () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
  selectedDay.value = 1;

  // 获取新年份的打卡数据
  await fetchOneYearCheckIn(newDate.getFullYear());
};

// 下个月
const nextMonth = async () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
  selectedDay.value = 1;

  // 获取新年份的打卡数据
  await fetchOneYearCheckIn(newDate.getFullYear());
};

// 获取连续打卡天数
const fetchContinuousDays = async (retryCount = 0) => {
  try {
    const response = await getContinuousDays();
    if (response && response.code === 200) {
      continuousDays.value = response.data || 0;
    } else {
      throw new Error(response?.message || "获取连续打卡天数失败");
    }
  } catch (error) {
    console.error("获取连续打卡天数失败:", error);
    if (retryCount < 2) {
      // 最多重试2次
      setTimeout(() => fetchContinuousDays(retryCount + 1), 1000);
    } else {
      showToast("获取连续打卡天数失败，请检查网络连接");
    }
  }
};

// 获取一年的打卡数据
const fetchOneYearCheckIn = async (year, retryCount = 0) => {
  try {
    const response = await getOneYearCheckIn(year);
    if (response && response.code === 200 && response.data) {
      // 更新打卡数据，数据格式：[{month: 11, days: [13]}, {month: 6, days: [11]}]
      activeDays.value = response.data;
      console.log("更新打卡数据:", response.data);
    } else {
      throw new Error(response?.message || "获取打卡数据失败");
    }
  } catch (error) {
    console.error("获取打卡数据失败:", error);
    if (retryCount < 2) {
      // 最多重试2次
      setTimeout(() => fetchOneYearCheckIn(year, retryCount + 1), 1000);
    } else {
      showToast("获取打卡数据失败，请检查网络连接");
    }
  }
};

// 打卡功能（暂时简化，只显示提示）
const punchIn = async () => {
  // 检查是否已打卡
  if (isActiveDay(selectedDay.value)) {
    showToast("今天已经打卡了");
    return;
  }

  // 检查是否是过去的日期（小于今天的日期不能打卡）
  const today = new Date();
  if (
    currentMonth.value === today.getMonth() + 1 &&
    currentYear.value === today.getFullYear() &&
    selectedDay.value < today.getDate()
  ) {
    showToast("不能对过去的日期进行打卡");
    return;
  }

  if (
    currentMonth.value === today.getMonth() + 1 &&
    currentYear.value === today.getFullYear() &&
    selectedDay.value > today.getDate()
  ) {
    showToast("不能对未来的日期进行打卡");
    return;
  }

  try {
    loading.value = true;
    showLoadingToast({
      message: "打卡中...",
      forbidClick: true,
    });

    // 调用签到接口
    const response = await checkIn();

    if (response && response.code === 200) {
      // 查找当前月份的打卡记录
      let currentMonthRecord = activeDays.value.find(
        (record) => record.month === currentMonth.value
      );

      // 如果没有当前月份的记录，创建一个新的记录
      if (!currentMonthRecord) {
        currentMonthRecord = { month: currentMonth.value, days: [] };
        activeDays.value.push(currentMonthRecord);
      }

      // 添加打卡记录
      if (!currentMonthRecord.days.includes(selectedDay.value)) {
        currentMonthRecord.days.push(selectedDay.value);
      }

      closeToast();
      showToast(response.data || "签到成功！");

      // 重新获取连续打卡天数和今日打卡状态
      await Promise.all([fetchContinuousDays(), checkTodayStatus()]);
    } else {
      closeToast();
      showToast(response?.message || "签到失败，请重试");
    }
  } catch (error) {
    console.error("签到失败:", error);
    closeToast();
    showToast("签到失败，请检查网络连接");
  } finally {
    loading.value = false;
  }
};

// 初始化数据
const initData = async () => {
  try {
    loading.value = true;

    // 并行获取连续打卡天数、一年的打卡数据和今日打卡状态
    await Promise.all([
      fetchContinuousDays(),
      fetchOneYearCheckIn(currentYear.value),
      checkTodayStatus(),
    ]);
  } catch (error) {
    console.error("初始化数据失败:", error);
    showToast("数据加载失败，请刷新重试");
  } finally {
    loading.value = false;
  }
};

// 初始化时设置当前日期为选中状态并获取数据
onMounted(async () => {
  selectedDay.value = currentDate.value.getDate();
  await initData();
});
</script>

<style lang="less" scoped>
.study-behaviour {
  min-height: 100vh;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  //   padding-bottom: 20px;

  // 学习打卡信息卡片
  .study-card {
    box-sizing: border-box;
    width: 343px;
    min-height: 115px;
    margin: 16px 17px 0 15px;
    background: url("@/assets/personal/behaviour/bg.png") no-repeat;
    background-size: auto;
    width: auto;
    height: auto;
    // overflow: auto;

    position: relative;

    .icon2 {
      transform: rotate(8.81deg);
      position: absolute;
      top: -16px;
      right: -5.57px;
    }
    .study-info {
      .study-icon {
        // margin: 8px 0 0 12px;
        padding: 8px 0 0 12px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        // margin-right: 15px;
        font-family: "Alibaba PuHuiTi 2.0";
        font-size: 14px;
        font-weight: normal;
        line-height: 21px;
        letter-spacing: 0px;

        img {
          width: 17px;
          height: 17px;
          margin-right: 8px;
        }
      }

      .study-data {
        flex: 1;
      }

      .study-stats {
        display: flex;
        justify-content: space-between;
        max-width: 200px;
        margin-left: 24px;
        margin-top: 8px;

        .study-hours,
        .study-days {
          display: flex;
          flex-direction: column;
          align-items: center;
          // margin-bottom: 9px;

          .first {
            display: flex;
            align-items: flex-end;
          }

          .number {
            font-family: "Sansita One";
            font-size: 40px;
            font-weight: normal;
            line-height: 40px;
            letter-spacing: 0px;
            color: #3fb3fb;
            text-shadow: 0px 4px 10px rgba(255, 255, 255, 0.3);
          }

          .unit {
            font-family: "Alibaba PuHuiTi 2.0";
            font-size: 14px;
            font-weight: normal;
            line-height: 20px;
            text-align: center;
            letter-spacing: 0px;
            color: #000000;
            margin-left: 7px;
          }

          .desc {
            color: #000000;
            margin-top: 7px;
            font-family: "Alibaba PuHuiTi 2.0";
            font-size: 14px;
            font-weight: normal;
            line-height: 20px;
            text-align: center;
            letter-spacing: 0px;
          }
        }
      }
    }
  }

  // 打卡提示
  .punch-tip {
    width: 343px;
    height: 80px;
    background: linear-gradient(179deg, #81cfff -7%, #ffffff 85%);
    border-radius: 16px 16px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 30px auto 0;
    position: relative;
    .people {
      width: 64px;
      height: 100px;
      margin-left: 38px;
      position: absolute;
      top: -22px;
    }

    .tip-text {
      font-family: "DingTalk JinBuTi";
      font-size: 20px;
      font-weight: normal;
      line-height: 21px;
      letter-spacing: 0px;
      color: #3d3d3d;
      position: absolute;
      top: 13px;
      right: 61px;
    }
  }

  // 日历容器
  .calendar-container {
    position: relative;
    top: -36px;
    width: calc(100% - 30px);
    height: auto;
    margin: 0 15px;
    background-color: #ffffff;
    border-radius: 10px;
    padding: 9px 5.44px 0px 3px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    // 日历头部
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding: 0 8.5px 0 11px;
      font-family: "Alibaba PuHuiTi 2.0";
      font-size: 16px;
      line-height: 20px;
      letter-spacing: 0px;

      .month-selector {
        display: flex;
        align-items: center;

        .current-month {
          margin-right: 12px;
          font-weight: 500;
        }

        .month-arrows {
          display: flex;
          gap: 20px;

          img {
            cursor: pointer;
            transition: transform 0.2s ease;

            &:hover {
              transform: scale(1.1);
            }
          }
        }
      }

      .sign-toggle {
        display: flex;
        align-items: center;
        font-weight: normal;

        span {
          margin-right: 8px;
        }
      }
    }

    // 星期表头
    .week-header {
      margin-left: 0;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 1px solid #d8d8d8;
      padding: 0 5px;

      .week-day {
        font-family: "Roboto", sans-serif;
        font-size: 14px;
        font-weight: normal;
        line-height: 20px;
        text-align: center;
        color: #6b7280;
        padding: 0 0 8px;
      }
    }

    // 日期网格
    .days-grid {
      margin-left: 0;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
      padding: 0 5px;

      .day-cell {
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        // flex-direction: column;
        font-size: 14px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;

        font-family: Inter;
        font-size: 17.06px;
        font-weight: normal;
        line-height: 25.59px;
        text-align: center;
        position: relative;

        &.active {
          background: #3fb3fb;
          color: #000;
        }

        &.inactive {
          background: #e3e1e1;
          color: #000;
        }

        &.today {
          // border: 1px solid #097df4;
          // color: #3fb3fb;
        }

        &.selected:not(.active) {
          background-color: #e6f7ff;
          border: 1px solid #000;
          color: #3fb3fb;
        }

        &.empty {
          background: transparent;
          cursor: default;
          pointer-events: none;
        }
        img {
          position: absolute;
          bottom: 0px;
          right: 6px;
        }
      }
    }
  }

  // 打卡按钮
  .punch-button-container {
    // margin-top: 30px;
    display: flex;
    justify-content: center;

    position: relative;
    top: -20px;

    .punch-button {
      background-color: #097df4;
      color: white;
      border: none;
      border-radius: 25px;
      padding: 12px 60px;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 10px rgba(9, 125, 244, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background-color: #0056b3;
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
        box-shadow: 0 2px 5px rgba(9, 125, 244, 0.3);
      }

      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }
}
</style>
