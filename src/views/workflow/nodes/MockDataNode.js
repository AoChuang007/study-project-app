import { defineNode, NodeInterface, TextInterface, setType } from "baklavajs";

import { execType, stringType } from "../interfaces/InterfaceType";
import { StringInputInterface } from "../interfaces/StringInputInterface";

// 用于存储外部 API 数据的缓存
let apiDataCache = null;

// 设置 API 数据的方法，供外部调用
export function setMockNodeApiData(data) {
  apiDataCache = data;
}

// 获取关键词的方法，供外部调用
export function getMockNodeKeyword(nodeInstance) {
  return nodeInstance?.inputs?.keyword?._value || "";
}

export const MockDataNode = defineNode({
  type: "MockDataNode",
  title: "工作流输入节点",
  inputs: {
    exec_pin: () =>
      new TextInterface("执行").setPort(true).use(setType, execType),
    data: () =>
      new NodeInterface("输入数据", "").setPort(true).use(setType, stringType),
    keyword: () =>
      new StringInputInterface("关键词", "").use(setType, stringType),
  },
  outputs: {
    exec_pin: () => new TextInterface().setPort(true).use(setType, execType),
    data: () => new NodeInterface("数据").use(setType, stringType),
    status: () => new NodeInterface("状态").use(setType, stringType),
  },
  calculate() {
    // 优先使用外部传入的 API 数据
    if (apiDataCache) {
      const result = {
        exec_pin: true,
        data: JSON.stringify(apiDataCache),
        status: "success",
      };
      // 使用后清除缓存，避免重复使用
      apiDataCache = null;
      return result;
    }

    // 如果没有 API 数据，使用默认的 Mock 数据（与接口返回格式一致）
    const mockData = {
      success: true,
      data: [
        {
          id: "1",
          title: "Web前端基础入门",
          type: "基础路线",
          level: "初级",
          content: "学习HTML5、CSS3、JavaScript基础语法",
          duration: "2个月",
          courseUrl: "https://www.bilibili.com/video/BV1Kg411T7t9",
          steps: [
            "HTML5标签与语义化",
            "CSS3选择器与盒模型",
            "Flex布局与Grid布局",
            "JavaScript基础语法",
            "DOM操作与事件处理",
          ],
        },
        {
          id: "2",
          title: "JavaScript进阶与工程化",
          type: "进阶路线",
          level: "中级",
          content: "深入学习ES6+、异步编程、前端工程化",
          duration: "3个月",
          courseUrl: "https://www.bilibili.com/video/BV1Y84y1L7Nn",
          steps: [
            "ES6+新特性",
            "异步编程Promise/async/await",
            "模块化开发",
            "Git版本控制",
            "Webpack构建工具",
          ],
        },
        {
          id: "3",
          title: "Vue.js全家桶",
          type: "框架路线",
          level: "中级",
          content: "掌握Vue3、Vue Router、Vuex、Pinia等",
          duration: "3个月",
          courseUrl: "https://www.bilibili.com/video/BV1QA4y1d7xf",
          steps: [
            "Vue3组合式API",
            "Vue Router路由管理",
            "状态管理Pinia",
            "Vue组件化开发",
            "Vite工程化配置",
          ],
        },
        {
          id: "4",
          title: "React生态体系",
          type: "框架路线",
          level: "中级",
          content: "学习React、Hooks、Redux、React Router",
          duration: "4个月",
          courseUrl: "https://www.bilibili.com/video/BV1Z44y1K7Fj",
          steps: [
            "React基础与JSX",
            "Hooks状态管理",
            "Redux状态管理",
            "React Router",
            "组件性能优化",
          ],
        },
        {
          id: "5",
          title: "前端工程化与性能优化",
          type: "高级路线",
          level: "高级",
          content: "前端工程化、性能优化、TypeScript",
          duration: "3个月",
          courseUrl: "https://www.bilibili.com/video/BV14Z4y1u7pi",
          steps: [
            "TypeScript类型系统",
            "Webpack高级配置",
            "性能监控与优化",
            "自动化部署",
            "微前端架构",
          ],
        },
      ],
      total: 5,
      timestamp: new Date().toISOString().split("T")[0],
    };

    return {
      exec_pin: true,
      data: JSON.stringify(mockData),
      status: "success",
    };
  },
});
