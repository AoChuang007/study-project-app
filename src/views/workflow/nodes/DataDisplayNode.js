/*
 * @Author: Chuang Ao chuang.ao@ly.com
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-04 17:49:26
 * @FilePath: /study-ai-zy-dev_0602 2/src/views/workflow/nodes/DataDisplayNode.js
 */
import {
  defineNode,
  NodeInterface,
  TextInterface,
  SelectInterface,
  setType,
} from "baklavajs";

import { execType, stringType } from "../interfaces/InterfaceType";

export const DataDisplayNode = defineNode({
  type: "DataDisplayNode",
  title: "数据展示",
  inputs: {
    exec_pin: () =>
      new TextInterface("执行").setPort(true).use(setType, execType),
    data: () =>
      new NodeInterface("数据", "").setPort(true).use(setType, stringType),
    displayFormat: () =>
      new SelectInterface("展示格式", "列表", [
        "列表",
        "JSON",
        "表格",
        "摘要",
      ]).setPort(false),
  },
  outputs: {
    exec_pin: () => new TextInterface().setPort(true).use(setType, execType),
    output: () => new NodeInterface("显示内容").use(setType, stringType),
  },
  calculate({ data, displayFormat }) {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      const dataArray = parsedData.data || parsedData;

      let output = "";

      if (displayFormat === "JSON") {
        output = JSON.stringify(parsedData, null, 2);
      } else if (displayFormat === "列表") {
        output = `共找到 ${parsedData.total || dataArray.length} 条数据\n\n`;
        dataArray.forEach((item, index) => {
          output += `${index + 1}. ${item.title}\n`;
          output += `   类型: ${item.type} | 级别: ${item.level} | 时长: ${item.duration}\n`;
          output += `   内容: ${item.content}\n`;
          if (item.courseUrl) {
            output += `   课程链接: ${item.courseUrl}\n`;
          }
          if (item.steps) {
            output += `   步骤: ${item.steps.join(" → ")}\n`;
          }
          output += `\n`;
        });
      } else if (displayFormat === "表格") {
        output = "序号 | 标题 | 类型 | 级别 | 时长 | 课程链接\n";
        output += "---|---|---|---|---|---\n";
        dataArray.forEach((item, index) => {
          const courseLink = item.courseUrl ? `[链接](${item.courseUrl})` : "-";
          output += `${index + 1} | ${item.title} | ${item.type} | ${item.level} | ${item.duration} | ${courseLink}\n`;
        });
      } else if (displayFormat === "摘要") {
        const typeCount = {};
        const levelCount = {};
        dataArray.forEach((item) => {
          typeCount[item.type] = (typeCount[item.type] || 0) + 1;
          levelCount[item.level] = (levelCount[item.level] || 0) + 1;
        });

        output = `数据摘要\n`;
        output += `总计: ${dataArray.length} 条\n\n`;
        output += `按类型分类:\n`;
        Object.entries(typeCount).forEach(([type, count]) => {
          output += `  ${type}: ${count} 条\n`;
        });
        output += `\n按难度分类:\n`;
        Object.entries(levelCount).forEach(([level, count]) => {
          output += `  ${level}: ${count} 条\n`;
        });
      }

      return {
        exec_pin: true,
        output: output,
      };
    } catch (error) {
      console.log("1111", error);
      return {
        exec_pin: true,
        output: `展示错误: ${error.message}\n原始数据: ${data}`,
      };
    }
  },
});
