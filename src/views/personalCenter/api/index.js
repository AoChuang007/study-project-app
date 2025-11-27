import request from '@/utils/request';

export const logOut = () => request.post(`/api/user/logout`);

// 获取用户已拥有的勋章
export const getUserObtainedBadges = () => request.get(`/badge/getUserBadges`);

// 获取用户未拥有的勋章
export const getUserUnobtainedBadges = () => request.get(`/badge/getUnearnedBadges`);

// 获取用户信息
export const getUserInfo = () => request.get(`/user/getUserInfo`);