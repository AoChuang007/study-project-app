<template>
  <div
    style="width: 100vw; height: 100vh; display: flex; flex-direction: column"
  >
    <div
      style="
        padding: 10px;
        background: #2c3e50;
        color: white;
        display: flex;
        gap: 10px;
        align-items: center;
      "
    >
      <button
        @click="executeWorkflow"
        :disabled="isLoading"
        :style="{
          padding: '8px 16px',
          background: isLoading ? '#95a5a6' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }"
      >
        <span v-if="isLoading" class="loading-spinner"></span>
        {{ isLoading ? "正在加载..." : "执行工作流" }}
      </button>
      <span v-if="executionStatus" style="margin-left: 10px">{{
        executionStatus
      }}</span>
    </div>
    <div style="flex: 1; display: flex">
      <div style="flex: 1">
        <baklava-editor :config="editorConfig" :view-model="baklava" />
      </div>
      <div
        v-if="showResult"
        style="
          width: 500px;
          background: #f5f5f5;
          padding: 20px;
          overflow-y: auto;
          border-left: 2px solid #ddd;
          display: flex;
          flex-direction: column;
          gap: 20px;
        "
      >
        <div>
          <h3 style="margin-top: 0">执行结果</h3>
          <MarkdownRenderer :content="executionResult" />
        </div>
        <div v-if="flowchartData" style="flex: 1; min-height: 400px">
          <h3 style="margin-top: 0; margin-bottom: 10px">流程图可视化</h3>
          <G6FlowchartViewer :data="flowchartData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BaklavaInterfaceTypes,
  DependencyEngine,
  EditorComponent,
  applyResult,
  useBaklava,
} from "baklavajs";

import "@baklavajs/themes/dist/syrup-dark.css";

import { ElLoading, ElMessage } from "element-plus";
import "element-plus/es/components/loading/style/css";
import "element-plus/es/components/message/style/css";
import { defineComponent, ref } from "vue";

import { getWorkFlowData } from "./api/index";
import G6FlowchartViewer from "./components/G6FlowchartViewer.vue";
import MarkdownRenderer from "./components/MarkdownRenderer.vue";
import { execType, numberType } from "./interfaces/InterfaceType";
import { CustomNode } from "./nodes/CustomNode";
import { DataDisplayNode } from "./nodes/DataDisplayNode";
import { DataFilterNode } from "./nodes/DataFilterNode";
import { DisplayNode } from "./nodes/DisplayNode";
import { ImageNode } from "./nodes/ImageNode";
import { MathNode } from "./nodes/MathNode";
import { MindMapNode } from "./nodes/MindMapNode";
import {
  MockDataNode,
  getMockNodeKeyword,
  setMockNodeApiData,
} from "./nodes/MockDataNode";
import { QueueNode } from "./nodes/QueueNode";
// import { MinimapPlugin } from "@baklavajs/plugin-minimap";

export default defineComponent({
  components: {
    "baklava-editor": EditorComponent,
    G6FlowchartViewer,
    MarkdownRenderer,
  },
  setup() {
    const baklava = useBaklava();
    const engine = new DependencyEngine(baklava.editor);

    const executionResult = ref("");
    const executionStatus = ref("");
    const showResult = ref(false);
    const flowchartData = ref(null);
    const isLoading = ref(false);

    engine.start();

    // 连接样式配置
    const editorConfig = {
      connections: {
        string_port: {
          style: {
            stroke: "blue",
            "stroke-width": "2px",
          },
        },
        // 其他类型的连接及其样式
      },
    };

    const nodeInterfaceTypes = new BaklavaInterfaceTypes(baklava.editor, {
      viewPlugin: baklava,
    });
    nodeInterfaceTypes.addTypes(numberType);
    nodeInterfaceTypes.addTypes(execType);
    nodeInterfaceTypes.addTypes(execType);

    baklava.editor.registerNodeType(MathNode);
    baklava.editor.registerNodeType(CustomNode);
    baklava.editor.registerNodeType(DisplayNode);
    baklava.editor.registerNodeType(QueueNode);
    baklava.editor.registerNodeType(ImageNode);
    baklava.editor.registerNodeType(MockDataNode);
    baklava.editor.registerNodeType(DataFilterNode);
    baklava.editor.registerNodeType(DataDisplayNode);
    baklava.editor.registerNodeType(MindMapNode);

    baklava.settings.enableMinimap = true;
    // baklava.settings.displayValueOnHover = false;
    // baklava.displayedGraph.sidebar.visible = true;

    baklava.editor.registerNodeType(MathNode, { category: "可用节点" });
    baklava.editor.registerNodeType(DisplayNode, { category: "订阅节点" });
    baklava.editor.registerNodeType(CustomNode, { category: "订阅节点" });
    baklava.editor.registerNodeType(QueueNode, { category: "订阅节点" });
    baklava.editor.registerNodeType(ImageNode, { category: "订阅节点" });
    baklava.editor.registerNodeType(MockDataNode, { category: "数据处理" });
    baklava.editor.registerNodeType(DataFilterNode, { category: "数据处理" });
    baklava.editor.registerNodeType(DataDisplayNode, { category: "数据处理" });
    baklava.editor.registerNodeType(MindMapNode, { category: "数据处理" });

    const token = Symbol();
    engine.events.afterRun.subscribe(token, (result) => {
      engine.pause();
      applyResult(result, baklava.editor);
      engine.resume();
    });

    // 节点引用，用于执行工作流时获取
    let mockNode = null;
    let filterNode = null;
    let displayNode = null;
    let mindMapNode = null;

    // 执行工作流函数
    const executeWorkflow = async () => {
      // 从当前图中获取节点
      const nodes = baklava.displayedGraph.nodes;
      mockNode = nodes.find((n) => n.type === "MockDataNode");
      filterNode = nodes.find((n) => n.type === "DataFilterNode");
      displayNode = nodes.find((n) => n.type === "DataDisplayNode");
      mindMapNode = nodes.find((n) => n.type === "MindMapNode");

      // 检查必要的节点是否存在
      if (!mockNode) {
        ElMessage.warning("请先添加「工作流输入节点」到画布中");
        return;
      }

      // 获取 MockDataNode 中的关键词输入
      const keyword = getMockNodeKeyword(mockNode);
      console.log("获取到的关键词:", keyword);

      // 检查关键词是否为空
      if (!keyword || keyword.trim() === "") {
        ElMessage.warning("请在「工作流输入节点」中输入您想要查询的关键词");
        return;
      }

      // 开始加载 - 使用 Element Plus Loading
      const loadingInstance = ElLoading.service({
        lock: true,
        text: "正在获取学习路线数据...",
        background: "rgba(255, 255, 255, 0.8)",
      });

      try {
        isLoading.value = true;
        executionStatus.value = "正在执行...";

        // 调用 API 获取数据
        try {
          const apiResponse = await getWorkFlowData(keyword);
          console.log("API 返回数据:", apiResponse);

          // 接口返回格式: { success: true, data: [...], total: 5, timestamp: "..." }
          if (apiResponse && apiResponse.success && apiResponse.data) {
            setMockNodeApiData({
              success: true,
              data: apiResponse.data,
              total: apiResponse.total || apiResponse.data.length,
              timestamp: apiResponse.timestamp || new Date().toISOString(),
            });
          }
        } catch (apiError) {
          console.warn("API 调用失败，使用 Mock 数据:", apiError);
          // API 调用失败时不设置数据，将使用默认 Mock 数据
        }

        // 手动触发节点计算
        const mockResult = mockNode.calculate();

        let finalData = mockResult.data;

        // 如果有筛选节点，则进行筛选
        if (filterNode) {
          const filterResult = filterNode.calculate({
            data: mockResult.data,
            filterType: filterNode.inputs.filterType.value,
            filterLevel: filterNode.inputs.filterLevel.value,
            keyword: filterNode.inputs.keyword.value,
          });
          finalData = filterResult.filteredData;
        }

        // 如果有展示节点，则进行展示
        if (displayNode) {
          const displayResult = displayNode.calculate({
            data: finalData,
            displayFormat: displayNode.inputs.displayFormat.value,
          });
          executionResult.value = displayResult.output;
        } else {
          // 没有展示节点时，直接显示 JSON
          executionResult.value = finalData;
        }

        // 如果有思维导图节点，则生成可视化
        if (mindMapNode) {
          const mindMapResult = mindMapNode.calculate({
            data: finalData,
          });
          console.log("MindMap Result:", mindMapResult);
          console.log("Visualization Data:", mindMapResult.visualization);
          flowchartData.value = mindMapResult.visualization;
        }

        showResult.value = true;
        executionStatus.value = "执行成功！";
        ElMessage.success("工作流执行成功");
      } catch (error) {
        executionResult.value = `执行错误: ${error.message}`;
        executionStatus.value = "执行失败";
        ElMessage.error(`执行失败: ${error.message}`);
      } finally {
        isLoading.value = false;
        loadingInstance.close();
      }
    };

    return {
      baklava,
      editorConfig,
      imageNode: new ImageNode(),
      executeWorkflow,
      executionResult,
      executionStatus,
      showResult,
      flowchartData,
      isLoading,
    };
  },
});
</script>
<style>
#app {
  max-width: none !important;
}

/* 小型加载动画 - 用于按钮 */
.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
