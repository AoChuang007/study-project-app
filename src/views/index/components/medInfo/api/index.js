import request from '@/utils/request';
//分类接口
export const getCategoryData = (params) => request.post(`/zy/listPartByCat`, params);
