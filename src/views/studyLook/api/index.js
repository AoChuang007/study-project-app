import request from '@/utils/request'

/**
 * 获取学习分析数据
 * @returns {Promise} 返回学习分析数据
 */
export function getLearningAnalysis() {
  return request({
    url: '/api/learningReport/latest',
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