import Cookie from "js-cookie";

const Token = "token";

// Token相关操作
export function getToken() {
  return Cookie.get(Token);
}

export function setToken(token, options = {}) {
  const defaultOptions = {
    expires: 7, // 7天过期
    secure: window.location.protocol === 'https:', // HTTPS环境下启用secure
    sameSite: 'strict', // 防止CSRF攻击
    ...options
  };
  return Cookie.set(Token, token, defaultOptions);
}

export function removeToken() {
  return Cookie.remove(Token);
}
