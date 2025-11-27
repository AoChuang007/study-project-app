import request from '@/utils/request';
import { getToken } from '@/utils/auth';

/**
 * 获取一年的打卡数据
 * @param {number} year - 年份
 * @returns {Promise} 返回一年的打卡数据
 */
export const getOneYearCheckIn = (year) => {
  return request.get('/checkIn/getOneYearCheckIn', {
    params: {
      year
    },
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
};

/**
 * 获取今日打卡状态
 * @returns {Promise} 返回今日打卡状态
 */
export function getTodayCheckInStatus() {
  return request.get('/checkIn/isCheckIn', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
}

/**
 * 获取连续打卡天数
 * @returns {Promise} 返回连续打卡天数
 */
export function getContinuousDays() {
  return request.get('/checkIn/getCurrentStreak', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
}

/**
 * 签到接口
 * @returns {Promise} 返回签到结果
 */
export const checkIn = () => {
  const token = localStorage.getItem('token');
  return request.post('/checkIn/userCheckIn', {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};