import { defineNode, NodeInterface, TextInterface, setType } from "baklavajs";
import { markRaw } from "vue";

import { execType, stringType } from "../interfaces/InterfaceType";

// 自定义脑图组件接口 - 使用 G6 流程图
import G6FlowchartViewer from "../components/G6FlowchartViewer.vue";

class MindMapInterface extends NodeInterface {
  constructor(name, value) {
    super(name, value);
    this.setComponent(markRaw(G6FlowchartViewer));
    this.setPort(false);
  }
}

export const MindMapNode = defineNode({
  type: "MindMapNode",
  title: "脑图可视化",
  inputs: {
    exec_pin: () =>
      new TextInterface("执行").setPort(true).use(setType, execType),
    data: () =>
      new NodeInterface("数据", "").setPort(true).use(setType, stringType),
  },
  outputs: {
    exec_pin: () => new TextInterface().setPort(true).use(setType, execType),
    mindMapData: () => new NodeInterface("脑图数据").use(setType, stringType),
  },
  calculate({ data }) {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      const dataArray = parsedData.data || parsedData;

      // 构建脑图数据结构
      const mindMapData = {
        id: "root",
        topic: "Java学习路线",
        children: [],
      };

      // 按类型分组
      const groupedByType = {};
      dataArray.forEach((item) => {
        if (!groupedByType[item.type]) {
          groupedByType[item.type] = [];
        }
        groupedByType[item.type].push(item);
      });

      // 构建脑图节点
      Object.entries(groupedByType).forEach(([type, items]) => {
        const typeNode = {
          id: `type_${type}`,
          topic: `${type} (${items.length}条)`,
          children: [],
        };

        items.forEach((item) => {
          const itemNode = {
            id: `item_${item.id}`,
            topic: item.title,
            children: [
              {
                id: `level_${item.id}`,
                topic: `级别: ${item.level}`,
              },
              {
                id: `duration_${item.id}`,
                topic: `时长: ${item.duration}`,
              },
              {
                id: `content_${item.id}`,
                topic: `内容: ${item.content}`,
              },
            ],
          };

          // 添加步骤节点
          if (item.steps && item.steps.length > 0) {
            const stepsNode = {
              id: `steps_${item.id}`,
              topic: "学习步骤",
              children: item.steps.map((step, stepIndex) => ({
                id: `step_${item.id}_${stepIndex}`,
                topic: step,
              })),
            };
            itemNode.children.push(stepsNode);
          }

          typeNode.children.push(itemNode);
        });

        mindMapData.children.push(typeNode);
      });

      return {
        exec_pin: true,
        mindMapData: JSON.stringify(mindMapData, null, 2),
        visualization: mindMapData,
      };
    } catch (error) {
      return {
        exec_pin: true,
        mindMapData: JSON.stringify({
          id: "error",
          topic: `错误: ${error.message}`,
        }),
        visualization: {
          id: "error",
          topic: `错误: ${error.message}`,
        },
      };
    }
  },
});
