import request from '@/utils/request';

// 登录 接口
export const getUserLogin = (params) => request.post(`/user/login`, params);
// 注册 接口
export const getUserRegister = (params) => request.post(`/user/register`, params);

