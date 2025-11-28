// 模拟聊天API接口

// 模拟AI回复数据库
const aiResponses = [
  "你好！我是你的AI学习助手，很高兴为你服务！",
  "这是一个很好的问题，让我来为你详细解答。",
  "根据你的需求，我建议你可以从以下几个方面入手：\n1. 制定明确的学习目标\n2. 选择合适的学习资源\n3. 保持持续的学习习惯",
  "学习是一个循序渐进的过程，建议你制定合理的学习计划，每天坚持一点点进步。",
  "人工智能是一门综合性学科，涉及计算机科学、数学、认知科学等多个领域。主要包括机器学习、深度学习、自然语言处理等技术。",
  "编程学习需要理论与实践相结合，建议多做项目练习，从简单的项目开始，逐步提升难度。",
  "提高学习效率的方法有：\n• 番茄工作法：25分钟专注学习+5分钟休息\n• 费曼学习法：用简单的话解释复杂概念\n• 间隔重复：定期复习已学内容",
  "推荐一些优质的编程学习资源：\n• 在线平台：LeetCode、牛客网、GitHub\n• 视频教程：B站、慕课网、极客时间\n• 书籍：《算法导论》、《深入理解计算机系统》",
  "学习计划建议：\n1. 明确学习目标和时间安排\n2. 分解大目标为小任务\n3. 设置里程碑和奖励机制\n4. 定期回顾和调整计划",
  "遇到困难是学习过程中的正常现象，建议：\n• 保持耐心，不要急于求成\n• 寻求帮助，向老师或同学请教\n• 换个角度思考问题\n• 适当休息，避免过度疲劳",
];

// 根据关键词匹配更相关的回复
const getRelevantResponse = (message) => {
  const keywords = {
    学习计划:
      "学习计划建议：\n1. 明确学习目标和时间安排\n2. 分解大目标为小任务\n3. 设置里程碑和奖励机制\n4. 定期回顾和调整计划",
    人工智能:
      "人工智能是一门综合性学科，涉及计算机科学、数学、认知科学等多个领域。主要包括机器学习、深度学习、自然语言处理等技术。",
    编程: "编程学习需要理论与实践相结合，建议多做项目练习，从简单的项目开始，逐步提升难度。",
    效率: "提高学习效率的方法有：\n• 番茄工作法：25分钟专注学习+5分钟休息\n• 费曼学习法：用简单的话解释复杂概念\n• 间隔重复：定期复习已学内容",
    资源: "推荐一些优质的编程学习资源：\n• 在线平台：LeetCode、牛客网、GitHub\n• 视频教程：B站、慕课网、极客时间\n• 书籍：《算法导论》、《深入理解计算机系统》",
    困难: "遇到困难是学习过程中的正常现象，建议：\n• 保持耐心，不要急于求成\n• 寻求帮助，向老师或同学请教\n• 换个角度思考问题\n• 适当休息，避免过度疲劳",
  };

  // 检查消息中是否包含关键词
  for (const [keyword, response] of Object.entries(keywords)) {
    if (message.includes(keyword)) {
      return response;
    }
  }

  // 如果没有匹配的关键词，返回随机回复
  return aiResponses[Math.floor(Math.random() * aiResponses.length)];
};

// 模拟网络延迟
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 发送消息到AI助手
export const sendMessageToAI = async (message) => {
  try {
    // 模拟网络请求延迟
    await delay(800 + Math.random() * 1200); // 0.8-2秒随机延迟

    // 模拟API响应
    const response = {
      success: true,
      data: {
        id: Date.now() + Math.random(),
        content: getRelevantResponse(message),
        timestamp: new Date().toISOString(),
        type: "ai",
      },
    };

    return response;
  } catch (error) {
    return {
      success: false,
      error: "网络连接失败，请稍后重试",
      data: error.message,
    };
  }
};

// 获取提示词列表
export const getPromptSuggestions = async () => {
  try {
    await delay(300); // 模拟网络延迟

    const prompts = [
      { id: 1, content: "帮我制定一个学习计划" },
      { id: 2, content: "解释一下人工智能的基本概念" },
      { id: 3, content: "推荐一些编程学习资源" },
      { id: 4, content: "如何提高学习效率？" },
      { id: 5, content: "学习遇到困难怎么办？" },
      { id: 6, content: "如何保持学习动力？" },
    ];

    // 随机返回4个提示词
    const shuffled = prompts.sort(() => 0.5 - Math.random());

    return {
      success: true,
      data: shuffled.slice(0, 4),
    };
  } catch (error) {
    return {
      success: false,
      error: "获取提示词失败",
      data: [],
    };
  }
};

// 模拟用户认证状态
export const getUserInfo = () => {
  return {
    id: "user_001",
    name: "学习者",
    avatar: userAvatar,
  };
};

// 模拟AI助手信息
export const getAIInfo = () => {
  return {
    id: "ai_assistant",
    name: "AI学习助手",
    avatar: aiAvatar,
  };
};

import aiAvatar from "@/assets/aiAssistant/head.png";
import userAvatar from "@/assets/rank/picture8.png";
