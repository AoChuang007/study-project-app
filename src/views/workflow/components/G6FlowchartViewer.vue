<template>
  <div class="g6-flowchart-viewer">
    <div class="toolbar">
      <button
        @click="changeTheme('light')"
        :class="{ active: currentTheme === 'light' }"
      >
        浅色主题
      </button>
      <button
        @click="changeTheme('dark')"
        :class="{ active: currentTheme === 'dark' }"
      >
        深色主题
      </button>
      <button @click="downloadImage">保存图片</button>
      <button @click="fitView">适应画布</button>
    </div>
    <div ref="container" class="graph-container"></div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { Graph } from "@antv/g6";
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  data: {
    type: [Object, String],
    default: null,
  },
});

const container = ref(null);
const error = ref("");
const currentTheme = ref("light");
let graph = null;

// 主题配置
const themes = {
  light: {
    background: "#fafafa",
    node: {
      fill: "#5B8FF9",
      stroke: "#3370FF",
      labelFill: "#fff",
    },
    edge: {
      stroke: "#91d5ff",
    },
    colors: {
      root: { fill: "#722ed1", stroke: "#531dab" },
      type: { fill: "#13c2c2", stroke: "#08979c" },
      item: { fill: "#52c41a", stroke: "#389e0d" },
      detail: { fill: "#1890ff", stroke: "#096dd9" },
      steps: { fill: "#fa8c16", stroke: "#d46b08" },
      step: { fill: "#faad14", stroke: "#d48806" },
    },
  },
  dark: {
    background: "#141414",
    node: {
      fill: "#1765AD",
      stroke: "#177DDC",
      labelFill: "#fff",
    },
    edge: {
      stroke: "#597EF7",
    },
    colors: {
      root: { fill: "#531dab", stroke: "#391085" },
      type: { fill: "#08979c", stroke: "#006d75" },
      item: { fill: "#389e0d", stroke: "#237804" },
      detail: { fill: "#096dd9", stroke: "#0050b3" },
      steps: { fill: "#d46b08", stroke: "#ad4e00" },
      step: { fill: "#d48806", stroke: "#ad6800" },
    },
  },
};

// 初始化 G6 图表
onMounted(() => {
  nextTick(() => {
    initGraph();
    renderChart();
  });
});

// 销毁图表
onUnmounted(() => {
  if (graph) {
    graph.destroy();
  }
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
  },
  { deep: true }
);

// 初始化 G6 图表
const initGraph = () => {
  if (!container.value) {
    console.log("容器未准备好");
    return;
  }

  // 如果已存在图表，先销毁
  if (graph) {
    graph.destroy();
    graph = null;
  }

  try {
    const width = container.value.offsetWidth || 800;
    const height = container.value.offsetHeight || 600;
    const theme = themes[currentTheme.value];

    console.log("初始化 G6 图表，容器尺寸:", width, height);

    graph = new Graph({
      container: container.value,
      width,
      height,
      autoFit: "view",
      behaviors: [
        "drag-canvas",
        "zoom-canvas",
        "drag-element",
        "collapse-expand-tree",
      ],
      plugins: [],
      layout: {
        type: "dagre",
        rankdir: "LR",
        nodesep: 80,
        ranksep: 120,
        align: "UL",
      },
      node: {
        type: "rect",
        style: {
          size: [200, 40],
          radius: 8,
          fill: theme.node.fill,
          stroke: theme.node.stroke,
          lineWidth: 2,
          labelText: (d) => d.data?.label || d.id,
          labelFill: theme.node.labelFill,
          labelFontSize: 20,
          labelMaxWidth: 190,
          labelWordWrap: true,
          labelTextAlign: "center",
          labelTextBaseline: "middle",
          labelOffsetY: -16,
          labelPosition: "center",
          labelBackground: true,
          labelBackgroundFill: "transparent",
          labelBackgroundOpacity: 0,
          ports: [{ placement: "left" }, { placement: "right" }],
        },
      },
      edge: {
        type: "polyline",
        style: {
          stroke: theme.edge.stroke,
          lineWidth: 2,
          endArrow: true,
          radius: 10,
        },
      },
    });

    console.log("G6 图表初始化成功");

    // 添加节点点击事件，支持折叠展开
    graph.on("node:click", (evt) => {
      const { itemId } = evt;

      // 获取所有边找出子节点
      const edges = graph.getEdgeData();
      const childrenIds = edges
        .filter((edge) => edge.source === itemId)
        .map((edge) => edge.target);

      if (childrenIds.length > 0) {
        // 切换子节点的可见性
        const firstChild = graph.getNodeData(childrenIds[0]);
        const isHidden = firstChild.data.hidden;

        childrenIds.forEach((childId) => {
          graph.updateNodeData([
            {
              id: childId,
              data: { hidden: !isHidden },
            },
          ]);

          // 递归隐藏/显示所有后代节点
          toggleDescendants(childId, !isHidden);
        });

        graph.draw();
      }
    });

    // 递归切换后代节点的可见性
    const toggleDescendants = (nodeId, hidden) => {
      const edges = graph.getEdgeData();
      const childrenIds = edges
        .filter((edge) => edge.source === nodeId)
        .map((edge) => edge.target);

      childrenIds.forEach((childId) => {
        graph.updateNodeData([
          {
            id: childId,
            data: { hidden },
          },
        ]);
        toggleDescendants(childId, hidden);
      });
    };
  } catch (err) {
    console.error("初始化 G6 图表失败:", err);
    error.value = `初始化失败: ${err.message}`;
  }
};

// 将数据转换为 G6 格式
const convertToG6Data = (data) => {
  if (!data) {
    return {
      nodes: [
        {
          id: "empty",
          data: {
            label: "暂无数据",
          },
        },
      ],
      edges: [],
    };
  }

  const parsedData = typeof data === "string" ? JSON.parse(data) : data;
  const theme = themes[currentTheme.value];

  const nodes = [];
  const edges = [];

  // 根节点
  nodes.push({
    id: "root",
    data: {
      label: parsedData.topic,
      style: {
        fill: theme.colors.root.fill,
        stroke: theme.colors.root.stroke,
        size: [200, 50],
      },
    },
  });

  // 遍历子节点
  if (parsedData.children && parsedData.children.length > 0) {
    parsedData.children.forEach((typeNode, typeIndex) => {
      const typeId = `type_${typeIndex}`;
      nodes.push({
        id: typeId,
        data: {
          label: typeNode.topic,
          style: {
            fill: theme.colors.type.fill,
            stroke: theme.colors.type.stroke,
            size: [180, 45],
          },
        },
      });
      edges.push({
        id: `edge-root-${typeId}`,
        source: "root",
        target: typeId,
      });

      // 遍历该类型下的学习路线
      if (typeNode.children && typeNode.children.length > 0) {
        typeNode.children.forEach((item, itemIndex) => {
          const itemId = `item_${typeIndex}_${itemIndex}`;
          nodes.push({
            id: itemId,
            data: {
              label: item.topic,
              style: {
                fill: theme.colors.item.fill,
                stroke: theme.colors.item.stroke,
                size: [170, 42],
              },
            },
          });
          edges.push({
            id: `edge-${typeId}-${itemId}`,
            source: typeId,
            target: itemId,
          });

          // 遍历学习路线的详细信息
          if (item.children && item.children.length > 0) {
            item.children.forEach((detail, detailIndex) => {
              const detailId = `detail_${typeIndex}_${itemIndex}_${detailIndex}`;
              const topicText =
                detail.topic.length > 30
                  ? detail.topic.substring(0, 30) + "..."
                  : detail.topic;

              // 如果是学习步骤节点，特殊处理
              if (detail.topic === "学习步骤" && detail.children) {
                nodes.push({
                  id: detailId,
                  data: {
                    label: detail.topic,
                    style: {
                      fill: theme.colors.steps.fill,
                      stroke: theme.colors.steps.stroke,
                      size: [160, 40],
                    },
                  },
                });
                edges.push({
                  id: `edge-${itemId}-${detailId}`,
                  source: itemId,
                  target: detailId,
                });

                // 添加步骤子节点
                detail.children.forEach((step, stepIndex) => {
                  const stepId = `step_${typeIndex}_${itemIndex}_${stepIndex}`;
                  const stepText =
                    step.topic.length > 25
                      ? step.topic.substring(0, 25) + "..."
                      : step.topic;
                  nodes.push({
                    id: stepId,
                    data: {
                      label: stepText,
                      style: {
                        fill: theme.colors.step.fill,
                        stroke: theme.colors.step.stroke,
                        size: [150, 38],
                      },
                    },
                  });
                  edges.push({
                    id: `edge-${detailId}-${stepId}`,
                    source: detailId,
                    target: stepId,
                  });
                });
              } else {
                nodes.push({
                  id: detailId,
                  data: {
                    label: topicText,
                    style: {
                      fill: theme.colors.detail.fill,
                      stroke: theme.colors.detail.stroke,
                      size: [160, 40],
                    },
                  },
                });
                edges.push({
                  id: `edge-${itemId}-${detailId}`,
                  source: itemId,
                  target: detailId,
                });
              }
            });
          }
        });
      }
    });
  }

  console.log("转换后的数据:", { nodes: nodes.length, edges: edges.length });
  return { nodes, edges };
};

// 渲染图表
const renderChart = async () => {
  if (!container.value) {
    console.log("容器未准备好");
    return;
  }

  if (!graph) {
    console.log("图表未初始化，尝试重新初始化");
    initGraph();
    if (!graph) return;
  }

  if (!props.data) {
    console.log("数据为空，等待数据加载...");
    return;
  }

  try {
    error.value = "";
    const g6Data = convertToG6Data(props.data);

    console.log("开始渲染 G6 数据");

    // 设置数据并渲染
    graph.setData(g6Data);
    await graph.render();

    // 自动适应画布 - 增加延时确保布局完成
    setTimeout(() => {
      graph.fitView({ padding: 50 });
      graph.fitCenter();
    }, 500);

    console.log("流程图渲染成功");
  } catch (err) {
    console.error("渲染图表失败:", err);
    error.value = `渲染失败: ${err.message}`;
  }
};

// 切换主题
const changeTheme = (theme) => {
  currentTheme.value = theme;
  const containerEl = document.querySelector(".graph-container");
  if (containerEl) {
    containerEl.style.background = themes[theme].background;
  }
  // 重新初始化图表以应用新主题
  initGraph();
  if (props.data) {
    renderChart();
  }
};

// 下载图片
const downloadImage = async () => {
  if (!graph) {
    error.value = "图表未初始化";
    return;
  }

  try {
    // 优先使用 graph.toDataURL（如果 G6 提供），否则回退到 canvas DOM 的 toDataURL
    let dataURL = null;

    if (graph && typeof graph.toDataURL === "function") {
      // graph.toDataURL 可能是同步返回字符串或返回 Promise
      dataURL = await graph.toDataURL();
    } else {
      // 回退：查找容器内的 canvas 元素并使用原生 toDataURL
      const canvasEl = container.value
        ? container.value.querySelector("canvas")
        : null;
      if (canvasEl && typeof canvasEl.toDataURL === "function") {
        dataURL = canvasEl.toDataURL("image/png");
      }
    }

    if (!dataURL) {
      throw new Error(
        "无法获取画布数据 URL（graph.toDataURL / canvas.toDataURL 均不可用）"
      );
    }

    // 创建下载链接
    const link = document.createElement("a");
    link.download = `flowchart-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("下载图片失败:", err);
    error.value = `下载失败: ${err.message}`;
  }
};

// 适应画布
const fitView = () => {
  if (graph) {
    graph.fitView({ padding: 50 });
    graph.fitCenter();
  }
};
</script>

<style scoped>
.g6-flowchart-viewer {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 10px;
  background: #fff;
  border-bottom: 1px solid #d9d9d9;
  flex-wrap: wrap;
}

.toolbar button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.toolbar button:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.toolbar button.active {
  color: #fff;
  background: #1890ff;
  border-color: #1890ff;
}

.graph-container {
  flex: 1;
  overflow: hidden;
  min-height: 350px;
  position: relative;
  background: #fafafa;
  transition: background 0.3s;
}

.graph-container :deep(canvas) {
  border-radius: 4px;
}

.error {
  color: #ff4d4f;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  padding: 12px;
  margin: 10px;
  text-align: center;
  font-size: 14px;
  border-radius: 4px;
}
</style>
