import { defineNode, NodeInterface, TextInterface, setType } from "baklavajs";

import { execType, stringType } from "../interfaces/InterfaceType";

export const MockDataNode = defineNode({
  type: "MockDataNode",
  title: "Mock数据源",
  inputs: {
    exec_pin: () =>
      new TextInterface("执行").setPort(true).use(setType, execType),
  },
  outputs: {
    exec_pin: () => new TextInterface().setPort(true).use(setType, execType),
    data: () => new NodeInterface("数据").use(setType, stringType),
    status: () => new NodeInterface("状态").use(setType, stringType),
  },
  calculate() {
    // Mock数据 - Java学习路线
    const mockData = {
      success: true,
      data: [
        {
          id: "1",
          title: "Java基础入门",
          type: "基础路线",
          level: "初级",
          content: "学习Java语法、面向对象编程",
          duration: "3个月",
          steps: ["环境搭建", "基础语法", "面向对象", "集合框架"],
        },
        {
          id: "2",
          title: "Java进阶提升",
          type: "进阶路线",
          level: "中级",
          content: "深入学习JVM、多线程、网络编程",
          duration: "6个月",
          steps: ["JVM原理", "并发编程", "网络编程", "框架学习"],
        },
        {
          id: "3",
          title: "Java架构师之路",
          type: "高级路线",
          level: "高级",
          content: "微服务架构、分布式系统设计",
          duration: "12个月",
          steps: ["微服务", "分布式", "性能优化", "系统设计"],
        },
        {
          id: "4",
          title: "Spring全家桶",
          type: "进阶路线",
          level: "中级",
          content: "掌握Spring Boot、Spring Cloud等框架",
          duration: "4个月",
          steps: ["Spring Core", "Spring Boot", "Spring Cloud", "实战项目"],
        },
        {
          id: "5",
          title: "数据库与缓存",
          type: "基础路线",
          level: "初级",
          content: "MySQL、Redis等数据存储技术",
          duration: "2个月",
          steps: ["SQL基础", "MySQL优化", "Redis应用", "实战练习"],
        },
      ],
      total: 5,
      timestamp: new Date().toISOString(),
    };

    return {
      exec_pin: true,
      data: JSON.stringify(mockData),
      status: "success",
    };
  },
});
