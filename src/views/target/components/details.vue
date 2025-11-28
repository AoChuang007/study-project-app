<template>
  <div class="details-page">
    <topNav :title="title"></topNav>
    <!-- 目标信息卡片 -->
    <div class="target-info">
      <div class="progressBar">
        <van-progress
          :percentage="progressPercentage"
          :show-pivot="false"
          stroke-width="8px"
          class="progress"
          track-color="#E5E7EB"
          color="linear-gradient(270deg, #FDA3A3 0%, rgba(100, 180, 255, 0.55) 94%)"
        />
      </div>
      <div class="date-range">
        <div class="date-item left">
          <span class="year">{{ startYear }}</span>
          <span class="month-day">{{ startMonthDay }}</span>
        </div>
        <div class="time-box">
          <span class="separator">时间剩余</span>
          <span class="percentage">{{ alldays - passdDays }}天</span>
          <!-- <span class="percentage">{{ progressPercentage }}%</span> -->
        </div>

        <div class="date-item right">
          <span class="year">{{ endYear }}</span>
          <span class="month-day">{{ endMonthDay }}</span>
        </div>
      </div>

      <div class="progress-info">
        <div class="progressBar">
          <van-progress
            :percentage="hoursPercentage"
            :show-pivot="false"
            stroke-width="8px"
            class="progress"
            track-color="#E5E7EB"
            color="linear-gradient(90deg, rgba(122, 153, 240, 0.549) 2%, #96FFC5 100%)"
          />
        </div>
        <div class="progress-range">
          <div class="date-item left">
            <span class="year">0</span>
            <span class="month-day">{{ actualHours }}</span>
          </div>
          <div class="time-box">
            <span class="separator">总体任务进度</span>
            <span class="percentage">{{ hoursPercentage }}%</span>
          </div>
          <div class="date-item right">
            <span class="year">任务点</span>
            <span class="month-day">{{ estimatedHours }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 任务列表 -->
    <div class="task-list">
      <div class="title">进行中任务</div>
      <div v-for="(task, index) in taskList" :key="index" class="task-item">
        <div class="task-header">
          <input
            type="checkbox"
            :checked="task.status === 1"
            @change="toggleTaskStatus(task, index)"
            class="task-checkbox"
          />
          <span class="task-title">{{ task.title }}</span>
        </div>
        <div class="task-progress">
          <van-progress
            class="progress"
            :percentage="task.progress"
            :show-pivot="false"
            stroke-width="8px"
            :color="getProgressStyle(task)"
            track-color="#E5E7EB"
          />
          <span class="task-count">{{ task.current }}/{{ task.total }}</span>
          <!-- src\assets\target\add.png -->
          <img src="@/assets/target/add.png" alt="" @click="goToTimer(task)" />
        </div>
      </div>
    </div>

    <!-- 已完成任务 -->
    <div class="completed-section">
      <div class="title">已完成任务</div>
      <!-- <p>{{ completedTasks.length }}</p> -->
      <!-- 已完成任务列表 -->
      <div
        v-for="(task, index) in completedTasks"
        :key="index"
        class="task-item"
      >
        <div class="task-header">
          <input
            type="checkbox"
            :checked="task.status === 1"
            @change="toggleTaskStatus(task, index, true)"
            class="task-checkbox"
          />
          <span class="task-title">{{ task.title }}</span>
        </div>
        <div class="task-progress">
          <van-progress
            class="progress"
            :percentage="100"
            :show-pivot="false"
            stroke-width="6px"
            :color="getProgressStyle(task)"
            track-color="#E5E7EB"
          />
          <span class="task-count">{{ task.total }}/{{ task.total }}</span>
          <img src="@/assets/target/add.png" alt="" />
        </div>
      </div>
      <!-- 空状态提示 -->
      <div v-if="completedTasks.length === 0" class="empty-state">
        <div class="empty-icon">🌟</div>
        <div class="empty-text">还没有完成的任务</div>
        <div class="empty-encourage">每一个小步骤都是向目标迈进，加油！</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import topNav from "@/components/top/nomal.vue";
import { getSubGoalsByGoalId } from "@/views/target/api/index.js";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();

const route = useRoute();

// 从路由查询参数中获取数据
const title = computed(() => {
  return route.query.title || "详情";
});

const estimatedHours = computed(() => {
  return parseInt(route.query.estimatedHours) || 100;
});

const actualHours = computed(() => {
  return parseInt(route.query.actualHours) || 0;
});

const goal_id = computed(() => {
  return route.query.id || ""; // 改为从id获取
});

// 子目标数据
const targetListData = ref([]);

// 获取子目标数据
const fetchSubGoals = async () => {
  try {
    // 首先检查路由参数中是否有goalTasks数据（从addTarget页面跳转过来）
    const goalTasksFromRoute = route.query.targetListDate;
    if (goalTasksFromRoute) {
      try {
        const parsedGoalTasks = JSON.parse(goalTasksFromRoute);
        if (Array.isArray(parsedGoalTasks) && parsedGoalTasks.length > 0) {
          targetListData.value = parsedGoalTasks;
          console.log("使用路由参数中的goalTasks数据:", parsedGoalTasks);
          return; // 如果有路由数据，直接返回，不再调用API
        }
      } catch (parseError) {
        console.error("解析goalTasks数据失败:", parseError);
      }
    }

    // 如果没有路由数据或解析失败，则通过API获取
    if (goal_id.value) {
      console.log("goal_id.value", goal_id.value);
      const response = await getSubGoalsByGoalId(goal_id.value);
      if (response && response.data) {
        targetListData.value = response.data;
        console.log("通过API获取子目标数据:", response.data);
      }
    }
  } catch (error) {
    console.error("获取子目标数据失败:", error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchSubGoals();
});

const progressPercentage = computed(() => {
  return Math.round((passdDays.value / alldays.value) * 100) || 0;
});

// 计算实际工时与预估工时的百分比
const hoursPercentage = computed(() => {
  if (estimatedHours.value === 0) return 0;
  return Math.round((actualHours.value / estimatedHours.value) * 100);
});

// targetListData 现在是响应式数据，不再从路由参数获取

const startDateFromQuery = computed(() => {
  return route.query.startDate || "2025-05-12";
});

const endDateFromQuery = computed(() => {
  return route.query.endDate || "2025-06-12";
});

const startDate = computed(() => {
  return startDateFromQuery.value.replace(/-/g, "/");
});

const endDate = computed(() => {
  return endDateFromQuery.value.replace(/-/g, "/");
});
// 得到任务的总时间
const alldays = computed(() => {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const diff = end.getTime() - start.getTime();
  console.log("总时间" + Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});
// 获取今日时间 今日时间-开始时间 =已过去的时间
const passdDays = computed(() => {
  const now = new Date();
  const start = new Date(startDate.value);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});
// 拆分开始日期为年份和月日
const startYear = computed(() => {
  return startDate.value.split("/")[0];
});

const startMonthDay = computed(() => {
  const parts = startDate.value.split("/");
  return `${parts[1]}/${parts[2]}`;
});

// 拆分结束日期为年份和月日
const endYear = computed(() => {
  return endDate.value.split("/")[0];
});

const endMonthDay = computed(() => {
  const parts = endDate.value.split("/");
  return `${parts[1]}/${parts[2]}`;
});

// 处理任务列表数据 - 未完成的任务
const taskList = computed(() => {
  return targetListData.value
    .filter((task) => task.status === 0) // 只显示未完成的任务
    .map((task) => {
      const progress =
        task.actualHours > 0
          ? Math.round((task.actualHours / task.estimatedHours) * 100)
          : 0;
      return {
        ...task, // 保留原始任务对象的所有属性
        task_id: task.id, // 映射id到task_id
        total: task.estimatedHours,
        current: task.actualHours,
        progress: progress,
      };
    });
});

// 已完成任务
const completedTasks = computed(() => {
  return targetListData.value
    .filter((task) => task.status === 1) // 只显示已完成的任务
    .map((task) => {
      return {
        ...task, // 保留原始任务对象的所有属性
        task_id: task.id, // 映射id到task_id
        total: task.estimatedHours,
        current: task.actualHours,
      };
    });
});
console.log(completedTasks.value);

// 进度条的动态颜色
const getProgressStyle = (item) => {
  const percentage = percentageNum(item.current, item.total);
  console.log(percentage);
  if (percentage > 50) {
    return "linear-gradient(90deg, rgba(122, 153, 240, 0.549) 2%, #96FFC5 100%)";
  } else {
    return "linear-gradient(270deg, #FDA3A3 0%, rgba(100, 180, 255, 0.55) 94%)";
  }
};
// 百分比计算
const percentageNum = (hasFinish, allWork) => {
  return Math.round((hasFinish / allWork) * 100);
};

// 切换任务状态
const toggleTaskStatus = async (task) => {
  try {
    // 切换状态：0变1，1变0
    const newStatus = task.status === 0 ? 1 : 0;

    // 更新本地数据
    const taskIndex = targetListData.value.findIndex((t) => t.id === task.id);

    if (taskIndex !== -1) {
      targetListData.value[taskIndex].status = newStatus;

      // 这里应该调用接口更新服务器数据
      // await updateTaskStatus(task.id, newStatus);
      console.log(
        `任务 "${task.title}" 状态已更新为: ${newStatus === 1 ? "已完成" : "未完成"}`
      );
    }
  } catch (error) {
    console.error("更新任务状态失败:", error);
  }
};

// 跳转到计时页面
const goToTimer = (item) => {
  router.push({
    name: "timekeeping",
    query: {
      goal_id: goal_id.value,
      task_id: item.task_id,
      title: item.title,
    },
  });
};
</script>

<style lang="less" scoped>
.details-page {
  min-height: 100vh;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);

  .target-info {
    background: white;
    width: 342px;
    height: 140px;
    border-radius: 16px;
    padding: 9px 13px;
    margin: 17px auto;

    .progressBar {
      .progress {
        margin: 0 auto;
        border-radius: 2px;
        width: 255px;
        height: 8px;
      }
    }
    .date-range,
    .progress-range {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #d8d8d8;
      .date-item {
        margin-top: 2px;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        .year {
          font-family: "Alibaba PuHuiTi 3.0";
          font-size: 10px;
          font-weight: normal;
          line-height: 16px;
          letter-spacing: 0px;
          color: #3d3d3d;
        }
        .month-day {
          margin-top: 5px;
          font-family: "Alibaba PuHuiTi 3.0";
          font-size: 13px;
          font-weight: 600;
          line-height: 16px;
          letter-spacing: 0px;
          color: #3d3d3d;
        }
      }
      .left {
        margin-left: 12px;
      }
      .right {
        margin-right: 10px;
      }
      .time-box {
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        .separator {
          font-family: "Alibaba PuHuiTi 3.0";
          font-size: 13px;
          font-weight: 500;
          line-height: 16px;
          letter-spacing: 0px;
          color: #3d3d3d;
        }
        .percentage {
          margin-top: 7px;
          font-family: "Alibaba PuHuiTi 3.0";
          font-size: 14px;
          font-weight: 600;
          line-height: 16px;
          letter-spacing: 0px;
          color: #f17878;
        }
      }
    }

    .progress-info {
      // display: flex;
      // justify-content: space-between;
      // align-items: center;
      margin-bottom: 20px;

      .progressBar {
        .progress {
          margin: 0 auto;
          border-radius: 2px;
          width: 255px;
          height: 8px;
        }
      }
      .progress-range {
        border-bottom: 0px;
        margin-top: 10px;
        margin-bottom: 0px;
        padding: 0;
      }

      .progress-left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .days {
          font-size: 24px;
          font-weight: bold;
          color: #ff6b6b;
        }

        .label {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
      }

      .progress-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .percentage {
          font-size: 24px;
          font-weight: bold;
          color: #4caf50;
        }

        .total {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
      }
    }

    .current-task {
      .label {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
    }
  }

  .task-list,
  .completed-section {
    margin-bottom: 20px;

    font-family: "Alibaba PuHuiTi 3.0";
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;
    letter-spacing: 0px;

    color: #3d3d3d;
    .title {
      margin-bottom: 9px;
      margin-left: 18px;
    }

    .task-item {
      width: 342px;
      height: 75px;
      background: white;
      border-radius: 16px;
      padding: 10px 13px 0 12px;
      margin: 0 auto 15px;

      .task-header {
        display: flex;
        align-items: center;
        //   margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid #d8d8d8;

        .task-checkbox {
          width: 18px;
          height: 18px;
          margin-right: 12px;
          appearance: none;
          border: 2px solid #bfe1ff;
          border-radius: 3px;
          background-color: white;
          cursor: pointer;
          position: relative;

          &:checked {
            background: white;
            border-color: #bfe1ff;

            &::after {
              content: url("@/assets/target/check.png");
              position: absolute;
              top: -2px;
              left: 2px;
              // color: white;
              font-size: 14px;
              font-weight: bold;
            }
          }
        }
      }

      .task-progress {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-top: 15px;
        .progress {
          width: 227px;
          height: 8px;
          border-radius: 2px;
        }

        .task-count {
          font-size: 12px;
          color: #666;
          min-width: 40px;
          text-align: right;
        }
      }
    }

    // 空状态提示样式
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;

      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.8;
      }

      .empty-text {
        font-size: 16px;
        color: #999;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .empty-encourage {
        font-size: 14px;
        color: #666;
        line-height: 1.4;
        max-width: 280px;
      }
    }
  }
}
</style>
