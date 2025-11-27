<template>
  <div class="history-container">
    <img src="@/assets/target/star.png" alt="" class="star1" />
    <img src="@/assets/target/star.png" alt="" class="star2" />
    <!-- 顶部导航 -->
    <Normal title="历史答题记录" />

    <!-- 日期选择器 -->
    <div class="date-selector">
      <van-field
        v-model="selectedDate"
        readonly
        @click="showDatePicker = true"
        class="date-field"
      >
        <template #right-icon>
          <img src="@/assets/tree/down.png" alt="" />
        </template>
      </van-field>
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker
          v-model="currentDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list">
      <div v-if="filteredHistory.length === 0" class="empty-state">
        <p>该日期暂无答题记录</p>
      </div>
      <div v-else>
        <div
          v-for="(record, index) in filteredHistory"
          :key="record.id"
          class="history-item"
        >
          <!-- 时间轴 -->
          <div class="timeline">
            <!-- 第一个小球前面的线 -->
            <div v-if="index === 0" class="time-line time-line-before"></div>
            <div class="time-dot">{{ formatTime(record.completedAt) }}</div>
            <!-- 中间的连接线 -->
            <div
              v-if="index < filteredHistory.length - 1"
              class="time-line"
            ></div>
            <!-- 最后一个小球后面的线 -->
            <div
              v-if="index === filteredHistory.length - 1"
              class="time-line time-line-after"
            ></div>
          </div>

          <!-- 记录内容 -->
          <div class="record-content" :class="{ 'first-record': index === 0 }" @click="showRecordAnalysis(record)">
            <div class="record-header">
              <span class="level-name">第{{ numberToChinese(record.levelId) }}关</span>
              <div class="stars">
                <div class="star-container">
                  <img
                    v-for="star in record.starsEarned"
                    :key="star"
                    :src="starIcon"
                    class="star-icon"
                    alt="star"
                  />
                  <div
                    v-for="emptyStar in 3 - record.starsEarned"
                    :key="`empty-${emptyStar}`"
                    class="star-placeholder"
                  ></div>
                </div>
                <span
                  class="accuracy"
                  :class="{
                    'high-accuracy': getAccuracy(record) >= 90,
                    'low-accuracy': getAccuracy(record) < 90,
                  }"
                  >正确率{{ getAccuracy(record) }}%</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 分析详情弹窗 -->
  <van-popup
    v-model:show="showAnalysisModal"
    position="center"
    :style="{ width: '90%', maxWidth: '400px', borderRadius: '16px' }"
    closeable
    close-icon-position="top-right"
    @close="closeAnalysisModal"
  >
    <div class="analysis-modal" v-if="selectedRecord">
      <div class="modal-header">
        <h3>第{{ numberToChinese(selectedRecord.levelId) }}关 - 质量分析</h3>
      </div>
      <div class="modal-content">
        <div class="analysis-text">
          {{ selectedRecord.qualityAnalysis || '暂无分析数据' }}
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getUserHistory } from "../api/index.js";
import Normal from "@/components/top/nomal.vue";
import starIcon from "@/assets/tree/starPass.png";

// 响应式数据
const historyData = ref([]);
const selectedDate = ref("");
const currentDate = ref(["2025", "07", "15"]);
const showDatePicker = ref(false);
const loading = ref(false);
const showAnalysisModal = ref(false);
const selectedRecord = ref(null);

// 空星星图标（可以用CSS创建或使用其他图标）
// const starEmptyIcon = ref(
//   "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTUuMDkgOC4yNkwyMiA5TDE3IDEzLjc0TDE4LjE4IDIyTDEyIDE4LjI3TDUuODIgMjJMNyAxMy43NEwyIDlMOC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiNEREREREQiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K"
// );

// 计算属性 - 根据选择的日期过滤历史记录并按时间排序
const filteredHistory = computed(() => {
  let records = historyData.value;
  
  if (selectedDate.value && records.length) {
    const targetDate = selectedDate.value;
    records = records.filter((record) => {
      const recordDate = new Date(record.completedAt).toLocaleDateString("zh-CN");
      return recordDate === targetDate;
    });
  }
  
  // 按时间排序（最早的在前）
  return records.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
});

// 方法
const fetchHistoryData = async () => {
  try {
    loading.value = true;
    const response = await getUserHistory();
    historyData.value = response.data || [];
  } catch (error) {
    console.error("获取历史数据失败:", error);
  } finally {
    loading.value = false;
  }
};

const onDateConfirm = ({ selectedValues }) => {
  const [year, month, day] = selectedValues;
  selectedDate.value = `${year}/${month}/${day}`;
  showDatePicker.value = false;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getAccuracy = (record) => {
  if (record.totalQuestions === 0) return 0;
  return Math.round((record.correctAnswers / record.totalQuestions) * 100);
};

// 数字转中文
const numberToChinese = (num) => {
  const chineseNumbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num <= 10) {
    return chineseNumbers[num];
  }
  // 处理更大的数字（如果需要）
  return num.toString();
};

// 点击记录显示分析详情
const showRecordAnalysis = (record) => {
  selectedRecord.value = record;
  showAnalysisModal.value = true;
};

// 关闭分析弹窗
const closeAnalysisModal = () => {
  showAnalysisModal.value = false;
  selectedRecord.value = null;
};

// 生命周期
onMounted(() => {
  // 设置默认日期为今天
  const today = new Date();
  selectedDate.value = today.toLocaleDateString("zh-CN");

  // 获取历史数据
  fetchHistoryData();
});
</script>

<style lang="less" scoped>
.history-container {
  min-height: 100vh;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  position: relative;
  .star1{
    position: absolute;
left: -6px;
top: 563px;
width: 32px;
height: 37px;
  }
    .star2{
    position: absolute;
left: 304px;
top: 611px;
width: 58px;
height: 67px;
  }
}

.date-selector {
  width: 152px;
  height: 30px;
  // padding: 16px;
  background: #3fb3fb;
  margin: 16px 21px 20px;
  border-radius: 19px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .date-field {
    margin-left: 10px;
    margin-right: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px;

    background: transparent;

    font-family: "Alibaba PuHuiTi 2.0";
    font-size: 15px;
    font-weight: 500;
    line-height: 40px;
    color: #3d3d3d;
  }
}

.history-list {
  padding: 0px 24px 0 13px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.history-item {
  display: flex;

  .timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 16px;

    .time-dot {
      width: 42px;
      height: 42px;
      background: #4a9eff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      font-family: "Alibaba PuHuiTi 2.0";
      font-size: 12px;
      font-weight: 300;
      line-height: 40px;
      color: #3d3d3d;

      text-align: center;

      position: relative;
      z-index: 5;
    }

    .time-line {
      width: 3px;
      height: 60px;
      background: #9cc0ff;
      // margin-top: 8px;
      position: relative;
      z-index: 1;
    }

    .time-line-before {
      height: 26px;
      margin-bottom: -3px;
    }

    .time-line-after {
      height: 35px;
      margin-top: -3px;
    }
  }

  .record-content {
    margin-top: 7px;
    flex: 1;
    background: #eef9fd;
    width: 279px;
    height: 56px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    display: flex;
    justify-content: space-between;
    align-items: center;
    // padding: 16px;
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  }

  .record-content.first-record {
    margin-top: 33px;
  }

  .record-header {
    height: 56px;
    width: 279px;
    display: flex;
    justify-content: space-around;
    // justify-content: space-between;
    align-items: center;
    // padding:0 22px 0 24px;

    .level-name {
      font-family: "Alibaba PuHuiTi 2.0";
      font-size: 15px;
      font-weight: 500;
      // line-height: 40px;
      color: #3d3d3d;
    }

    .stars {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .star-container {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .star-icon {
        margin-top: 8px;
        width: 13px;
        height: 13px;
      }

      .star-placeholder {
        margin-top: 8px;
        width: 13px;
        height: 13px;
      }

      .accuracy {
        margin-left: 8px;
        font-size: 14px;
        color: #666;

        &.high-accuracy {
          font-family: "Alibaba PuHuiTi 2.0";
          font-size: 14px;
          font-weight: normal;
          // line-height: 40px;
          color: #51d1a7;
        }

        &.low-accuracy {
          font-family: "Alibaba PuHuiTi 2.0";
          font-size: 14px;
          font-weight: normal;
          // line-height: 40px;
          color: #f17878;
        }
      }
    }
  }
}

// 适配不同星级的颜色
.stars {
  .star-icon:nth-child(1) {
    filter: hue-rotate(0deg); // 金色
  }
  .star-icon:nth-child(2) {
    filter: hue-rotate(0deg); // 金色
  }
  .star-icon:nth-child(3) {
    filter: hue-rotate(0deg); // 金色
  }
}

// 分析详情弹窗样式
.analysis-modal {
  padding: 24px;
  background: #fff;
  border-radius: 16px;

  .modal-header {
    margin-bottom: 20px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      color: #333;
      font-family: "Alibaba PuHuiTi 2.0", sans-serif;
    }
  }

  .modal-content {
    .analysis-text {
      font-size: 14px;
      line-height: 1.6;
      color: #666;
      text-align: left;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 300px;
      overflow-y: auto;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3fb3fb;
    }
  }
}
</style>