import request from '@/utils/request'
import { postForm } from '@/utils/formRequest';   // 注意解构引入
import { getToken } from '@/utils/auth';   // 导入getToken函数

export const recordPunchEvent = (params) => {
  const token = getToken() || '';  // 从Cookie获取token
  return postForm('/api/goals/learnTask', params, token);       // 用 postForm 转码
};
// 创建目标
export const createGoalsByAi = (params) => request.post(`/api/goals/createGoalsByAi`, params)
// 清理数据
export const cleanDataByAi = (params) => request.post(`/api/goals/cleanDataByAi`, params)

// 删除目标
export const deleteGoal = (id) => request.delete(`/api/goals/deleteGoal?id=${id}`)
// 获取父目标
export const getGoalsByUserId = () => request.get(`/api/goals/getGoalsByUserId`)
// 根据目标id获取子目标
export const getSubGoalsByGoalId = (id) => request.get(`/api/goals/getTasksByGoalId?id=${id}`)

// 修改子目标的预计时间
export const updateSubGoalHours = (params) => {
  const token = getToken() || '';
  return postForm('/api/goals/updateTaskEstimatedHour', params, token);
};

// 修改父目标的结束时间
export const updateGoalEndDate = (params) => {
  const token = getToken() || '';
  return postForm('/api/goals/updateGoalEndDate', params, token);
};
