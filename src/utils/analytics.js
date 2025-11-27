/*
 * @Author: Chuang Ao chuang.ao@ly.com
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-11-27 16:54:06
 * @FilePath: /study-ai-zy-dev_0602 2/src/utils/analytics.js
 */
import * as Sentry from "@sentry/vue";
import Cookies from "js-cookie";

// 生成唯一用户ID
function getOrCreateUserId() {
  const COOKIE_KEY = "user_visitor_id";
  let userId = Cookies.get(COOKIE_KEY);

  if (!userId) {
    userId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // 设置cookie，有效期365天
    Cookies.set(COOKIE_KEY, userId, { expires: 365 });
  }

  return userId;
}

// 初始化用户标识
export function initUserTracking() {
  const userId = getOrCreateUserId();

  // 设置 Sentry 用户信息
  Sentry.setUser({
    id: userId,
  });

  return userId;
}

// 追踪 PV (页面浏览)
export function trackPageView(pageName, pageUrl) {
  const userId = getOrCreateUserId();

  // 使用 Sentry metrics count 记录 PV
  if (Sentry.metrics && typeof Sentry.metrics.count === "function") {
    Sentry.metrics.count("page_view", 1);
  }

  // 使用 Sentry 上下文记录详细信息
  Sentry.setContext("page_view", {
    page: pageName,
    url: pageUrl,
    userId: userId,
    timestamp: new Date().toISOString(),
  });

  // 添加面包屑用于调试和统计
  Sentry.addBreadcrumb({
    category: "navigation",
    message: `Page View: ${pageName}`,
    level: "info",
    data: {
      url: pageUrl,
      userId,
      type: "pv",
    },
  });
}

// 追踪 UV (独立访客)
export function trackUniqueVisitor() {
  const userId = getOrCreateUserId();
  const LAST_VISIT_KEY = "last_visit_date";
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);

  // 如果是新的一天的第一次访问，记录 UV
  if (lastVisit !== today) {
    localStorage.setItem(LAST_VISIT_KEY, today);

    // 使用 Sentry metrics count 记录 UV
    if (Sentry.metrics && typeof Sentry.metrics.count === "function") {
      Sentry.metrics.count("unique_visitor", 1);
    }

    // 使用 Sentry 上下文记录详细信息
    Sentry.setContext("unique_visitor", {
      date: today,
      isNewVisitor: !lastVisit,
      userId: userId,
      lastVisitDate: lastVisit || "first_visit",
      timestamp: new Date().toISOString(),
    });

    // 添加面包屑记录 UV
    Sentry.addBreadcrumb({
      category: "analytics",
      message: "Unique Visitor",
      level: "info",
      data: {
        date: today,
        isNewVisitor: !lastVisit,
        userId,
        type: "uv",
      },
    });
  }
}

// 追踪自定义指标
export function trackMetrics(metricName, value, type = "count", tags = {}) {
  // 使用 Sentry metrics API 记录自定义指标
  if (Sentry.metrics) {
    if (type === "count" && typeof Sentry.metrics.count === "function") {
      Sentry.metrics.count(metricName, value);
    } else if (type === "gauge" && typeof Sentry.metrics.gauge === "function") {
      Sentry.metrics.gauge(metricName, value);
    } else if (
      type === "distribution" &&
      typeof Sentry.metrics.distribution === "function"
    ) {
      Sentry.metrics.distribution(metricName, value);
    }
  }

  // 同时使用 Sentry 上下文和面包屑记录
  Sentry.setContext("custom_metric", {
    name: metricName,
    value: value,
    type: type,
    ...tags,
    timestamp: new Date().toISOString(),
  });

  Sentry.addBreadcrumb({
    category: "metric",
    message: `Metric: ${metricName}`,
    level: "info",
    data: {
      value,
      type,
      ...tags,
    },
  });
}

// 获取统计数据（从本地存储）
export function getAnalyticsData() {
  const userId = getOrCreateUserId();
  const lastVisit = localStorage.getItem("last_visit_date");

  return {
    userId,
    lastVisit,
    isNewVisitor: !lastVisit,
  };
}
