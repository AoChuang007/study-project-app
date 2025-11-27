<template>
  <div class="out">
    <img src="@/assets/report/targetD/cloud1.png" alt="" class="cloud1" />
    <img src="@/assets/report/targetD/cloud2.png" alt="" class="cloud2" />
    <div ref="wordcloudRef" class="wordcloud"></div>
  </div>
</template>

<script setup>
import WordCloud from "wordcloud";
import { onMounted, ref, computed, defineProps, watch } from "vue";

// 定义props
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const wordcloudRef = ref(null);

onMounted(() => {
  initWordcloud();
});

// 监听数据变化，重新初始化词云
watch(() => props.data, () => {
  if (wordcloudRef.value) {
    // 清空容器
    wordcloudRef.value.innerHTML = '';
    // 重新初始化
    setTimeout(() => {
      initWordcloud();
    }, 100);
  }
}, { deep: true });
const initWordcloud = () => {

     const maskImg = new Image();
  maskImg.src = '../src/assets/report/targetD/cloud1.png'; // 透明背景PNG
      // 确保 WordCloud 库已加载
  if (typeof WordCloud === 'undefined') {
    console.error('WordCloud 库未加载！请检查引入方式');
    return;
  }
  // 强制同步计算样式（确保CSS生效）
  const container = wordcloudRef.value;
  container.style.width = '310px';
  container.style.height = '175px';
  container.style.display = 'block'; // 确保非隐藏状态
  
  // 触发浏览器重绘（关键！）
  void container.offsetHeight; // 强制重排

  // 使用传入的数据或默认数据
  const list = computed(() => {
    if (props.data && props.data.length > 0) {
      return props.data;
    }
    // 默认数据
    return [
      ["概率", 4],
      ["数列", 2],
      ["向量", 2],
      ["矩阵", 2],
      ["二项式", 2],
      ["28%", 2],
      ["35%", 2],
      ["15%", 3],
      ["立体几何", 3],
      ["函数", 1],
      ["导数", 1],
      ["积分", 1],
      ["极限", 2],
    ];
  });
  // 自定义颜色函数
  const colorFunc = (word, weight) => {
    // 根据权重决定颜色
    // 这里假设权重范围是1-5，你可以根据实际情况调整
    return weight >= 4 ? "#67c4ff" : "#91D4FF";
  };
  const options = {
    list: list.value, // 【必需】二维数组格式数据，格式：[["关键词", 权重], ...]
    gridSize: 8, // 网格尺寸（单位：px），控制词语间距，值越大词语间隔越大
    weightFactor: 13, // 字体大小系数，计算公式：Math.sqrt(value) * weightFactor
    fontFamily: "Hiragino Mincho Pro, serif", // 字体设置（建议使用系统安全字体）
    fontWeight:700,
    color: colorFunc, // 字体颜色模式，可选值："random-dark" 随机深色 "random-light" 随机浅色 ，其它查看文档
    backgroundColor: "transparent", // 画布背景色
    rotateRatio: 0, // 文字旋转比例（0-1）
    drawOutOfBound: false, // 是否允许绘制超出画布的词语
    shrinkToFit: true, // 是否自动缩小字体以适应容器
    // shape: "circle",
    shape: 'cloud', // 设置为云朵形状（需配合maskImage）
    maskImage: maskImg, // 替换为你的云朵图片路径
    minFontSize:2,
  };


  if (wordcloudRef.value) {
    // WordCloud(wordcloudRef.value, options);
    console.log("Canvas容器:", wordcloudRef.value); // 调试1：检查容器是否存在
    WordCloud(wordcloudRef.value, options);

    // 调试2：检查画布是否生成
  }
};

</script>

<style lang="less" scoped>
.out {
  width: 310px;
  height: 175px;
  margin: 6px auto;
  position: relative;
  background: transparent;

  .cloud2,
  .cloud1 {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
  .wordcloud {
    position: absolute;
    top: 0;
    left: 0;
    width: 300px !important;
    height: 170px !important;
    z-index: 2;
  }
}
</style>