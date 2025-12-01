import {
  defineNode,
  TextInterface,
  SelectInterface,
  NodeInterface,
  setType,
} from "baklavajs";

import { execType, stringType } from "../interfaces/InterfaceType";

export const QueueNode = defineNode({
  type: "QueueNode",
  title: "队列",
  inputs: {
    exec_pin: () =>
      new TextInterface("执行").setPort(true).use(setType, execType),
    operation: () =>
      new SelectInterface("操作", "添加", ["添加", "提取"]).setPort(false),
    queue_key: () =>
      new NodeInterface("Key", "键").setPort(true).use(setType, stringType),
    queue_value: () =>
      new NodeInterface("Value", "值").setPort(true).use(setType, stringType),
  },
  outputs: {
    result: () => new NodeInterface("Status").use(setType, stringType),
    exec_pin: () => new TextInterface().setPort(true).use(setType, execType),
  },
  created(graph, node) {
    // 创建节点时更新输出端口
    node.on("inputValueChanged", (input) => {
      console.log("inputValueChanged");
      if (input === "operation") {
        updateOutputPort(node);
        graph.$forceUpdate(); // 强制更新 BaklavaJS 组件
      }
    });
  },
});

function updateOutputPort(node) {
  const operation = node.getInput("operation").value;
  const outputName = operation === "提取" ? "值" : "Status";

  // 删除当前输出端口并添加新的
  node.removeOutput("result");
  node.addOutput(outputName, new NodeInterface(outputName));
}
