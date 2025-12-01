<template>
  <div class="flowchart-viewer">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup>
import mermaid from "mermaid";
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps({
  data: {
    type: [Object, String],
    default: null,
  },
});

const chartContainer = ref(null);

// 初始化 mermaid
onMounted(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: "basis",
    },
  });
  nextTick(() => {
    renderChart();
  });
});

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      nextTick(() => {
        renderChart();
      });
    }
  }
);

// 将数据转换为流程图格式
const convertToFlowchart = (data) => {
  if (!data) return "flowchart TD\n  A[暂无数据]";

  const parsedData = typeof data === "string" ? JSON.parse(data) : data;

  let mermaidCode = "flowchart TD\n";

  // 根节点
  mermaidCode += `  Root["${parsedData.topic}"]\n`;

  // 遍历子节点
  if (parsedData.children && parsedData.children.length > 0) {
    parsedData.children.forEach((typeNode, typeIndex) => {
      const typeId = `Type${typeIndex}`;
      mermaidCode += `  ${typeId}["${typeNode.topic}"]\n`;
      mermaidCode += `  Root --> ${typeId}\n`;

      // 遍历该类型下的学习路线
      if (typeNode.children && typeNode.children.length > 0) {
        typeNode.children.forEach((item, itemIndex) => {
          const itemId = `Item${typeIndex}_${itemIndex}`;
          mermaidCode += `  ${itemId}["${item.topic}"]\n`;
          mermaidCode += `  ${typeId} --> ${itemId}\n`;

          // 遍历学习路线的详细信息
          if (item.children && item.children.length > 0) {
            item.children.forEach((detail, detailIndex) => {
              const detailId = `Detail${typeIndex}_${itemIndex}_${detailIndex}`;
              const topicText =
                detail.topic.length > 30
                  ? detail.topic.substring(0, 30) + "..."
                  : detail.topic;

              // 如果是学习步骤节点，特殊处理
              if (detail.topic === "学习步骤" && detail.children) {
                mermaidCode += `  ${detailId}["${detail.topic}"]\n`;
                mermaidCode += `  ${itemId} --> ${detailId}\n`;

                // 添加步骤子节点
                detail.children.forEach((step, stepIndex) => {
                  const stepId = `Step${typeIndex}_${itemIndex}_${stepIndex}`;
                  const stepText =
                    step.topic.length > 25
                      ? step.topic.substring(0, 25) + "..."
                      : step.topic;
                  mermaidCode += `  ${stepId}["${stepText}"]\n`;
                  mermaidCode += `  ${detailId} --> ${stepId}\n`;
                });
              } else {
                mermaidCode += `  ${detailId}["${topicText}"]\n`;
                mermaidCode += `  ${itemId} --> ${detailId}\n`;
              }
            });
          }
        });
      }
    });
  }

  return mermaidCode;
};

// 渲染图表
const renderChart = async () => {
  if (!chartContainer.value) {
    console.log("容器未准备好");
    return;
  }

  if (!props.data) {
    console.log("数据为空，等待数据加载...");
    // 不显示错误，只是等待数据
    return;
  }

  try {
    const mermaidCode = convertToFlowchart(props.data);

    console.log("生成的 Mermaid 代码:", mermaidCode);

    // 清空容器
    chartContainer.value.innerHTML = "";

    // 生成唯一ID
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 渲染
    const { svg } = await mermaid.render(id, mermaidCode);

    // 插入SVG
    chartContainer.value.innerHTML = svg;

    console.log("流程图渲染成功");
  } catch (error) {
    console.error("渲染图表失败:", error);
    chartContainer.value.innerHTML = `<div class="error">渲染失败: ${error.message}<br><br>请检查控制台查看详细错误</div>`;
  }
};
</script>

<style scoped>
.flowchart-viewer {
  width: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.chart-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 350px;
}

.chart-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

.error {
  color: #ff6b6b;
  padding: 20px;
  text-align: center;
  font-size: 14px;
}
</style>
