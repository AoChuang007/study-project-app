<template>
  <div class="behaviorAnalysis">
    <div class="title">
      <img src="@/assets/studyLook/behaviorIcon.png" alt="" />
      <p class="BText">学习行为分析</p>
    </div>
    <div class="contentout">
      <div class="eSpace"></div>
      <div class="contentIn">
        <!-- 切换按钮 -->
        <div class="choseTime">
          <div class="choseTimeText">
            <div class="chosedDate">
              <p class="text">专注时长对比</p>
            </div>
          </div>
        </div>
        <div class="line"></div>
        <div class="bottonbox1">
          <div class="dayBox" v-show="chosedDate === 'time'">
          <!-- <div class="dayBox"> -->
            <div class="tu" ref="timeChartRef"></div>
            <div class="right">
              <div class="rightBox">
                <div class="first">
                  <p class="nomal">你的专注时长：</p>
                  <p class="nomal">
                    <span class="specialText">{{
                      timeComparison.yourAvrage
                    }}</span
                    >小时/天
                  </p>
                </div>
                <div class="second">
                  <p class="nomal">群体平均：</p>
                  <p class="nomal">
                    <span class="specialText">{{ timeComparison.avrage }}</span>
                    小时/天
                  </p>
                </div>
                <div class="third">
                  <p class="nomal">对比结果：‌</p>
                  <p class="nomal">
                    超过<span class="specialText">{{
                      timeComparison.over
                    }}</span
                    >用户‌
                  </p>
                </div>
              </div>
            </div>
          </div>
          <!-- 互动行为对比图表 - 暂时注释掉 -->
          <!-- <div class="dayBox" v-show="chosedDate === 'behavior'">
            <div class="tu" ref="behaviorChartRef"></div>
            <div class="right">
              <div class="rightBox">
                <div class="first">
                  <p class="nomal">你的互动时长：</p>
                  <p class="nomal">
                    <span class="specialText">{{
                      behaviorComparison.yourAvrage
                    }}</span
                    >小时/天
                  </p>
                </div>
                <div class="second">
                  <p class="nomal">群体平均：</p>
                  <p class="nomal">
                    <span class="specialText">{{
                      behaviorComparison.avrage
                    }}</span>
                    小时/天
                  </p>
                </div>
                <div class="third">
                  <p class="nomal">对比结果：‌</p>
                  <p class="nomal">
                    超过<span class="specialText">{{
                      behaviorComparison.over
                    }}</span
                    >用户‌
                  </p>
                </div>
              </div>
            </div>
          </div> -->
          <!-- 多行为综合对比图表 - 暂时注释掉 -->
          <!-- <div class="dayBox" v-show="chosedDate === 'comprehensive'">
            <div class="tu" ref="compreChartRef"></div>
            <div class="right">
              <div class="rightBox">
              <div class="first">
                  <p class="nomal">你的行为时长：</p>
                  <p class="nomal">
                    <span class="specialText">{{
                      compreComparison.yourAvrage
                    }}</span
                    >小时/天
                  </p>
                </div>
                <div class="second">
                  <p class="nomal">群体平均：</p>
                  <p class="nomal">
                    <span class="specialText">{{
                      compreComparison.avrage
                    }}</span>
                    小时/天
                  </p>
                </div>
                <div class="third">
                  <p class="nomal">对比结果：‌</p>
                  <p class="nomal">
                    超过<span class="specialText">{{
                      compreComparison.over
                    }}</span
                    >用户‌
                  </p>
                </div>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, onBeforeUnmount, computed } from "vue";
import * as echarts from "echarts";
import showIcon from "@/assets/studyLook/showIcon.png";

// 接收父组件传递的数据
const props = defineProps({
  personData: {
    type: Array,
    default: () => []
  },
  crowdData: {
    type: Array,
    default: () => []
  }
});

// 添加beforeUnmount钩子，确保在组件卸载前彻底清理
onBeforeUnmount(() => {
  console.log("组件即将卸载，执行预清理");
  
  // 预清理时间图表
  if (timeChart.value) {
    try {
      if (!timeChart.value.isDisposed()) {
        timeChart.value.dispose();
      }
    } catch (error) {
      console.warn("预清理时间图表时出错:", error);
    }
    timeChart.value = null;
  }
  
  // 预清理DOM上的实例
  if (timeChartRef.value) {
    try {
      const existingInstance = echarts.getInstanceByDom(timeChartRef.value);
      if (existingInstance) {
        console.log("beforeUnmount: 清理DOM上的实例");
        existingInstance.dispose();
      }
    } catch (error) {
      console.warn("预清理DOM实例时出错:", error);
    }
  }
});
console.log("props.personData", props.personData);
// 查看效率曲线选择的不同频率 - 暂时注释掉
const chosedDate = ref("time");
// const data = ref([
//   { data: "专注时长对比", value: "time" },
//   { data: "互动行为对比", value: "behavior" },
//   { data: "多行为综合对比", value: "comprehensive" },
// ]);
// const handClick = (value) => {
//   chosedDate.value = value;
// };

// 计算平均值的函数
const calculateAverage = (data) => {
  if (!data || data.length === 0) return "0.0";
  const sum = data.reduce((acc, val) => acc + val, 0);
  const average = sum / data.length;
  return average.toFixed(1);
};

const timeComparison = computed(() => ({
  yourAvrage: calculateAverage(props.personData),
  avrage: calculateAverage(props.crowdData),
  over: "75%",
}));

// 其他图表的计算属性 - 暂时注释掉
// const compreComparison = computed(() => ({
//   yourAvrage: calculateAverage(props.personData),
//   avrage: calculateAverage(props.crowdData),
//   over: "75%",
// }));
// const behaviorComparison = computed(() => ({
//   yourAvrage: calculateAverage(props.personData),
//   avrage: calculateAverage(props.crowdData),
//   over: "75%",
// }));

const timeChartRef = ref(null);
// const behaviorChartRef = ref(null);
// const compreChartRef = ref(null);
const timeChart = ref(null);
// const behaviorChart = ref(null);
// const compreChart = ref(null);
// 专注时长对比的图
const timeOption = {
  grid: {
    // 新增关键配置
    top: 15,
    right: 0,
    bottom: 30,
    left: 10,
    containLabel: true, // 确保坐标轴标签显示完整
  },

  // 提示框配置
  tooltip: {
    trigger: "axis", // 触发类型：坐标轴触发
    axisPointer: {
      type: "shadow", // 阴影指示器
    },
    // 提示框文字样式
    textStyle: {
      fontFamily: "思源黑体",
      fontSize: 8,
      color: "#333333",
    },
  },
  legend: {
    bottom: 0,
    textStyle: {
      fontFamily: "思源黑体",
      fontSize: 8,
      color: "#333333",
    },
    data: [
      {
        name: "你的专注时长",
        // 使用图片作为图标
        icon: "image://" + showIcon, // 替换为实际图片URL
        itemStyle: {
          opacity: 1, // 隐藏默认颜色方块
        },
      },
      {
        name: "群体平均",
        
      },
    ],
  },
  // 新增：自定义图例图标

  xAxis: {
    type: "category",
    axisTick: { show: true },
    axisLabel: {
      // 轴标签样式
      show: true, // 确保显示所有标签
      fontFamily: "思源黑体",
      fontSize: 8,
      color: "#6E7079",
      interval: 0, // 强制显示所有标签
    },
    data: ["周一", "周二", "周三", "周四", "周五", "周六", "周天"],
  },
  yAxis: {
    type: "value",
    splitLine: { show: false },
    min: 0,
    max: 4,
    interval: 1,
    axisLabel: {
      // 轴标签样式
      show: true, // 确保显示所有标签
      fontFamily: "思源黑体",
      fontSize: 8,
      color: "#6E7079",
      interval: "auto", // 自动间隔
    },
  },
  series: [
    
    {
      name: "你的专注时长",
      type: "bar",
      barGap: 0,

      emphasis: {
        focus: "series",
      },
      itemStyle: {
        color: function (params) {
          return params.value > 3 && params.value <= 4
            ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#FDEB86" },
                { offset: 0.53, color: "#7DBEFF" },
                { offset: 0.73, color: "#FFFFFF" },
              ])
            : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0.1, color: "#7DBEFF" },
                { offset: 1, color: "#FFFFFF" },
              ]);
        },
      },
      // data: props.personData.length > 0 ? props.personData : [4, 3, 4, 4, 4, 3, 3],
      data: props.personData,
    },
    {
      name: "群体平均",
      type: "bar",
      emphasis: {
        focus: "series",
      },
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0.05, color: "#FFFFFF" },
          { offset: 0.98, color: "#EAEAEA" },
        ]),
      },
      // data: props.crowdData.length > 0 ? props.crowdData : [2.8, 3.1, 2.5, 2.9, 3.0, 2.7, 3],
data: props.crowdData,
    },
  ],
};

// 其他图表配置 - 暂时注释掉
// const compreOption = {
//   grid: {
//     top: 15,
//     right: 0,
//     bottom: 30,
//     left: 10,
//     containLabel: true,
//   },
//   tooltip: {
//     trigger: "axis",
//     axisPointer: {
//       type: "shadow",
//     },
//     textStyle: {
//       fontFamily: "思源黑体",
//       fontSize: 8,
//       color: "#333333",
//     },
//   },
//   legend: {
//     bottom: 0,
//     textStyle: {
//       fontFamily: "思源黑体",
//       fontSize: 8,
//       color: "#333333",
//     },
//     data: [
//       {
//         name: "你的行为时长",
//         icon: "image://" + showIcon,
//         itemStyle: {
//           opacity: 1,
//         },
//       },
//       {
//         name: "群体平均",
//       },
//     ],
//   },
//   xAxis: {
//     type: "category",
//     axisTick: { show: true },
//     axisLabel: {
//       show: true,
//       fontFamily: " Alibaba PuHuiTi 3.0",
//       fontWeight: 400,
//       fontSize: 7,
//       color: "#6E7079",
//       interval: 0,
//     },
//     data: [
//       "专注时长",
//       "互动次数",
//       "练习量",
//       "查询数",
//       "作业提交",
//       "错题订正",
//       "阅读时长",
//     ],
//   },
//   yAxis: {
//     type: "value",
//     splitLine: { show: false },
//     min: 0,
//     max: 4,
//     interval: 1,
//     axisLabel: {
//       show: true,
//       fontFamily: "思源黑体",
//       fontSize: 8,
//       color: "#6E7079",
//       interval: "auto",
//     },
//   },
//   series: [
//     {
//       name: "你的行为时长",
//       type: "bar",
//       barGap: 0,
//       emphasis: {
//         focus: "series",
//       },
//       itemStyle: {
//         color: function (params) {
//           return params.value > 3 && params.value <= 4
//             ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                 { offset: 0, color: "#FDEB86" },
//                 { offset: 0.53, color: "#7DBEFF" },
//                 { offset: 0.73, color: "#FFFFFF" },
//               ])
//             : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                 { offset: 0.1, color: "#7DBEFF" },
//                 { offset: 1, color: "#FFFFFF" },
//               ]);
//         },
//       },
//       data: props.personData.length > 0 ? props.personData : [4, 3, 3, 3.5, 4, 2, 3],
//     },
//     {
//       name: "群体平均",
//       type: "bar",
//       emphasis: {
//         focus: "series",
//       },
//       itemStyle: {
//         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//           { offset: 0.05, color: "#FFFFFF" },
//           { offset: 0.98, color: "#EAEAEA" },
//         ]),
//       },
//       data: props.crowdData.length > 0 ? props.crowdData : [3, 2, 3, 2.9, 3.0, 3, 3],
//     },
//   ],
// };

// const behaviorOption = {
//   grid: {
//     top: 15,
//     right: 0,
//     bottom: 30,
//     left: 10,
//     containLabel: true,
//   },
//   tooltip: {
//     trigger: "axis",
//     axisPointer: {
//       type: "shadow",
//     },
//     textStyle: {
//       fontFamily: "思源黑体",
//       fontSize: 8,
//       color: "#333333",
//     },
//   },
//   legend: {
//     bottom: 0,
//     textStyle: {
//       fontFamily: "思源黑体",
//       fontSize: 8,
//       color: "#333333",
//     },
//     data: [
//       {
//         name: "你的互动时长",
//         icon: "image://" + showIcon,
//         itemStyle: {
//           opacity: 1,
//         },
//       },
//       {
//         name: "群体平均",
//       },
//     ],
//   },
//   xAxis: {
//     type: "category",
//     axisTick: { show: true },
//     axisLabel: {
//       show: true,
//       fontFamily: " Alibaba PuHuiTi 3.0",
//       fontWeight: 400,
//       fontSize: 7,
//       color: "#6E7079",
//       interval: 0,
//     },
//     data: ["提问", "讨论", "回复", "问答发起", "求助响应", "分享", "答疑时长"],
//   },
//   yAxis: {
//     type: "value",
//     splitLine: { show: false },
//     min: 0,
//     max: 4,
//     interval: 1,
//     axisLabel: {
//       show: true,
//       fontFamily: "思源黑体",
//       fontSize: 8,
//       color: "#6E7079",
//       interval: "auto",
//     },
//   },
//   series: [
//     {
//       name: "你的互动时长",
//       type: "bar",
//       barGap: 0,
//       emphasis: {
//         focus: "series",
//       },
//       itemStyle: {
//         color: function (params) {
//           return params.value > 3 && params.value <= 4
//             ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                 { offset: 0, color: "#FDEB86" },
//                 { offset: 0.53, color: "#7DBEFF" },
//                 { offset: 0.73, color: "#FFFFFF" },
//               ])
//             : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                 { offset: 0.1, color: "#7DBEFF" },
//                 { offset: 1, color: "#FFFFFF" },
//               ]);
//         },
//       },
//       data: props.personData.length > 0 ? props.personData : [4, 3, 3, 4, 2, 3, 3],
//     },
//     {
//       name: "群体平均",
//       type: "bar",
//       emphasis: {
//         focus: "series",
//       },
//       itemStyle: {
//         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//           { offset: 0.05, color: "#FFFFFF" },
//           { offset: 0.98, color: "#EAEAEA" },
//         ]),
//       },
//       data: props.crowdData.length > 0 ? props.crowdData : [3, 3, 2, 3, 3, 2, 3],
//     },
//   ],
// };

// 初始化图表
const initChart = () => {
  console.log("开始初始化图表...");
  
  try {
    if (timeChartRef.value) {
      console.log("正在初始化时间图表...");
      
      // 先彻底清理任何现有实例
      const existingInstance = echarts.getInstanceByDom(timeChartRef.value);
      if (existingInstance) {
        console.log("发现现有DOM实例，正在清理...");
        existingInstance.dispose();
      }
      
      // 清理ref中的实例
      if (timeChart.value) {
        console.log("发现现有ref实例，正在清理...");
        if (!timeChart.value.isDisposed()) {
          timeChart.value.dispose();
        }
        timeChart.value = null;
      }
      
      // 确保DOM元素完全清理后再初始化
      setTimeout(() => {
        // 再次检查确保没有残留实例
        const finalCheck = echarts.getInstanceByDom(timeChartRef.value);
        if (finalCheck) {
          finalCheck.dispose();
        }
        
        // 初始化新的图表实例
        timeChart.value = echarts.init(timeChartRef.value);
        timeChart.value.setOption(timeOption);
        console.log("时间图表初始化成功");
      }, 50);
    }
    
    // 其他图表初始化 - 暂时注释掉
    // if (behaviorChartRef.value) {
    //   console.log("正在初始化行为图表...");
    //   
    //   // 先彻底清理任何现有实例
    //   const existingInstance = echarts.getInstanceByDom(behaviorChartRef.value);
    //   if (existingInstance) {
    //     console.log("发现现有DOM实例，正在清理...");
    //     existingInstance.dispose();
    //   }
    //   
    //   // 清理ref中的实例
    //   if (behaviorChart.value) {
    //     console.log("发现现有ref实例，正在清理...");
    //     if (!behaviorChart.value.isDisposed()) {
    //       behaviorChart.value.dispose();
    //     }
    //     behaviorChart.value = null;
    //   }
    //   
    //   // 确保DOM元素完全清理后再初始化
    //   setTimeout(() => {
    //     const finalCheck = echarts.getInstanceByDom(behaviorChartRef.value);
    //     if (finalCheck) {
    //       finalCheck.dispose();
    //     }
    //     
    //     behaviorChart.value = echarts.init(behaviorChartRef.value);
    //     behaviorChart.value.setOption(behaviorOption);
    //     console.log("行为图表初始化成功");
    //   }, 50);
    // }
    
    // if (compreChartRef.value) {
    //   console.log("正在初始化综合图表...");
    //   
    //   // 先彻底清理任何现有实例
    //   const existingInstance = echarts.getInstanceByDom(compreChartRef.value);
    //   if (existingInstance) {
    //     console.log("发现现有DOM实例，正在清理...");
    //     existingInstance.dispose();
    //   }
    //   
    //   // 清理ref中的实例
    //   if (compreChart.value) {
    //     console.log("发现现有ref实例，正在清理...");
    //     if (!compreChart.value.isDisposed()) {
    //       compreChart.value.dispose();
    //     }
    //     compreChart.value = null;
    //   }
    //   
    //   // 确保DOM元素完全清理后再初始化
    //   setTimeout(() => {
    //     const finalCheck = echarts.getInstanceByDom(compreChartRef.value);
    //     if (finalCheck) {
    //       finalCheck.dispose();
    //     }
    //     
    //     compreChart.value = echarts.init(compreChartRef.value);
    //     compreChart.value.setOption(compreOption);
    //     console.log("综合图表初始化成功");
    //   }, 50);
    // }
    
  } catch (error) {
    console.error("Chart initialization failed:", error);
  }
};



// 监听标签切换 - 暂时注释掉
// watch(chosedDate, (newTab) => {
//   nextTick(() => {
//     switch (newTab) {
//       case "time":
//         if (timeChart.value && !timeChart.value.isDisposed()) {
//           timeChart.value.resize();
//         }
//         break;
//       case "behavior":
//         if (behaviorChart.value && !behaviorChart.value.isDisposed()) {
//           behaviorChart.value.resize();
//         }
//         break;
//       case "comprehensive":
//         if (compreChart.value && !compreChart.value.isDisposed()) {
//           compreChart.value.resize();
//         }
//         break;
//     }
//   });
// });
// 统一的清理函数
const cleanupCharts = () => {
  const charts = [
    { ref: timeChartRef.value, instance: timeChart.value },
    // 可以添加其他图表
  ];
  
  charts.forEach(({ ref, instance }) => {
    if (ref) {
      const domInstance = echarts.getInstanceByDom(ref);
      if (domInstance && !domInstance.isDisposed()) {
        domInstance.dispose();
      }
    }
    
    if (instance && !instance.isDisposed()) {
      instance.dispose();
    }
  });
  
  timeChart.value = null;
};
// 监听props数据变化，重新渲染图表
watch([() => props.personData, () => props.crowdData], () => {
  // 使用防抖避免频繁重绘
  setTimeout(() => {
    if (timeChart.value && !timeChart.value.isDisposed()) {
      timeChart.value.setOption({
        ...timeOption,
        series: [
          {
            ...timeOption.series[0],
            data: props.personData
          },
          {
            ...timeOption.series[1],
            data: props.crowdData
          }
        ]
      });
    }
  }, 100);
}, { deep: true });
onMounted(() => {
  console.log("DOM 已挂载");
  
  // 先清理再初始化
  cleanupCharts();
  
  // 使用 nextTick 确保 DOM 完全渲染
  nextTick(() => {
    initChart();
  });
});

// 组件卸载前清理
onUnmounted(() => {
  console.log("组件即将卸载，清理图表实例");
  
  // 清理时间图表
  if (timeChart.value) {
    if (!timeChart.value.isDisposed()) {
      timeChart.value.dispose();
    }
    timeChart.value = null;
  }
  
  // 额外检查DOM元素上的实例
  if (timeChartRef.value) {
    const existingInstance = echarts.getInstanceByDom(timeChartRef.value);
    if (existingInstance) {
      console.log("onUnmounted: 清理DOM上的残留实例");
      existingInstance.dispose();
    }
  }
  
  // 其他图表清理 - 暂时注释掉
  // if (behaviorChart.value) {
  //   if (!behaviorChart.value.isDisposed()) {
  //     behaviorChart.value.dispose();
  //   }
  //   behaviorChart.value = null;
  // }
  // if (compreChart.value) {
  //   if (!compreChart.value.isDisposed()) {
  //     compreChart.value.dispose();
  //   }
  //   compreChart.value = null;
  // }
});

</script>

<style lang="less" scoped>
.behaviorAnalysis {
  width: 345px;
  height: 243px;
  margin: 18px auto 0px auto;

  .title {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .BText {
      font-family: Source Han Sans;
      font-size: 14px;
      font-weight: 500;
      color: #696969;
      text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.65);
      margin-left: 4px;
    }
  }
  .contentout {
    width: 345px;
    height: 213px;
    border-radius: 4px;
    margin-top: 6px;
    background: linear-gradient(
      180deg,
      #ffffff 33%,
      rgba(255, 255, 255, 0) 100%
    );
    box-shadow: 0px 2px 2px 0px #c5ddf0;
    .eSpace {
      width: 337px;
      height: 4px;
    }
    .contentIn {
      width: 337px;
      height: 209px;
      border-radius: 4px;
      background: linear-gradient(180deg, #b8dfff 0%, #fafdff 100%);

      box-shadow: 0px 2px 2px 0px #c5ddf0;
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
          color: #ebf6ff;
          .moreIcon {
            margin-right: 6.47px;
          }
        }
        .choseTimeText {
          display: flex;
          align-items: center;
          margin-left: 10px;
          margin-top: 2px;
        }
        .chosedDate {
          width: 78px;
          height: 12px;
          border-radius: 8px;
          margin-right: 4px;

          background: #279bf8;

          box-sizing: border-box;
          border: 1px solid #ffffff;
          font-family: "Source Han Sans";
          font-size: 10px;
          font-weight: 500;
          line-height: normal;
          letter-spacing: 0em;
          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;
        }
        .unChosedDate {
          width: 78px;
          height: 12px;
          border-radius: 8px;
          margin-right: 4px;
          background: rgba(255, 255, 255, 0.75);

          color: rgba(39, 155, 248, 0.75);
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
        background: #fff;
        margin: 4px auto 0px auto;
      }
      .dayBox {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        width: 100%;
        height: 163px;
        .tu {
          width: 232px;
          // height: 65.02%;
          height: 168.95px;
          // margin-left: 10px;
        }
        .right {
          display: flex;
          flex-direction: column;
          justify-items: flex-start;
          margin-right: 10px;
          height: 100%;
          .rightBox {
            width: 72px;
            height: 120px;
            border-radius: 8px;
            background: #ffffff;

            box-shadow: inset 0px 1px 1px 0px #d8d8d8;
            margin-top: 23px;

            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: flex-start;
            .first,
            .second,
            .third {
              margin-left: 7px;
            }
            .nomal {
              font-family: 思源黑体;
              font-weight: 400;
              font-size: 8px;
              text-shadow: 0px 1px 1px #cbcbcb;
              color: #696969;
            }
            .specialText {
              font-family: "Source Han Sans";
              font-weight: 700;
              font-size: 10px;
              color: #0985f5;
            }
          }
        }
      }
    }
  }
}
</style>