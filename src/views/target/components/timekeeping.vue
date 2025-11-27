<template>
  <div class="timekeeping-page">
    <top-nav :title="title"></top-nav>
    <div class="timer">
      <!-- 计时器主体 -->
      <div class="timer-container">
        <!-- 环形进度条 -->
        <div class="circular-progress">
          <svg class="progress-ring" width="203" height="203">
            <circle
              class="progress-ring-track"
              cx="101.5"
              cy="101.5"
              r="87.5"
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.3)"
              stroke-width="8"
            />
            <circle
              class="progress-ring-bar"
              cx="101.5"
              cy="101.5"
              r="87.5"
              fill="transparent"
              stroke="#4A90E2"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              transform="rotate(0 101.5 101.5)"
            />
          </svg>

          <!-- 跟随进度条移动的圆点图片 -->
          <!-- <img 
          src="@/assets/target/circle.png" 
          alt="progress-dot" 
          class="progress-dot"
          :style="progressDotStyle"
        /> -->

          <!-- 中间的时间显示 -->
          <div class="time-display">
            <span class="time-text">{{ formattedTime }}</span>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="control-buttons">
        <!-- 暂停/开始按钮 -->
        <button
          class="control-btn pause-btn"
          @click="toggleTimer"
          :class="{ active: isRunning }"
        >
          <div class="btn-icon">
            <div v-if="isRunning" class="pause-icon">
              <div class="pause-bar"></div>
              <div class="pause-bar"></div>
            </div>
            <div v-else class="play-icon"></div>
          </div>
        </button>

        <!-- 结束按钮 -->
        <button class="control-btn stop-btn" @click="stopTimer">
          <div class="btn-icon">
            <div class="stop-icon"></div>
          </div>
        </button>
      </div>
    </div>
    <!-- 装饰星星 -->
    <img src="@/assets/target/star.png" alt="" class="star1" />
    <img src="@/assets/target/star.png" alt="" class="star2" />
    <img src="@/assets/target/star.png" alt="" class="star3" />
    <img src="@/assets/target/star.png" alt="" class="star4" />
    <img src="@/assets/target/star.png" alt="" class="star5" />

    <!-- 完成弹窗 -->
    <finish
      v-if="showFinishDialog"
      :time="1"
      :linktime="20"
      :points="400"
      @close="showFinishDialog = false"
    />
  </div>
</template>

<script setup>
import topNav from "@/components/top/nomal.vue";
import finish from "./finish.vue";
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { showToast } from 'vant';
import {recordPunchEvent} from "../api/index";

// src\store\user.js
// import {getUserInfo} from "../store/user";

const route = useRoute();
// console.log(getUserInfo())
// const id  = getUserInfo().id;
// 从路由查询参数中获取数据
const title = computed(() => {
  return route.query.title || "计时";
});
const goal_id = computed(() => {
  return route.query.goal_id || "";
});
const task_id = computed(() => {
  return route.query.task_id || "";
});

// 计时器状态
const totalSeconds = ref(0); // 总秒数
const isRunning = ref(false); // 是否正在运行
const showFinishDialog = ref(false); // 完成弹窗状态
let timerInterval = null;

// 计时时间记录
const startTime = ref(null); // 开始时间
const endTime = ref(null); // 结束时间
const timingDate = ref(null); // 计时日期

// 环形进度条相关
const radius = 87.5;
const circumference = 2 * Math.PI * radius;

// 计算进度条偏移量（每小时为一圈）
const strokeDashoffset = computed(() => {
  const secondsInHour = 3600; // 一小时的秒数
  const currentHourSeconds = totalSeconds.value % secondsInHour; // 当前小时内的秒数
  const progress = currentHourSeconds / secondsInHour; // 当前小时的进度
  // 从顶部开始，进度条顺时针填充
  return circumference - progress * circumference;
});

// 格式化时间显示
const formattedTime = computed(() => {
  const minutes = Math.floor(totalSeconds.value / 60);
  const seconds = totalSeconds.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
});

// 计算进度圆点的位置
// const progressDotStyle = computed(() => {
//   const secondsInHour = 3600; // 一小时的秒数
//   const currentHourSeconds = totalSeconds.value % secondsInHour; // 当前小时内的秒数
//   const progress = currentHourSeconds / secondsInHour; // 当前小时的进度

//   // 计算角度（从右侧开始，顺时针）
//   const angle = progress * 360; // 角度
//   const radian = angle * (Math.PI / 180); // 转换为弧度，从右侧开始

//   // 计算圆点位置（相对于SVG中心101.5,101.5，半径87.5）
//   const centerX = 101.5;
//   const centerY = 101.5;
//   const dotRadius = 87.5;

//   const x = centerX + dotRadius * Math.cos(radian);
//       const y = centerY + dotRadius * Math.sin(radian);

//   return {
//     position: 'absolute',
//     left: `${x - 8}px`, // 减去图片宽度的一半进行居中
//     top: `${y - 8}px`, // 减去图片高度的一半进行居中
//     transform: 'translate(-50%, -50%)',
//     transition: 'all 0.3s ease'
//   };
// });

// 开始/暂停计时器
const toggleTimer = () => {
  if (isRunning.value) {
    // 暂停
    clearInterval(timerInterval);
    isRunning.value = false;
  } else {
    // 开始
    // 如果是第一次开始或重新开始，记录开始时间
    if (!startTime.value || totalSeconds.value === 0) {
      const now = new Date();
      startTime.value = now;
      timingDate.value = now.toISOString().split('T')[0]; // YYYY-MM-DD格式
    }
    
    isRunning.value = true;
    timerInterval = setInterval(() => {
      totalSeconds.value++;
    }, 1000);
  }
};

// 页面加载时自动开始计时
onMounted(() => {
  // 记录开始时间和计时日期
  const now = new Date();
  startTime.value = now;
  timingDate.value = now.toISOString().split('T')[0]; // YYYY-MM-DD格式
  
  // 自动开始计时
  isRunning.value = true;
  timerInterval = setInterval(() => {
    totalSeconds.value++;
  }, 1000);
});

// 停止计时器
const stopTimer = async () => {
  clearInterval(timerInterval);
  isRunning.value = false;

  // 记录结束时间
  endTime.value = new Date();

  
  // 获取计时时间数据
  const timingData = {
    id: Number(goal_id.value),
    task_id: Number(task_id.value),
    // 总小时
    hours: parseFloat((totalSeconds.value / 3600).toFixed(2)),
    // 开始时间（只保存时分）
    startTime: startTime.value ? startTime.value.toTimeString().split(' ')[0].substring(0, 5) : null,
    // 结束时间（只保存时分）
    endTime: endTime.value ? endTime.value.toTimeString().split(' ')[0].substring(0, 5) : null,
    // 计时日期
    timingDate: timingDate.value,
  };

  console.log("计时结束，时间数据：", timingData);

  // 判断打卡时间是否太短
  if (timingData.hours === 0.00) {
    showToast("打卡时间太短了，不计入时间");
    // 重置计时器
    return;
  }

  try {
    // TODO: 调用接口保存计时数据

    const response = await recordPunchEvent(timingData);
    console.log('保存成功：', response);

    // 暂时使用模拟接口调用
    // await new Promise((resolve) => setTimeout(resolve, 500));
    // console.log("计时数据已保存（模拟）");
  } catch (error) {
    console.error("保存计时数据失败：", error);
  }

  // 显示完成弹窗
  showFinishDialog.value = true;

  // 重置计时器
  totalSeconds.value = 0;
};

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style lang="less" scoped>
.timekeeping-page {
  min-height: 100vh;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  position: relative;
  .timer {
    display: flex;
    flex-direction: column;
    align-items: center;

    .timer-container {
      // flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 172px; // 增加上边距，给topNav留出足够空间
      // padding-top: 20px;

      .circular-progress {
        position: relative;

        .progress-ring {
          transform: rotate(-90deg);
        }

        .progress-ring-bar {
          transition: stroke-dashoffset 0.3s ease;
        }

        .time-display {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          .time-text {
            font-family: "Sansita One";
            font-size: 40px;
            font-weight: normal;
            line-height: 40px;
            letter-spacing: 0px;
            color: #3fb3fb;

            text-shadow: 0px 4px 10px rgba(255, 255, 255, 0.3);
          }
        }

        .progress-dot {
          width: 16px;
          height: 16px;
          z-index: 10;
          pointer-events: none;
        }
      }
    }

    .control-buttons {
      display: flex;
      justify-content: space-between;
      width: 200px;
      // margin-bottom: 80px;
      margin-top: 128px;

      .control-btn {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: none;
        background: #7ac4ff;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:active {
          transform: translateY(0);
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.pause-btn {
          .pause-icon {
            display: flex;
            gap: 4px;

            .pause-bar {
              width: 8px;
              height: 27px;
              background: #eef8fd;
              border-radius: 8px;
            }
          }

          .play-icon {
            width: 0;
            height: 0;
            border-left: 20px solid #eef8fd;
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            margin-left: 4px;
          }

          &.active {
            background: rgba(74, 144, 226, 0.1);
          }
        }

        &.stop-btn {
          .stop-icon {
            width: 20px;
            height: 20px;
            background: #eef8fd;
            border-radius: 3px;
          }
        }
      }
    }
  }

  // 装饰星星样式
  .star1 {
    position: absolute;
    top: 78px;
    left: 33px;
    opacity: 0.7;
  }
  .star2 {
    width: 46px;
    height: 53px;
    position: absolute;
    bottom: 173px;
    left: 29px;
    opacity: 0.7;
  }
  .star3 {
    width: 32px;
    height: 37px;
    position: absolute;
    top: 151px;
    right: 26px;
    opacity: 0.7;
  }
  .star4 {
    width: 32px;
    height: 37px;
    position: absolute;
    bottom: 226px;
    right: -2px;
    opacity: 0.7;
  }
  .star5 {
    width: 58px;
    height: 67px;
    position: absolute;
    bottom: -11px;
    right: 13px;
    opacity: 0.7;
  }
}
</style>