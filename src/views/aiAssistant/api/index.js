import request from "@/utils/request";
import axios from "axios";

// 创建专门用于流式响应的axios实例，不使用拦截器
const streamRequest = axios.create({
  baseURL: "http://47.109.142.124:8080",
  timeout: 120 * 1000,
});

// 发送消息到AI助手 - 流式响应
export const sendMessageToAI = async (text, onChunk) => {
  try {
    // 使用专门的流式请求实例，绕过响应拦截器
    const response = await streamRequest({
      url: "/api/goals/talkToAi", // 替换为真实的API端点
      method: "GET",
      params: {
        text: text, // 使用text作为查询参数
      },
      // 如果后端支持流式响应，可以配置responseType
      responseType: "stream",
    });

    // 处理流式响应数据（绕过拦截器后直接获取response.data）
    const responseData = response.data;
    if (responseData) {
      // 尝试不同的数据结构
      const fullResponse =
        responseData.content ||
        responseData.message ||
        responseData.data ||
        responseData ||
        "";
      const responseText =
        typeof fullResponse === "string"
          ? fullResponse
          : JSON.stringify(fullResponse);
      const chunks = responseText.split("");

      // 模拟流式返回效果
      for (let i = 0; i < chunks.length; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, 30 + Math.random() * 50)
        );

        if (onChunk) {
          onChunk({
            success: true,
            data: {
              id: Date.now() + Math.random(),
              content: chunks[i],
              isComplete: i === chunks.length - 1,
              timestamp: new Date().toISOString(),
              type: "ai",
            },
          });
        }
      }

      return {
        success: true,
        data: {
          id: Date.now() + Math.random(),
          content: responseText,
          timestamp: new Date().toISOString(),
          type: "ai",
        },
      };
    }

    throw new Error("Invalid response format");
  } catch (error) {
    console.error("AI接口调用失败:", error);
    // 处理不同类型的错误
    let errorMessage = "网络连接失败，请稍后重试";
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error && error.message) {
      errorMessage = error.message;
    } else if (error && error.msg) {
      errorMessage = error.msg;
    }

    return {
      success: false,
      error: errorMessage,
      data: null,
    };
  }
};

// 获取提示词列表 - 使用假数据
export const getPromptSuggestions = async () => {
  // 直接返回默认提示词，不调用真实接口
  return {
    success: true,
    data: [
      { id: 1, content: "帮我制定一个学习计划" },
      { id: 2, content: "解释一下人工智能的基本概念" },
      { id: 3, content: "推荐一些编程学习资源" },
      { id: 4, content: "如何提高学习效率？" },
    ],
  };
};

// 获取用户信息
export const getUserInfo = async () => {
  try {
    const response = await request({
      url: "/api/user/getUserInfo", // 替换为真实的API端点
      method: "GET",
    });

    if (response.success) {
      return response.data;
    }

    throw new Error("Failed to fetch user info");
  } catch (error) {
    console.error("获取用户信息失败:", error);
    // 返回默认用户信息作为fallback
    return {
      id: "user_001",
      name: "学习者",
      avatar: "src/assets/rank/picture8.png",
    };
  }
};

// 获取AI助手信息
export const getAIInfo = () => {
  return {
    id: "ai_assistant",
    name: "AI学习助手",
    avatar: "src/assets/aiAssistant/head.png",
  };
};
