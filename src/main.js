import { registerGlobComp } from "@/components/registerGlobComp";
import { initUserTracking, trackUniqueVisitor } from "@/utils/analytics";
import { initRem } from "@/utils/rem";
import * as Sentry from "@sentry/vue";
import {
  Cell,
  CellGroup,
  Circle,
  ConfigProvider,
  DatePicker,
  Dialog,
  Field,
  FloatingBubble,
  Popover,
  Progress,
  Rate,
  Search,
  ShareSheet,
  Sticky,
  Switch,
  TextEllipsis,
  Toast,
  Uploader,
} from "vant";
import { createApp } from "vue";
import App from "./App.vue";
import { setupGlobDirectives } from "./directives";

const app = createApp(App);

// 引入注册脚本 - svg
import "virtual:svg-icons-register";
// // px 自动转 rem 插件
// import "lib-flexible";
// 引入路由
import router from "@/router/index";
// 引入 pinia
import { store } from "@/store/index";

// 初始化 Sentry
Sentry.init({
  app,
  dsn: "https://6e61ac37125207f67b474e3ee6c2d2bb@o4510435892920320.ingest.us.sentry.io/4510435894951936",
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  // 性能监控采样率
  tracesSampleRate: 1.0,
  // Session Replay 采样率
  replaysSessionSampleRate: 0.1,
  // 错误时的 Replay 采样率
  replaysOnErrorSampleRate: 1.0,
  // 环境
  environment: import.meta.env.MODE,
});

// 测试 Sentry metrics API 是否可用
console.log("Sentry metrics API:", Sentry.metrics);
console.log("Available methods:", Object.keys(Sentry.metrics || {}));

// 尝试发送测试指标
try {
  if (Sentry.metrics) {
    if (typeof Sentry.metrics.count === "function") {
      Sentry.metrics.count("app_started", 1);
      console.log("✅ Sentry metrics.count 可用");
    }
    if (typeof Sentry.metrics.gauge === "function") {
      Sentry.metrics.gauge("app_load_time", performance.now());
      console.log("✅ Sentry metrics.gauge 可用");
    }
    console.log("✅ Sentry metrics 集成成功");
  } else {
    console.warn("⚠️ Sentry.metrics API 不可用");
  }
} catch (error) {
  console.error("❌ Sentry metrics 发送失败111:", error);
}

// 初始化用户追踪和统计
initUserTracking();
trackUniqueVisitor();

// 注册全局指令
setupGlobDirectives(app);
// 注册全局组件
registerGlobComp(app);
// 设计稿 rem 适配由路由参数控制（isOpenAdaptive=true 不启用 rem）

app.component(Cell.name, Cell);
app.component(CellGroup.name, CellGroup);

app
  .use(ConfigProvider)
  .use(router)
  .use(store)
  .use(Circle)
  .use(Search)
  .use(Rate)
  .use(ShareSheet)
  .use(TextEllipsis)
  .use(Dialog)
  .use(Switch)
  .use(Popover)
  .use(Progress)
  .use(Sticky)
  .use(Uploader)
  .use(Field)
  .use(DatePicker)
  .use(Toast)
  .use(FloatingBubble)
  .mount("#app");

// 在路由就绪后安全地读取查询参数（例如 isOpenAdaptive）
router.isReady().then(() => {
  const query = router.currentRoute.value?.query || {};
  const isOpenAdaptive = query.isOpenAdaptive;
  app.config.globalProperties.$isOpenAdaptive = isOpenAdaptive;
  const adaptiveOn = isOpenAdaptive === true || isOpenAdaptive === "true";
  if (!adaptiveOn) {
    initRem();
  }
});
