import request from '@/utils/request'

/**
 * 获取学习分析报告数据
 * @returns {Promise} 返回学习分析数据
 */
export function getLearningAnalysisReport() {
  return request({
    url: '/api/aiReport/latest',
    method: 'get'
  })
}

/**
 * 获取所有目标
 * @returns {Promise} 返回所有目标数据
 */
export function getAllGoals() {
  return request({
    url: '/api/goals/getGoalsByUserId',
    method: 'get'
  })
}

/**
 * 获取未完成的目标
 * @returns {Promise} 返回未完成的目标数据
 */
export function getUnfinishedGoals() {
  return request({
    url: '/api/goals/getFinishedGoals',
    method: 'get'
  })
}