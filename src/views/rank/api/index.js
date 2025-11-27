import request from '@/utils/request';

// 获取学习统计数据
export const getStudyStats = () => request.get('/studyTime/getStudyTimeByUserId');

// 获取排行榜数据 - 学习时长日榜
export const getDailyStudyTimeRank = () => request.get('/studyTime/getDailyHoursTop10');

// 获取排行榜数据 - 学习时长总榜
export const getTotalStudyTimeRank = () => request.get('/studyTime/getTotalHoursTop10');

// 获取排行榜数据 - 积分排行
export const getPointsRank = () => request.get('/studyTime/getPointTop10');

// 根据userId查询用户信息
export const getUserInfoById = (userId) => request.get(`/user/getUser?userId=${userId}`);