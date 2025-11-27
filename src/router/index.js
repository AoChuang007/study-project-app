import useSettingsStore from "@/store/modules/settings";
import setPageTitle from "@/utils/set-page-title";
import { trackPageView } from "@/utils/analytics";
import { createRouter, createWebHashHistory } from "vue-router";

let routes = [
  {
    path: "/",
    redirect: "/guideO",
  },
  {
    path: "/test-error",
    name: "TestError",
    meta: { title: "错误测试" },
    component: () => import("@/views/testError/index.vue"),
  },
  {
    path: "/index",
    name: "Index",
    meta: { title: "首页", keepAlive: true },
    component: () => import("@/views/index/index.vue"),
  },
  {
    path: "/baodian",
    name: "baodian",
    meta: { title: "宝典" },
    component: () => import("@/views/baoDian/index.vue"),
    children: [
      {
        path: "content",
        name: "content",
        component: () => import("@/views/baoDian/components/content.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    meta: { title: "登录页" },
    component: () => import("@/views/Login/index.vue"),
  },
  {
    path: "/personalCenter",
    name: "personalCenter",
    meta: { title: "个人中心" },
    component: () => import("@/views/personalCenter/index.vue"),
  },
  {
    path: "/personalCenter/message",
    name: "personalMessage",
    meta: { title: "个人信息" },
    component: () => import("@/views/personalCenter/components/message.vue"),
  },
  {
    path: "/personalCenter/stydyBehaviour",
    name: "stydyBehaviour",
    meta: { title: "学习行为日历" },
    component: () =>
      import("@/views/personalCenter/components/stydyBehaviour.vue"),
  },
  {
    path: "/personalCenter/moreBage",
    name: "moreBage",
    meta: { title: "更多勋章" },
    component: () => import("@/views/personalCenter/components/moreBage.vue"),
  },
  {
    path: "/report",
    name: "report",
    meta: { title: "智能报告" },
    component: () => import("@/views/report/index.vue"),
  },
  {
    path: "/studyLook",
    name: "studyLook",
    meta: { title: "学习看板" },
    component: () => import("@/views/studyLook/index.vue"),
  },
  {
    path: "/target",
    name: "target",
    meta: { title: "目标管理" },
    component: () => import("@/views/target/index.vue"),
  },
  {
    path: "/addTarget",
    name: "addTarget",
    meta: { title: "添加目标" },
    component: () => import("@/views/target/addTarget.vue"),
  },
  {
    path: "/target/details",
    name: "targetDetails",
    meta: { title: "目标详情" },
    component: () => import("@/views/target/components/details.vue"),
  },
  {
    path: "/target/timekeeping",
    name: "timekeeping",
    meta: { title: "计时打卡" },
    component: () => import("@/views/target/components/timekeeping.vue"),
  },
  {
    path: "/tree",
    name: "tree",
    meta: { title: "爬树乐园" },
    component: () => import("@/views/tree/index.vue"),
  },
  {
    path: "/tree/rank",
    name: "treeRank",
    meta: { title: "排行榜" },
    component: () => import("@/views/rank/index.vue"),
  },
  {
    path: "/tree/shopping",
    name: "treeShopping",
    meta: { title: "积分商城" },
    component: () => import("@/views/tree/components/shopping.vue"),
  },
  {
    path: "/tree/passLevels",
    name: "treePassLevels",
    meta: { title: "闯关题目" },
    component: () => import("@/views/tree/components/passLevels.vue"),
  },
  {
    path: "/tree/history",
    name: "treeHistory",
    meta: { title: "历史记录" },
    component: () => import("@/views/tree/components/history.vue"),
  },
  {
    path: "/rank/selfInformation",
    name: "selfInformation",
    meta: { title: "个人信息" },
    component: () => import("@/views/rank/components/selfInformation.vue"),
  },
  {
    path: "/guideO",
    name: "guideO",
    meta: { title: "引导页" },
    component: () => import("@/views/guideO/index.vue"),
  },
  {
    path: "/aiAssistant",
    name: "aiAssistant",
    meta: { title: "AI助手" },
    component: () => import("@/views/aiAssistant/index.vue"),
  },
  {
    path: "/aiAssistant/chat",
    name: "aiAssistantChat",
    meta: { title: "AI对话" },
    component: () => import("@/views/aiAssistant/chat.vue"),
  },
];
// 路由
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // scrollBehavior: () => ({ left: 0, top: 0 }),
  scrollBehavior(to, from, savePosition) {
    // console.log('savePosition:', savePosition);
    if (savePosition) {
      // 解决页面从列表页跳转到详情页返回,初始在原来位置
      return savePosition;
    } else {
      // 解决页面跳转后页面高度和前一个页面高度一样
      return { left: 0, top: 0 };
    }
  },
});

// 导航守卫
router.beforeEach((to, from, next) => {
  to.meta.title && useSettingsStore().setTitle(to.meta.title);
  // Set page title
  // setPageTitle(to.meta.title);
  setPageTitle(to.meta.title);

  // 追踪页面浏览 (PV)
  trackPageView(to.meta.title || to.name || to.path, to.fullPath);

  next();
});
// 导出
export default router;
