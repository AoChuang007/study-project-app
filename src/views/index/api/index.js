import request from '@/utils/request';
//首页接口
export const getHomeData = (params) => request.post(`/zy/listPartByCat`, params);