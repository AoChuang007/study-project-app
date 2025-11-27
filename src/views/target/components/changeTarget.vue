<template>
  <div class="box" v-if="visible">
    <img
      src="@/assets/target/closeBut.png"
      alt=""
      class="close"
      @click="close"
    />
    <div class="introduce">
      <img src="@/assets/target/peopleSmall.png" alt="" class="peopleSmall" />
      <p class="introduceText">来试试修改你的目标吧！</p>
    </div>

    <div class="changeContent">
      <div v-if="targetList.length === 0" class="empty-state">
        <p class="empty-text">暂未存在子目标</p>
      </div>
      <div v-else class="item" v-for="(item, index) in targetList" :key="index">
        <P class="title">{{ item.title }}</P>
        <div class="smallBox">
          <input type="number" v-model="item.estimatedHours" class="number" />
          <p>时</p>
        </div>
      </div>
    </div>

    <div class="changeTime">
      <div class="startTime">
        <div class="first">
          <img src="@/assets/target/startIcon.png" alt="" />
          <p>开始时间</p>
        </div>
        <div class="second">
          <p>{{ timeList.startDate }}</p>
        </div>
      </div>
      <div class="line"></div>
      <div class="endTime">
        <div class="first">
          <img src="@/assets/target/endIcon.png" alt="" />
          <p>结束时间</p>
        </div>
        <div class="second" @click="handleEndTimeClick">
          <p>{{ timeList.endDate }}</p>
        </div>
      </div>
    </div>

    <!-- <van-date-picker
  v-model="currentDate"
  title="选择日期"
  :min-date="minDate"
  :max-date="maxDate"
  v-show="changeEnd"
  class="datePicker"
/> -->

    <div class="button-group">
      <div class="saveBut" @click="save">
        <p>保存</p>
      </div>
      <div class="deleteBut" @click="deleteTarget">
        <p>删除</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, ref, watch, onMounted } from "vue";
import { getSubGoalsByGoalId, updateSubGoalHours, updateGoalEndDate, deleteGoal } from '../api/index.js';
import { showToast } from 'vant';
//  const currentDate = ref(['2021', '01', '01']);
// const minDate=new Date(2020, 0, 1);

// 定义接收的 props
const props = defineProps({
  targetListDate: {
    type: Array,
    default: () => [],
  },
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
  visible: {
    type: Boolean,
    required: true,
  },
  parentGoal: {
    type: Object,
    default: () => ({}),
  },
});
// // 设置最小日期为当前日期
// const minDate = new Date();
// // 设置最大日期为一年后的今天
// const maxDate = new Date();
// maxDate.setFullYear(maxDate.getFullYear() + 1);
const handleEndTimeClick = () => {
  emit("show-date-picker", timeList.value);
};

// 日期格式化函数 - 将Date对象转换为字符串
// const formatDate = (date) => {
//   if (!date) return '';

//   // 确保date是Date对象
//   let dateObj;
//   if (date instanceof Date) {
//     dateObj = date;
//   } else if (Array.isArray(date) && date.length === 3) {
//     // 如果是数组格式，转换为Date对象
//     const [year, month, day] = date.map(Number);
//     dateObj = new Date(year, month - 1, day);
//   } else if (typeof date === 'string') {
//     // 如果是字符串，解析为Date对象
//     dateObj = new Date(date);
//   } else {
//     return '';
//   }

//   const year = dateObj.getFullYear();
//   const month = dateObj.getMonth() + 1;
//   const day = dateObj.getDate();
//   return `${year}-${month}-${day}`;
// };
const emit = defineEmits(["close", "update:timeData", "show-date-picker", "refresh"]);

// 存储真实的子目标数据
const realSubGoals = ref([]);
const loading = ref(false);

const defaultTime = {
  startDate: "2025-05-10",
  endDate: "2025-06-12",
};

// 获取子目标数据的函数
const fetchSubGoals = async () => {
  if (!props.parentGoal?.id) return;
  
  try {
    loading.value = true;
    const response = await getSubGoalsByGoalId(props.parentGoal.id);
    if (response.code === 200 && response.data) {
      realSubGoals.value = response.data;
    }
  } catch (error) {
    console.error('获取子目标失败:', error);
    showToast('获取子目标失败');
  } finally {
    loading.value = false;
  }
};

// 修复：正确判断对象是否有数据
const targetList = computed(() => {
  // 优先使用真实的子目标数据
  if (realSubGoals.value.length > 0) {
    return realSubGoals.value;
  }
  // 其次使用传入的数据
  if (props.targetListDate.length > 0) {
    return props.targetListDate;
  }
  // 没有子目标时返回空数组
  return [];
});
// 创建本地响应式时间数据
const localTimeList = ref({
  startDate: "",
  endDate: "",
});

// 监听 props 变化，更新本地数据
watch(
  () => [props.startDate, props.endDate],
  ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate) {
      localTimeList.value = { startDate: newStartDate, endDate: newEndDate };
    } else {
      localTimeList.value = { ...defaultTime };
    }
  },
  { immediate: true }
);

// 监听父目标变化，获取子目标数据
watch(
  () => props.parentGoal,
  (newParentGoal) => {
    if (newParentGoal?.id) {
      fetchSubGoals();
    }
  },
  { immediate: true }
);

// 组件挂载时获取数据
onMounted(() => {
  if (props.parentGoal?.id) {
    fetchSubGoals();
  }
});

const timeList = computed(() => {
  return localTimeList.value;
});

const close = () => {
  console.log("点击了关闭按钮");
  emit("close");
};
const save = async () => {
  try {
    loading.value = true;
    
    // 更新子目标的预计时间
    const updatePromises = [];
    
    for (const subGoal of targetList.value) {
      if (subGoal.id && subGoal.estimatedHours !== undefined) {
        const updateParams = {
          id: subGoal.id,
          hours: subGoal.estimatedHours
        };
        updatePromises.push(updateSubGoalHours(updateParams));
      }
    }
    
    // 更新父目标的结束时间
    if (props.parentGoal?.id && timeList.value.endDate) {
      const endDateParams = {
        id: props.parentGoal.id,
        endDate: timeList.value.endDate
      };
      updatePromises.push(updateGoalEndDate(endDateParams));
    }
    
    // 等待所有更新完成
    await Promise.all(updatePromises);
    
    showToast('保存成功');
    emit("close");
    
  } catch (error) {
    console.error('保存失败:', error);
    showToast('保存失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 删除目标
const deleteTarget = async () => {
  if (!props.parentGoal?.id) {
    showToast('目标信息不完整');
    return;
  }
  
  try {
    loading.value = true;
    
    const response = await deleteGoal(props.parentGoal.id);
    
    if (response.code === 200) {
      showToast('删除成功');
      emit("close");
      // 可以触发父组件刷新数据
      emit("refresh");
    } else {
      showToast('删除失败');
    }
    
  } catch (error) {
    console.error('删除失败:', error);
    showToast('删除失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="less" scoped>
.box {
  width: 355px;
  height: 405px;
  border-radius: 20px 100px 15px 15px;
  background: #eef9fd;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  .close {
    position: absolute;
    top: 0px;
    right: 5.03px;
  }
  .introduce {
    width: 199px;
    height: 32px;
    border-radius: 25px;
    background: #e0ecf0;

    box-shadow: 4px 2px 10px 0px rgba(39, 99, 121, 0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-top: 31px;
    margin-left: 69px;
    margin-bottom: 35px;
    .introduceText {
      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 11px;
      font-weight: normal;
      line-height: normal;
      letter-spacing: 0em;
      color: #3d3d3d;

      margin-right: 15px;
    }
    .peopleSmall {
      margin-left: 23px;
    }
  }
  .changeContent {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 34px;
    overflow-y: auto;
    padding: 5px 0;
    .item {
      background: #ffffff;
      width: 303px;
      height: 34px;
      border-radius: 12px;
      margin-bottom: 15px;

      display: flex;
      justify-content: space-between;
      align-items: center;

      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 13px;
      font-weight: normal;
      line-height: 16px;
      letter-spacing: 0px;
      color: #3d3d3d;
      .smallBox {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right:11px;
      }
      .title {
        margin-left: 13px;
      }
      .number {
        width: 83px;
        height: 21px;
        border: 1px solid transparent;
        text-align: center;
        border-radius: 5px;
        background: #f0f0f0;

        display: flex;
        justify-content: center;
        align-items: center;

        margin-right: 6px;
      }
    }
  }
  .changeTime {
    width: 303px;
    height: 96px;
    border-radius: 12px;
    background: #ffffff;

    margin: 6px auto 0px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .startTime,
    .endTime {
      width: 303px;
      height: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .first {
        display: flex;
        align-items: center;
        width: 90px;

        font-family: "Alibaba PuHuiTi 3.0";
        font-size: 14px;
        font-weight: normal;
        line-height: normal;
        letter-spacing: 0em;
        color: #3d3d3d;

        margin-left: 7.7px;
        img {
          width: 18px;
          height: 18px;

          margin-right: 4px;
        }
      }
      .second {
        background: #f0f0f0;
        width: 110px;
        height: 25px;
        border-radius: 5px;
        margin-right: 7px;

        display: flex;
        justify-content: center;
        align-items: center;

        font-family: "Alibaba PuHuiTi 3.0";
        font-size: 13px;
        font-weight: normal;
        line-height: 16px;
        letter-spacing: 0px;
        color: #676767;
      }
    }
    .line {
      border-top: 1px solid #d8d8d8;
      width: 303px;
      height: 0px;
    }
  }
  
  .saveBut, .deleteBut {
    width: 72px;
    height: 28px;
    border-radius: 21px;
    background: #ffffff;
    border: 1px solid rgba(111, 216, 255, 0.59);

    box-shadow: 2px 2px 4px 0px rgba(9, 133, 245, 0.25);

    display: flex;
    align-items: center;
    justify-content: center;

    font-family: Roboto;
    font-size: 16px;
    font-weight: 500;
    line-height: 16px;
    text-align: center;
    cursor: pointer;
  }
  
  .saveBut {
    color: #67abe8;
  }
  
  .deleteBut {
    color: #ff6b6b;
    border: 1px solid rgba(255, 107, 107, 0.59);
  }
  
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    
    .empty-text {
      color: #999;
      font-size: 14px;
      font-family: "Alibaba PuHuiTi 3.0";
    }
  }
  
  .button-group {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 18px auto 0px;
  }
}
</style>