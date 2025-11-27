<template>
  <div class="test-error-page">
    <h1>Sentry 错误测试页面</h1>

    <div class="button-group">
      <van-button type="primary" @click="throwSyncError">
        触发同步错误
      </van-button>

      <van-button type="warning" @click="throwAsyncError">
        触发异步错误
      </van-button>

      <van-button type="danger" @click="throwUndefinedError">
        触发未定义错误
      </van-button>

      <van-button type="success" @click="throwCustomError">
        触发自定义错误
      </van-button>

      <van-button type="default" @click="throwNetworkError">
        触发网络错误
      </van-button>

      <van-button type="info" @click="testMetrics">
        测试 Metrics 指标
      </van-button>
    </div>

    <div class="info">
      <p>点击任意按钮触发错误，然后去 Sentry 控制台查看捕获的错误信息</p>
    </div>
  </div>
</template>

<script setup>
import * as Sentry from "@sentry/vue";
import { showToast } from "vant";

// 同步错误
const throwSyncError = () => {
  showToast("即将触发同步错误");
  // 故意访问未定义对象的属性
  const obj = null;
  console.log(obj.property); // 这会抛出错误
};

// 异步错误
const throwAsyncError = async () => {
  showToast("即将触发异步错误");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw new Error("这是一个异步错误测试哇哈红红火火恍恍惚惚哈哈哈哈哈哈哈");
};

// 未定义错误
const throwUndefinedError = () => {
  showToast("即将触发未定义错误");
  // 调用不存在的函数
  window.nonExistentFunction();
};

// 自定义错误（主动上报）
const throwCustomError = () => {
  showToast("发送自定义错误到 Sentry");

  // 主动捕获并上报错误
  Sentry.captureException(new Error("这是一个手动上报的自定义错误"), {
    level: "error",
    tags: {
      type: "manual_test",
      component: "test-error-page",
    },
    extra: {
      customData: "这是额外的调试信息",
      timestamp: new Date().toISOString(),
    },
  });

  showToast("错误已发送到 Sentry");
};

// 模拟网络错误
const throwNetworkError = async () => {
  showToast("即将触发网络错误");

  try {
    // 请求一个不存在的接口
    const response = await fetch(
      "https://api.example.com/nonexistent-endpoint-12345"
    );
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
  } catch (error) {
    // 上报网络错误
    Sentry.captureException(error, {
      tags: {
        type: "network_error",
      },
      extra: {
        url: "https://api.example.com/nonexistent-endpoint-12345",
      },
    });
    throw error;
  }
};

// 测试 Metrics 指标
const testMetrics = () => {
  showToast("测试 Metrics...");

  console.log("Sentry 对象:", Sentry);
  console.log("Sentry.metrics:", Sentry.metrics);

  setTimeout(() => {
    try {
      // 检查 metrics API
      if (Sentry.metrics) {
        console.log("Sentry.metrics 存在，方法:", Object.keys(Sentry.metrics));

        // 使用正确的方法名：count, distribution, gauge
        if (typeof Sentry.metrics.count === "function") {
          Sentry.metrics.count("button_click", 1);
          console.log("✅ button_click 计数发送成功");
        }

        if (typeof Sentry.metrics.gauge === "function") {
          Sentry.metrics.gauge("page_load_time", 150);
          console.log("✅ page_load_time 仪表盘发送成功");
        }

        if (typeof Sentry.metrics.distribution === "function") {
          Sentry.metrics.distribution("response_time", 200);
          console.log("✅ response_time 分布发送成功");
        }

        showToast("✅ Metrics 发送成功！请检查 Sentry 控制台");
        console.log("✅ 所有 Metrics 已成功发送到 Sentry");
      } else {
        // metrics API 不存在，使用替代方案
        console.warn("⚠️ Sentry.metrics 不存在");
        showToast("⚠️ Metrics API 不可用");
      }
    } catch (error) {
      showToast("❌ Metrics 发送失败");
      console.error("❌ Metrics 调用失败:", error);
    }
  }, 500);
};
</script>

<style lang="less" scoped>
.test-error-page {
  padding: 20px;
  min-height: 100vh;

  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-width: 400px;
    margin: 0 auto;

    .van-button {
      height: 50px;
      font-size: 16px;
    }
  }

  .info {
    margin-top: 40px;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: center;

    p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }
  }
}
</style>
