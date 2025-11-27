import request from '@/utils/request';

export const getStudyTimeByUserId = () => request.get(`/studyTime/getStudyTimeByUserId`);