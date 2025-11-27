import request from '@/utils/request';
//收藏接口
export const togoCollect = (params) => request.post(`/collection/add`, params);