import request from '@/utils/request';

export const getUserLevels = () => request.get(`/api/levels/getUserLevels`)

// 默认题目数据
const defaultQuestions = {
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "questionText": "What is the past participle of the verb 'go'?",
      "optionA": "gone",
      "optionB": "went",
      "optionC": "going",
      "optionD": "goed",
      "correctAnswer": null,
      "difficultyLevel": 1,
      "knowledgePoint": "Verb Tense",
      "explanation": "The past participle form of 'go' is 'gone'.",
      "createdAt": "2025-09-12T17:48:48.193188"
    },
    {
      "id": 2,
      "questionText": "Which of the following is a plural noun?",
      "optionA": "Child",
      "optionB": "Children",
      "optionC": "childs",
      "optionD": "childes",
      "correctAnswer": null,
      "difficultyLevel": 1,
      "knowledgePoint": "Noun Pluralization",
      "explanation": "The plural form of 'child' is 'children'.",
      "createdAt": "2025-09-12T17:48:48.193233"
    },
    {
      "id": 3,
      "questionText": "Choose the correct form of the word 'they' for the plural possessive pronoun.",
      "optionA": "theirs",
      "optionB": "their",
      "optionC": "they're",
      "optionD": "they",
      "correctAnswer": null,
      "difficultyLevel": 1,
      "knowledgePoint": "Pronouns",
      "explanation": "The plural possessive pronoun form of 'they' is 'theirs'.",
      "createdAt": "2025-09-12T17:48:48.193239"
    },
    {
      "id": 4,
      "questionText": "Which sentence uses the correct form of 'its'?",
      "optionA": "The cat is washing it's face.",
      "optionB": "The company changed it's policy.",
      "optionC": "The bird lost it's feathers.",
      "optionD": "The dog wagged it's tail.",
      "correctAnswer": null,
      "difficultyLevel": 2,
      "knowledgePoint": "Pronouns",
      "explanation": "All the sentences incorrectly use 'it's' when they should use 'its', which is the possessive pronoun.",
      "createdAt": "2025-09-12T17:48:48.193243"
    },
    {
      "id": 5,
      "questionText": "What is the opposite of 'expensive'?",
      "optionA": "cheap",
      "optionB": "dear",
      "optionC": "costly",
      "optionD": "expensiveness",
      "correctAnswer": null,
      "difficultyLevel": 1,
      "knowledgePoint": "Antonyms",
      "explanation": "The opposite of 'expensive' is 'cheap'.",
      "createdAt": "2025-09-12T17:48:48.193246"
    }
  ]
};

export const getQuestionById = async (levelId, goalIds) => {
  try {
    const response = await request.post(`/api/levels/startLevel`, { levelId, goalIds });
    return response;
  } catch (error) {
    console.warn('接口调用失败，使用默认题目数据:', error);
    // 返回默认题目数据
    return Promise.resolve(defaultQuestions);
  }
}

// 提交答案接口
export const submitAnswers = async (levelId, userAnswers) => {
  try {
    const response = await request.post(`/api/levels/submitAnswers`, {
      levelId,
      userAnswers
    });
    return response;
  } catch (error) {
    console.warn('提交答案接口调用失败，使用默认返回数据:', error);
    // 返回默认数据结构
    return Promise.resolve({
      code: 200,
      msg: "success",
      data: {
        id: 1,
        userId: 5,
        levelId: levelId || 1,
        starsEarned: 1,
        score: 40,
        totalQuestions: 5,
        correctAnswers: 2,
        completionTime: null
      }
    });
  }
}
// 获取用户历史记录
export function getUserHistory() { 
  return request({
    url: '/api/levels/getAllHistory',
    method: 'get'
  })
}
