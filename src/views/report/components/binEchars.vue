<template>
    <div>
        <div class="tu" ref="timeCost"></div>
    </div>
</template>

<script setup>
import { ref, onMounted,nextTick,onUnmounted, computed, watch } from 'vue';
import * as echarts from "echarts";

// 接收父组件传递的数据
const props = defineProps({
  data: {
    type: Array,
    default: () => [
      { name: '概率占比', value: 34 },
      { name: '函数占比', value: 22 },
      { name: '立体几何占比', value: 20 },
      { name: '二项式占比', value: 14 },
      { name: '数列占比', value: 10 }
    ]
  }
});

const timeCost = ref(null);
const timeChart = ref(null);

// 使用计算属性处理数据格式
const timeCostData = computed(() => {
  return props.data.map(item => ({
    name: item.name.includes('占比') ? item.name : item.name + '占比',
    value: item.value
  }));
});
const initChart = () => { 
      if (!timeCost.value ) {
    console.warn("One or more chart containers are not available");
    return;
  }
  try {
    if (timeCost.value) {
      // 初始化时间图表
      timeChart.value = echarts.init(timeCost.value);
    timeChart.value.setOption(timeCostOption);

    // / 添加窗口大小变化监听
      window.addEventListener('resize', handleResize);
    }
    } catch (error) {
    console.error("Chart initialization failed:", error);
    // 可以选择性地处理错误，比如重试或显示错误信息
  }

};

// 处理窗口大小变化
const handleResize = () => {
  if (timeChart.value) {
    timeChart.value.resize();
  }
};
const timeCostOption ={
     tooltip: {
    trigger: 'item'
  },
  series: [
    {
      name: 'Math Topics Distribution',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      padAngle: 5,
      itemStyle: {
        borderRadius: 10,
        color: function(params) {
          // Custom color list
          var colorList = ['#FFFFFF', '#91D4FF', '#67C4FF', '#32B0FF', '#009CFF'];
          return colorList[params.dataIndex];
        }
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: function(params) {
            // 根据数据值计算字体大小（基础大小 + 比例调整）
            const baseSize = 20; // 基础大小
            const maxValue = 34; // 最大值
            const scale = params.data.value / maxValue; // 比例
            return baseSize + (scale * 10); // 动态调整范围
          },
          fontWeight: 'bold',
          formatter: function(params) {
            // 显示名称和百分比
            return `{name|${params.name.replace('占比', '')}}\n{percent|${params.percent}%}`;
          },
          rich: {
            name: {
              fontSize: 14,
              color: '#333',
              padding: [0, 0, 5, 0]
            },
            percent: {
              fontSize: 16,
              fontWeight: 'bold',
              color: '#009CFF'
            }
          }
        }
      },
      labelLine: {
        show: false
      },
      data: timeCostData.value
    }
  ]
};
// 监听数据变化，更新图表
watch(timeCostData, (newData) => {
  if (timeChart.value && newData) {
    timeChart.value.setOption({
      series: [{
        data: newData
      }]
    });
  }
}, { deep: true });

onMounted(() => {
  console.log("DOM 已挂载，检查 ref 是否存在：", {
    timeCost: timeCost.value
  });
  nextTick(() => {
    initChart();
  });
});
// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (timeChart.value) {
    timeChart.value.dispose();
  }
});
</script>

<style lang="less" scoped>
.tu{
width: 171.31px;
height: 172.64px;
}
</style>