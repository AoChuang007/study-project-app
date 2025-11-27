
import formRequest from "@/utils/formRequest";

// 发送验证码 - 使用 form-urlencoded 格式
export const getSms = (phone) => formRequest.post(`/user/sendSms`, { phone });
// 登录 - 使用 form-urlencoded 格式
export const getUserLogin = (params) => formRequest.post(`/user/checkSms`, params);