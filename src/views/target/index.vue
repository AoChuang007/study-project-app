<template>
  <div class="index" :class="{ masked: showDialog }">
    <topNav
      :username="userInfo.username"
      :level="userInfo.level"
      :time="userInfo.totalTime"
      class="top"
    />
    <tabber class="tabber" />
    <div class="backlog">
      <div class="title">
        <div class="titleFirst">
          <!-- <img src="@/assets/target/targetIcon4.png" alt="" /> -->
          <div class="smallbox">
            <img src="@/assets/target/icon.png" alt="" />
          </div>
          <p class="titleText1">今日代办</p>
        </div>
        <img src="@/assets/target/targetPeople.png" alt="" class="people" />
        <div class="addBut" @click="goToAddTarget">
          <img src="@/assets/target/addBut.png" alt="" class="button" />
          <p class="titleText2">创建目标</p>
        </div>
      </div>
      <div class="contentOut">
        <div class="in"></div>
        <div class="contentIn">
          <div
            v-for="(item, index) in unfinishedList"
            :key="index"
            class="item"
            @click="goToDetails(item)"
          >
            <div class="first">
              <div class="left">
                <img :src="item.img" alt="" />
                <div class="firstLeftSmall">
                  <p class="itemText1">{{ item.title }}</p>
                  <p class="itemText2">
                    剩余{{ remainTime(item.startDate, item.endDate) }}天
                  </p>
                </div>
              </div>
              <p class="text" @click="open(index, $event)">修改目标</p>
            </div>
            <!-- 进度条 -->
            <div class="progressBar">
              <van-progress
                :percentage="
                  percentageNum(item.actualHours, item.estimatedHours)
                "
                :show-pivot="false"
                stroke-width="8px"
                class="progress"
                :color="getProgressStyle(item)"
                track-color="#E5E7EB"
              />
              <p :class="getProgressClass(item)">
                {{ percentageNum(item.actualHours, item.estimatedHours) }}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="finished">
      <div class="title move">
        <div class="titleFirst">
          <!-- <img src="@/assets/target/targetIcon5.png" alt="" /> -->
          <div class="smallbox2">
            <img src="@/assets/target/icon2.png" alt="" />
          </div>
          <p class="titleText1">已完成</p>
        </div>
        <img src="@/assets/target/people2.png" alt="" class="people2" />
        <div class="bubble">
          <img src="@/assets/target/triangle.png" alt="" class="triangle" />
          <p class="titleText3">太棒啦，坚持就是胜利！</p>
        </div>
      </div>
      <div class="contentOut">
        <div class="in"></div>
        <div class="contentIn">
          <!-- 已完成目标列表 -->
          <div
            v-for="(item, index) in finishList"
            :key="index"
            class="item"
            @click="goToDetails(item)"
          >
            <div class="first">
              <div class="left">
                <img :src="item.img" alt="" />
                <div class="firstLeftSmall">
                  <p class="itemText1">{{ item.title }}</p>
                  <p class="itemText2">
                    剩余{{ remainTime(item.startDate, item.endDate) }}天
                  </p>
                </div>
              </div>
              <p class="text" @click="openFinished(index, $event)">修改目标</p>
            </div>
            <!-- 进度条 -->
            <div class="progressBar">
              <van-progress
                :percentage="
                  percentageNum(item.actualHours, item.estimatedHours)
                "
                :show-pivot="false"
                stroke-width="8px"
                class="progress"
                :color="getProgressStyle(item)"
                track-color="#E5E7EB"
              />
              <p :class="getProgressClass(item)">
                {{ percentageNum(item.actualHours, item.estimatedHours) }}%
              </p>
            </div>
          </div>
          <!-- 空状态提示 -->
          <div v-if="finishList.length === 0" class="empty-state-finished">
            <div class="empty-icon">🎉</div>
            <div class="empty-text">还没有完成的目标</div>
            <div class="empty-encourage">
              每一次努力都在为成功积蓄力量，继续加油！
            </div>
          </div>
        </div>
      </div>
    </div>

    <changeTarget
      :visible="showDialog"
      :targetListDate="backlogList[currentItemIndex]?.targetListDate || []"
      :startDate="backlogList[currentItemIndex]?.startDate || ''"
      :endDate="backlogList[currentItemIndex]?.endDate || ''"
      :parentGoal="backlogList[currentItemIndex] || {}"
      @close="handleClose"
      @update:timeData="handleTimeUpdate"
      @show-date-picker="handleShowDatePicker"
      @refresh="handleRefresh"
    />

    <!-- 日期选择器 -->
    <van-date-picker
      v-model="currentEnd"
      title="选择结束日期"
      :min-date="arrayToDate(currentStart)"
      :max-date="maxDate"
      v-show="showDatePicker"
      @confirm="handleEndConfirm"
      @cancel="handleDateCancel"
      class="datePicker"
    />
  </div>
  <!-- 悬浮球 -->
  <van-floating-bubble
    axis="xy"
    magnetic="x"
    @click="goToAiAssistant"
    class="transparent-bubble"
    style="background: transparent; gap: 0px"
  >
    <img
      src="@/assets/tree/float-ball.png"
      alt="AI助手"
      style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover"
    />
  </van-floating-bubble>
</template>

<script setup>
import tabber from "@/components/tabber/index.vue";
import topNav from "@/components/top/nosearch.vue";
import { useUserStore } from "@/store/user.js";
import { getStudyStats } from "@/views/rank/api/index.js";
import { getGoalsByUserId } from "@/views/target/api/index.js";
import changeTarget from "@/views/target/components/changeTarget.vue";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
// import { showToast } from "vant";

const router = useRouter();
const userStore = useUserStore();

// 学习时长数据
const studyTimeData = ref({
  dailyHours: 0,
  totalHours: 0,
});

// 从store获取真实用户数据
const userInfo = computed(() => {
  const storeUserInfo = userStore.userInfo || {};
  return {
    username: storeUserInfo.name || storeUserInfo.username || "用户",
    level: storeUserInfo.level || 1,
    time: storeUserInfo.todayTime || storeUserInfo.time || 0, // 今日学习时间
    totalTime: studyTimeData.value.totalHours || 0, // 使用接口获取的总学习时间
    starNumber: storeUserInfo.starNumber || storeUserInfo.stars || 0,
  };
});
// const onOffsetChange = (offset) => {
//   showToast(`x: ${offset.x.toFixed(0)}, y: ${offset.y.toFixed(0)}`);
// };

const goToAiAssistant = () => {
  router.push("/aiAssistant");
};

// 目标列表数据
const backlogList = ref([]);

// 获取目标列表数据
const fetchGoalsList = async () => {
  try {
    const response = await getGoalsByUserId();
    if (response && response.data) {
      // 为每个目标添加默认图片
      backlogList.value = response.data.map((goal) => ({
        ...goal,
        img: "@/assets/target/targetIcon1.png", // 使用默认图片
      }));
    }
  } catch (error) {
    console.error("获取目标列表失败:", error);
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
      };
    }
  } catch (error) {
    console.error("获取学习时长数据失败:", error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchGoalsList();
  fetchStudyTimeData();
});

// 得到剩余多少天
const remainTime = (startDate, endDate) => {
  // 得到任务的总时间
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  console.log("总时间" + Math.ceil(diff / (1000 * 60 * 60 * 24)));

  const now = new Date();
  if(now.getTime() - end.getTime() > 0){
    return 0;
  }
  const passd = now.getTime() - start.getTime();

  return (
    Math.ceil(diff / (1000 * 60 * 60 * 24)) -
    Math.ceil(passd / (1000 * 60 * 60 * 24))+1
  );
  // return diff-passd;
};
// 过滤出未完成的目标（status不为1）
const unfinishedList = computed(() => {
  return backlogList.value.filter((item) => item.status !== 1);
});

// 过滤出已完成的目标（status为1）
const finishList = computed(() => {
  return backlogList.value.filter((item) => item.status === 1);
});

// 控制弹窗显示的变量
const showDialog = ref(false);
// 当前选中的项目索引
const currentItemIndex = ref(0);
// 控制日期选择器显示
const showDatePicker = ref(false);
// 当前日期选择器的值
const currentStart = ref(["2025", "05", "10"]);
const currentEnd = ref(["2025", "06", "12"]);

// 处理弹窗关闭
const handleClose = () => {
  showDialog.value = false;
  console.log("弹窗已关闭");
};
const open = (index, event) => {
  // 阻止事件冒泡，防止触发外层的goToDetails事件
  if (event) {
    event.stopPropagation();
  }
  currentItemIndex.value = index;
  showDialog.value = true;
};

const openFinished = (index, event) => {
  // 阻止事件冒泡，防止触发外层的goToDetails事件
  if (event) {
    event.stopPropagation();
  }
  // 由于已完成目标使用finishList，需要找到对应在原backlogList中的索引
  const finishedItem = finishList.value[index];
  const originalIndex = backlogList.value.findIndex(
    (item) => item.id === finishedItem.id
  );
  currentItemIndex.value = originalIndex;
  showDialog.value = true;
};

// 处理时间更新
const handleTimeUpdate = (newTimeData) => {
  if (backlogList.value[currentItemIndex.value]) {
    backlogList.value[currentItemIndex.value].startDate = newTimeData.startDate;
    backlogList.value[currentItemIndex.value].endDate = newTimeData.endDate;
  }
  console.log("时间数据已更新:", newTimeData);
};

// 处理刷新数据
const handleRefresh = () => {
  fetchGoalsList();
};

// 进度条
// 进度条字体的动态css计算
const getProgressClass = (item) => {
  const percentage = percentageNum(item.actualHours, item.estimatedHours);
  return percentage > 50 ? "overText" : "lessText";
};
// 进度条的动态颜色
const getProgressStyle = (item) => {
  const percentage = percentageNum(item.actualHours, item.estimatedHours);
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
//跳转
const goToAddTarget = () => {
  router.push({ name: "addTarget" });
};

// 跳转到详情页面
const goToDetails = (item) => {
  router.push({
    name: "targetDetails",
    query: {
      id: item.id, // 改为id
      title: item.title,
      estimatedHours: item.estimatedHours,
      actualHours: item.actualHours,
      startDate: item.startDate,
      endDate: item.endDate,
    },
  });
};

// 日期选择器相关函数
// 动态计算最大日期：当前结束日期加一年
const maxDate = computed(() => {
  if (currentEnd.value && currentEnd.value.length === 3) {
    const [year, month, day] = currentEnd.value.map(Number);

    // 验证日期值的有效性
    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      year < 1900 ||
      year > 2100 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      const defaultMax = new Date();
      defaultMax.setFullYear(defaultMax.getFullYear() + 1);
      return defaultMax;
    }

    const endDate = new Date(year, month - 1, day);
    // 检查创建的日期是否有效
    if (isNaN(endDate.getTime())) {
      const defaultMax = new Date();
      defaultMax.setFullYear(defaultMax.getFullYear() + 1);
      return defaultMax;
    }

    const maxEndDate = new Date(endDate);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
    return maxEndDate;
  }
  // 默认值：当前日期加一年
  const defaultMax = new Date();
  defaultMax.setFullYear(defaultMax.getFullYear() + 1);
  return defaultMax;
});

// 将数组格式转换为Date对象
const arrayToDate = (dateArray) => {
  if (!dateArray || dateArray.length !== 3) return new Date();
  const [year, month, day] = dateArray.map(Number);

  // 验证日期值的有效性
  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return new Date();
  }

  const date = new Date(year, month - 1, day);
  // 检查创建的日期是否有效
  if (isNaN(date.getTime())) {
    return new Date();
  }

  return date;
};

// 日期格式化函数 - 将Date对象转换为字符串
const formatDate = (date) => {
  if (!date) return "";

  // 确保date是Date对象
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (Array.isArray(date) && date.length === 3) {
    // 如果是数组格式，转换为Date对象
    const [year, month, day] = date.map(Number);
    dateObj = new Date(year, month - 1, day);
  } else if (typeof date === "string") {
    // 如果是字符串，解析为Date对象
    dateObj = new Date(date);
  } else {
    return "";
  }

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 将日期字符串转换为数组格式 [年, 月, 日]
const dateStringToArray = (dateString) => {
  if (!dateString) {
    const now = new Date();
    return [
      now.getFullYear().toString(),
      (now.getMonth() + 1).toString().padStart(2, "0"),
      now.getDate().toString().padStart(2, "0"),
    ];
  }

  // 如果传入的是Date对象，先转换为字符串
  let dateStr = dateString;
  if (dateString instanceof Date) {
    const year = dateString.getFullYear();
    const month = dateString.getMonth() + 1;
    const day = dateString.getDate();
    dateStr = `${year}-${month}-${day}`;
  }

  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) {
    const now = new Date();
    return [
      now.getFullYear().toString(),
      (now.getMonth() + 1).toString().padStart(2, "0"),
      now.getDate().toString().padStart(2, "0"),
    ];
  }

  return [year, month.padStart(2, "0"), day.padStart(2, "0")];
};

// // 日期格式化函数，用于在选择器中显示中文单位
// const dateFormatter = (type, value) => {
//   if (type === 'year') {
//     return `${value}年`;
//   }
//   if (type === 'month') {
//     return `${parseInt(value)}月`;
//   }
//   if (type === 'day') {
//     return `${parseInt(value)}日`;
//   }
//   return value;
// };

// 处理显示日期选择器
const handleShowDatePicker = (timeData) => {
  console.log("handleShowDatePicker 接收到的 timeData:", timeData);
  console.log("当前项目索引:", currentItemIndex.value);

  // 如果没有传入timeData，使用当前选中项目的时间数据
  const currentItem = backlogList.value[currentItemIndex.value];
  const currentTimeData =
    timeData ||
    (currentItem
      ? { startDate: currentItem.startDate, endDate: currentItem.endDate }
      : null);

  console.log("使用的时间数据:", currentTimeData);

  if (currentTimeData && currentTimeData.startDate) {
    currentStart.value = dateStringToArray(currentTimeData.startDate);
    console.log("设置 currentStart:", currentStart.value);
  }
  if (currentTimeData && currentTimeData.endDate) {
    currentEnd.value = dateStringToArray(currentTimeData.endDate);
    console.log("设置 currentEnd:", currentEnd.value);
  }

  showDatePicker.value = true;
};

// 处理日期选择确认
const handleEndConfirm = (date) => {
  console.log("handleEndConfirm 接收到的 date 参数:", date);
  console.log("当前 currentEnd 值:", currentEnd.value);

  // 确保date是Date对象
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (Array.isArray(date) && date.length === 3) {
    const [year, month, day] = date.map(Number);
    dateObj = new Date(year, month - 1, day);
  } else {
    // 如果date参数无效，使用currentEnd的值
    const [year, month, day] = currentEnd.value.map(Number);
    dateObj = new Date(year, month - 1, day);
  }

  console.log("处理后的 dateObj:", dateObj);

  const formattedDate = formatDate(dateObj);
  currentEnd.value = [
    dateObj.getFullYear().toString(),
    (dateObj.getMonth() + 1).toString().padStart(2, "0"),
    dateObj.getDate().toString().padStart(2, "0"),
  ];

  // 更新当前项目的结束时间
  if (backlogList.value[currentItemIndex.value]) {
    const oldEndDate = backlogList.value[currentItemIndex.value].endDate;

    backlogList.value[currentItemIndex.value].endDate = formattedDate;

    console.log(`项目 ${currentItemIndex.value} 的结束时间已更新:`, {
      旧时间: oldEndDate,
      新时间: formattedDate,
      选择的日期对象: dateObj,
      currentEnd值: currentEnd.value,
      更新后的完整数据: backlogList.value[currentItemIndex.value],
    });

    // 手动触发timeUpdate事件，确保子组件能收到更新
    const newTimeData = {
      startDate: backlogList.value[currentItemIndex.value].startDate,
      endDate: formattedDate,
    };
    handleTimeUpdate(newTimeData);
  }

  showDatePicker.value = false;
};

// 处理取消选择
const handleDateCancel = () => {
  showDatePicker.value = false;
};
</script>

<style lang="less" scoped>
.transparent-bubble {
  --van-floating-bubble-initial-gap: 0px;
  --van-floating-bubble-size: 0px;
  --van-floating-bubble-initial-gap: 0px;
  gap: var(--van-floating-bubble-initial-gap);

  width: var(--van-floating-bubble-size);
  height: var(--van-floating-bubble-size);
}
.index {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  padding-bottom: 84px;
  /* 导航栏基础高度 */
  margin-bottom: -28px;
  /* 让内容向上移动 28px，适应凸起部分 */

  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);

  .top,
  .tabber {
    // position: fixed;
    z-index: 100;
  }

  .backlog,
  .finished {
    width: 100%;
    // 移除固定高度，让内容自然流动
    // height: 345px;
    // 345/667
    // height: 51.724%;

    .title {
      z-index: 1;
      width: 345px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0px auto 0 auto;

      position: relative;

      .titleFirst {
        display: flex;
        // justify-content: space-between;
        align-items: center;
        width: 120px;
        .smallbox {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(
            90deg,
            #fde047 0%,
            rgba(253, 224, 71, 0) 100%
          );

          display: flex;
          align-items: center;
          justify-content: center;
        }
        .smallbox2 {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(
            90deg,
            #90cc85 0%,
            rgba(144, 204, 133, 0) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .titleText1 {
          font-family: "Alibaba PuHuiTi 3";
          font-size: 15px;
          font-weight: bold;
          line-height: 24px;
          color: #606060;
          margin-left: 9px;
        }
      }

      .people {
        position: absolute;
        top: 8px;
        right: 75px;
        z-index: 1;
      }

      .addBut {
        width: 71px;
        height: 25px;
        border-radius: 13px;
        background: #47bbfc;
        position: relative;

        .titleText2 {
          width: 56px;
          height: 18px;
          font-family: "Alibaba PuHuiTi 3.0";
          font-size: 10px;
          font-weight: 600;
          line-height: normal;
          letter-spacing: normal;
          color: #ffffff;
          margin-top: 5px;
          margin-left: 25px;
        }

        .button {
          object-fit: cover;
          position: absolute;
          top: -5px;
          left: -15px;
        }
      }

      .bubble {
        width: 120px;
        height: 19px;
        border-radius: 9px;
        background: #ffffff;
        text-align: center;
        position: absolute;
        left: 173px;
        top: 0px;

        display: flex;
        justify-content: center;
        align-items: center;

        .titleText3 {
          margin: 0 auto;
          color: #289bf7;
          font-family: "DingTalk JinBuTi";
          font-size: 10px;
          font-weight: normal;
          line-height: normal;
        }

        .triangle {
          position: absolute;
          bottom: -2.11px;
          right: -1.23px;
        }
      }

      .people2 {
        position: absolute;
        top: -42px;
        right: -35px;
      }
    }

    .move {
      margin-top: 19.1px;
    }

    .contentOut {
      width: 345px;
      // height: 312px;
      // height: 90.434%;
      margin: 0px auto 0 auto;

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
        overflow-y: auto;
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
          height: 80px;
          margin-top: 17px;
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

              .firstLeftSmall {
                margin-left: 9px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: flex-start;
                margin:0px;

                .itemText1 {
                  font-family: "Alibaba PuHuiTi 3.0";
                  font-size: 12px;
                  font-weight: 500;
                  line-height: 24px;
                  letter-spacing: 0px;
                  color: #505050;
                  margin:0px;
                }

                .itemText2 {
                  font-family: " Alibaba PuHuiTi 3.0";
                  font-size: 10px;
                  font-weight: normal;
                  line-height: 16px;
                  letter-spacing: 0px;
                  color: #6b7280;
                  margin:0px;
                }
              }
            }

            .text {
              margin-top: 4px;
              margin-right: 14px;
              font-family: "Alibaba PuHuiTi 3.0";
              font-size: 10px;
              font-weight: normal;
              line-height: 16px;
              color: #3b82f6;
            }
          }

          .progressBar {
            width: 100%;

            display: flex;
            align-items: center;

            font-family: "Alibaba PuHuiTi 3.0";
            font-size: 10px;
            font-weight: normal;
            line-height: 16px;
            letter-spacing: 0px;

            .progress {
              width: 256px;
              height: 8px;
              border-radius: 2px;
              margin-right: 8px;
              margin-left: 13px;
            }

            .overText {
              color: #51d1a7;
            }

            .lessText {
              color: #f17878;
            }
          }
        }

        .item:last-child {
          margin-bottom: 13px;
        }
      }
    }
  }
}

.index.masked::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 20;
  /* 确保在父组件内容之上 */
  pointer-events: auto;
  /* 允许点击 */
}

.datePicker {
  position: fixed;
  bottom: 0px;
  left: 0px;
  width: 100%;
  z-index: 1000;

  color: #1d2129;

  font-family: "Source Han Sans";
  font-size: 16px;
  font-weight: 350;
  line-height: 22.4px;
  text-align: center;
  letter-spacing: 0px;

  // 自定义确认按钮样式
  :deep(.van-picker__confirm) {
    color: #3f4d64 !important;
    font-size: 15px !important;
  }
}

// 已完成目标空状态样式
.empty-state-finished {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .empty-encourage {
    font-size: 14px;
    color: #999;
    line-height: 1.4;
    max-width: 280px;
  }
  // 自定义取消按钮样式
  :deep(.van-picker__cancel) {
    color: #86909c !important;
    font-size: 15px !important;
  }
}
</style>
