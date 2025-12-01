import {
  defineNode,
  NodeInterface,
  TextInterface,
  SelectInterface,
  setType,
} from "baklavajs";

import { execType, stringType } from "../interfaces/InterfaceType";
import { StringInputInterface } from "../interfaces/StringInputInterface";

export const DataFilterNode = defineNode({
  type: "DataFilterNode",
  title: "数据筛选",
  inputs: {
    exec_pin: () =>
      new TextInterface("执行").setPort(true).use(setType, execType),
    data: () =>
      new NodeInterface("输入数据", "").setPort(true).use(setType, stringType),
    filterType: () =>
      new SelectInterface("筛选类型", "全部", [
        "全部",
        "基础路线",
        "进阶路线",
        "高级路线",
      ]).setPort(false),
    filterLevel: () =>
      new SelectInterface("难度级别", "全部", [
        "全部",
        "初级",
        "中级",
        "高级",
      ]).setPort(false),
    keyword: () =>
      new StringInputInterface("关键词", "").use(setType, stringType),
  },
  outputs: {
    exec_pin: () => new TextInterface().setPort(true).use(setType, execType),
    filteredData: () => new NodeInterface("筛选结果").use(setType, stringType),
    count: () => new NodeInterface("数量").use(setType, stringType),
  },
  calculate({ data, filterType, filterLevel, keyword }) {
    try {
      let parsedData = typeof data === "string" ? JSON.parse(data) : data;
      let dataArray = parsedData.data || parsedData;

      if (!Array.isArray(dataArray)) {
        dataArray = [dataArray];
      }

      let filtered = [...dataArray];

      if (filterType !== "全部") {
        filtered = filtered.filter((item) => item.type === filterType);
      }

      if (filterLevel !== "全部") {
        filtered = filtered.filter((item) => item.level === filterLevel);
      }

      if (keyword && keyword.trim() !== "") {
        const kw = keyword.toLowerCase();
        filtered = filtered.filter((item) => {
          const searchText = JSON.stringify(item).toLowerCase();
          return searchText.includes(kw);
        });
      }

      const result = {
        success: true,
        data: filtered,
        total: filtered.length,
        filters: { filterType, filterLevel, keyword },
      };

      return {
        exec_pin: true,
        filteredData: JSON.stringify(result, null, 2),
        count: filtered.length.toString(),
      };
    } catch (error) {
      return {
        exec_pin: true,
        filteredData: JSON.stringify({ success: false, error: error.message }),
        count: "0",
      };
    }
  },
});
