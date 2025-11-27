/*
 * @Author: chuang.ao chuang.ao@ly.com
 * @LastEditors: chuang.ao chuang.ao@ly.com
 * @LastEditTime: 2025-08-30 21:53:20
 * @FilePath: /study-ai-zy-dev_0602/src/views/target/api/orc-api.ts
 */
import axios from "axios";

const getAccessToken = async () => {
  try {
    const response = await axios.post("/baidu-api/oauth/2.0/token", null, {
      params: {
        grant_type: "client_credentials",
        client_id: "eg8bYGNw0F0QYiC5xCqn93tm", // 替换为你的API Key
        // uQfBmCJJpA18LmEmJ19GuyIX
        // client_id: "uQfBmCJJpA18LmEmJ19GuyIX",
        client_secret: "y6HKFENy8uDnNLmWac4oJrC9Vply6d5y", // 替换为你的Secret Key
        // client_secret: "cG2T71SdzNUsev1T4ZtZvmvzzpMTNskk"
      },
    });
    return response.data.access_token;
  } catch (error) {
    throw error;
  }
};

let accessToken: string | null = null;

// 创建一个异步函数来获取配置了 access_token 的 axios 实例
const createOCRClient = async () => {
  if (!accessToken) {
    accessToken = await getAccessToken();
  }

  return axios.create({
    baseURL: "/baidu-api/rest/2.0/ocr/v1/accurate?access_token=" + accessToken,
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  });
};

export default createOCRClient;
