import router from '@/router';
import axios from 'axios';
import { showToast } from 'vant';

import { removeToken, getToken } from '@/utils/auth';

import nprogress from 'nprogress';

import 'nprogress/nprogress.css';

// 设置URL请求头
// const baseURL = 'http://8.137.119.69:8080';
// http://127.0.0.1:4523/m1/6758131-6469989-default/user/sendSms
// const { VITE_PORT } = import.meta.env;

// const baseURL = `http://116.62.102.235:${VITE_PORT}`;
// 修复：移除未定义的VITE_PORT变量，直接使用Apifox的完整URL
// const baseURL = 'http://127.0.0.1:4523/m1/6758131-6469989-default';
// Use Vercel proxy to avoid mixed-content/CORS issues in production
const baseURL = '/api/proxy';

// 创建axios实例
const service = axios.create({
	baseURL, // URL地址
	timeout: 120 * 1000, // 超时时间
	// headers: {
	// 	'Content-Type': 'application/json;charset=UTF-8',
	// },
});

// 添加请求拦截器
service.interceptors.request.use(
	(config) => {
		nprogress.start();
		
		// 从多个来源获取 token
		let token = null;
		
		// 1. 优先从请求数据中获取 token (POST请求)
		if (config.data && config.data.token) {
			token = config.data.token;
		}
		// 2. 从 Cookie 中获取 token (适用于所有请求类型)
		else {
			try {
				token = getToken();
			} catch (error) {
				console.warn('无法获取token:', error);
			}
		}
		
		const headers = {
			nonce: Date.parse(new Date()),
			clientType: 'H5',
			clientVersion: '2.2.1',
			timestamp: Date.parse(new Date()),
		};
		
		// 只有在有 token 时才添加 Authorization 头
		if (token) {
			// 检查token是否已经包含Bearer前缀
			// if (token.startsWith('Bearer ')) {
			// 	headers.Authorization = token;
			// } else {
			// 	headers.Authorization = `Bearer ${token}`;
			// }
			// 直接使用token，不添加Bearer前缀
    headers.Authorization = token;
		}
		
		config.headers = {
			...config.headers,
			...headers
		};
		
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);
// 添加响应拦截器
service.interceptors.response.use(
	(response) => {
		const res = response.data;
		if (res.code !== 200) {
			// 500005 用户没有token或者过期
			if (res.code == 500005) {
				removeToken();
				localStorage.removeItem('userInfo');
				router.replace({ path: '/login' });
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
	},
);
export default service;
