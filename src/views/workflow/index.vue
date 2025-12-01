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
        style="
          padding: 8px 16px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        "
      >
        执行工作流
      </button>
      <span v-if="executionResult" style="margin-left: 10px">{{
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
          <pre
            style="
              white-space: pre-wrap;
              word-wrap: break-word;
              background: white;
              padding: 15px;
              border-radius: 4px;
              font-size: 12px;
            "
            >{{ executionResult }}</pre
          >
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

import { defineComponent, ref } from "vue";

import G6FlowchartViewer from "./components/G6FlowchartViewer.vue";
import { execType, numberType } from "./interfaces/InterfaceType";
import { CustomNode } from "./nodes/CustomNode";
import { DataDisplayNode } from "./nodes/DataDisplayNode";
import { DataFilterNode } from "./nodes/DataFilterNode";
import { DisplayNode } from "./nodes/DisplayNode";
import { ImageNode } from "./nodes/ImageNode";
import { MathNode } from "./nodes/MathNode";
import { MindMapNode } from "./nodes/MindMapNode";
import { MockDataNode } from "./nodes/MockDataNode";
import { QueueNode } from "./nodes/QueueNode";
// import { MinimapPlugin } from "@baklavajs/plugin-minimap";

export default defineComponent({
  components: {
    "baklava-editor": EditorComponent,
    G6FlowchartViewer,
  },
  setup() {
    const baklava = useBaklava();
    const engine = new DependencyEngine(baklava.editor);

    const executionResult = ref("");
    const executionStatus = ref("");
    const showResult = ref(false);
    const flowchartData = ref(null);

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

    // Add some nodes for demo purposes
    function addNodeWithCoordinates(nodeType, x, y) {
      const n = new nodeType();
      baklava.displayedGraph.addNode(n);
      n.position.x = x;
      n.position.y = y;
      return n;
    }

    // 创建演示节点 - 数据处理流程
    const mockNode = addNodeWithCoordinates(MockDataNode, 100, 100);
    const filterNode = addNodeWithCoordinates(DataFilterNode, 400, 100);
    const displayNode = addNodeWithCoordinates(DataDisplayNode, 750, 100);
    const mindMapNode = addNodeWithCoordinates(MindMapNode, 750, 350);

    // 连接数据处理流程
    baklava.displayedGraph.addConnection(
      mockNode.outputs.data,
      filterNode.inputs.data
    );
    baklava.displayedGraph.addConnection(
      filterNode.outputs.filteredData,
      displayNode.inputs.data
    );
    baklava.displayedGraph.addConnection(
      filterNode.outputs.filteredData,
      mindMapNode.inputs.data
    );

    // 执行工作流函数
    const executeWorkflow = async () => {
      try {
        executionStatus.value = "正在执行...";
        showResult.value = true;

        // 手动触发节点计算
        const mockResult = mockNode.calculate();
        const filterResult = filterNode.calculate({
          data: mockResult.data,
          filterType: filterNode.inputs.filterType.value,
          filterLevel: filterNode.inputs.filterLevel.value,
          keyword: filterNode.inputs.keyword.value,
        });
        const displayResult = displayNode.calculate({
          data: filterResult.filteredData,
          displayFormat: displayNode.inputs.displayFormat.value,
        });
        const mindMapResult = mindMapNode.calculate({
          data: filterResult.filteredData,
        });

        console.log("MindMap Result:", mindMapResult);
        console.log("Visualization Data:", mindMapResult.visualization);

        executionResult.value = displayResult.output;
        flowchartData.value = mindMapResult.visualization;
        executionStatus.value = "执行成功！";
      } catch (error) {
        executionResult.value = `执行错误: ${error.message}`;
        executionStatus.value = "执行失败";
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
    };
  },
});
</script>
<style>
#app {
  max-width: none !important;
}
</style>
