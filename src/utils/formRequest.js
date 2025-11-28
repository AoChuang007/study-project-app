import router from "@/router";
import axios from "axios";
import { showToast } from "vant";

import { removeToken } from "@/utils/auth";

import nprogress from "nprogress";

import "nprogress/nprogress.css";

// 设置基础URL：前端直接请求后端（由环境变量控制）
const baseURL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://47.109.142.124:8080";

// 数据转换函数：将对象转换为 form-urlencoded 格式
const transformData = (data) => {
  if (!data) return "";

  // 如果已经是字符串格式，直接返回
  if (typeof data === "string") return data;

  // 如果是 URLSearchParams 对象，转换为字符串
  if (data instanceof URLSearchParams) return data.toString();

  // 将对象转换为 URLSearchParams
  const params = new URLSearchParams();
  for (const key in data) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      data[key] !== undefined &&
      data[key] !== null
    ) {
      params.append(key, data[key]);
    }
  }
  return params.toString();
};

// 创建专门用于 form-urlencoded 格式的 axios 实例
const formService = axios.create({
  baseURL, // URL地址
  timeout: 30 * 1000, // 优化超时时间为30秒
  transformRequest: [
    // 自定义数据转换，确保始终转换为 form-urlencoded 格式
    function (data, headers) {
      // 强制设置 Content-Type
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      // 转换数据
      return transformData(data);
    },
  ],
});

// 添加请求拦截器
formService.interceptors.request.use(
  (config) => {
    nprogress.start();

    // 设置通用 headers
    const commonHeaders = {
      nonce: Date.parse(new Date()),
      clientType: "H5",
      clientVersion: "2.2.1",
      timestamp: Date.parse(new Date()),
    };

    // 合并 headers（保持原有的Authorization头，如果存在的话）
    config.headers = {
      ...config.headers,
      ...commonHeaders,
    };

    // 确保 Content-Type 始终为 form-urlencoded
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";

    return config;
  },
  (error) => {
    nprogress.done();

    // 处理不同类型的错误
    if (error.code === "ECONNABORTED") {
      // 超时错误
      showToast("请求超时，请检查网络连接后重试");
    } else if (error.response) {
      // 服务器响应错误
      const status = error.response.status;
      if (status >= 500) {
        showToast("服务器内部错误，请稍后重试");
      } else if (status === 404) {
        showToast("请求的资源不存在");
      } else if (status === 401) {
        showToast("身份验证失败，请重新登录");
        removeToken();
        localStorage.removeItem("userInfo");
        router.replace({ path: "/login" });
      } else {
        showToast("网络请求失败，请重试");
      }
    } else if (error.request) {
      // 网络连接错误
      showToast("网络连接失败，请检查网络设置");
    } else {
      // 其他错误
      showToast("请求失败，请重试");
    }

    return Promise.reject(error);
  }
);

// 添加响应拦截器
formService.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      // 500005 用户没有token或者过期
      if (res.code == 500005) {
        removeToken();
        localStorage.removeItem("userInfo");
        router.replace({ path: "/login" });
        nprogress.done();
      }
      if (res.code == 100001 || res.code == 2000) {
        nprogress.done();
        showToast(res.msg);
      }
      return Promise.reject(res.msg);
    } else {
      nprogress.done();
      return Promise.resolve(res);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const postForm = (url, data, token = "") => {
  const params = new URLSearchParams();
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      params.append(key, data[key]);
    }
  }
  return formService.post(url, params, {
    headers: token ? { Authorization: token } : {},
  });
};

// 保持默认导出不变
export default formService;
