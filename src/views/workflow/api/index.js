/*
 * @Author: Chuang Ao chuang.ao@ly.com
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-04 17:03:13
 * @FilePath: /study-ai-zy-dev_0602 2/src/views/workflow/api/index.js
 */
import axios from "axios";
import { getToken } from "@/utils/auth";

// 创建一个独立的 axios 实例，用于工作流 API
// 因为该接口返回格式是 { success: true, data: [...] }，与主 request 拦截器不兼容
const workflowRequest = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL || "https://study.tagtax.cn",
  timeout: 120 * 1000,
});

// 请求拦截器
workflowRequest.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = token;
    }
    config.headers.nonce = Date.parse(new Date());
    config.headers.clientType = "H5";
    config.headers.clientVersion = "2.2.1";
    config.headers.timestamp = Date.parse(new Date());
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 直接返回 data
workflowRequest.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

/**
 * 获取工作流数据
 * @returns {Promise} 返回学习分析数据
 */
export function getWorkFlowData(text) {
  return workflowRequest({
    url: `/web/getLearnPath?text=${text}`,
    method: "get",
  });
}
