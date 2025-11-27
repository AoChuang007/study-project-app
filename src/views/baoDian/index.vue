<template>
  <div class="container">
    <!-- 顶部标题栏 -->
    <!-- <div class="title">
			<img class="left" src="/src/assets/images/category/img2.png" />
			<h1>中医药宝典</h1>
			<img class="right" src="/src/assets/images/category/img1.png" />
		</div> -->
    <NavBar :leftArrow="false" title="中医药宝典"></NavBar>
    <div>
      <div>
        <img src="@/assets/images/baodian/title.png" alt="导航" />
        <div class="selector">
          <div class="item" v-for="(items, index) in selectorData" :key="index">
            <img :src="items.src" />
            <span>{{ items.title }}</span>
          </div>
        </div>
      </div>
      <img src="@/assets/images/baodian/gudian.png" alt="导航" />
    </div>

    <!-- 内容区 -->
    <div class="content">
      <ContentInfo :testData="testData" />
    </div>

    <!-- 底部导航 -->
    <tab-bar></tab-bar>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ContentInfo from "./components/content.vue";

const router = useRouter();
const route = useRoute();
const title = ref(route.query.title);
const essay = (title) => {
  router.push({
    path: "/essay",
    query: {
      title: title,
    },
  });
};

//测试数据
const testData = [
  {
    id: 1,
    title: "神农尝百草",
    content:
      " 神农尝百草是中国传统文化中的一个著名传说，讲述的是远古时期，神农氏（也称炎帝）为了寻找可以治疗疾病的草药，亲自尝试各种植物，以确定它们的药用价值。",
  },
  {
    id: 2,
    title: "太乙仙制本草药性大全",
    content:
      " 《（新刻）太乙仙制本草药性大全》八卷。王文洁（字冰鉴，号无为子）撰。约成书于明万历初年（1573）。又名《先师太乙仙制雷公炮制》、《仙制药性》",
  },
  {
    id: 3,
    title: "伤寒杂症",
    content:
      "《伤寒杂症》是《伤寒论》的 companion book，由《伤寒论》的作者王文杰（字冰鉴，号无为子）于明万历初年（1573）编写。",
  },
  {
    id: 4,
    title: "简易普济良方",
    content:
      "《简易普济良方》，六卷。明代彭用光编，成书于明嘉靖四十年(1561)。原为六卷，现存孤本五卷，缺卷一。卷二至六，共分中风、诸风、伤寒、瘟疫等八十门，分类汇集各科医方。",
  },
  {
    id: 5,
    title: "众妙仙方",
    content:
      "《珍本古医籍影印丛书:众妙仙方(套装全4册)》为明代方书，分补养、子嗣、稀痘、痰嗽、疟疾、脾胃、痢疾、泄泻等60门，载方1600余首。所载以简便验方居多，名方如龟鹿二仙丹、五子衍宗丸、定喘汤、史国公药酒、普济消毒饮、仙方活命饮等皆收入其中，方药修合制备细致周详，或有他书不备者，于今成药修制甚有参考价值。",
  },
  {
    id: 6,
    title: "伤寒杂症",
    content:
      "《伤寒杂症》是《伤寒论》的 companion book，由《伤寒论》的作者王文",
  },
  {
    id: 7,
    title: "黄帝内经",
    content:
      "《黄帝内经》是中国最早的医学典籍，传统医学四大经典著作之一。分为《灵枢》与《素问》两部分。",
  },
  {
    id: 8,
    title: "千金要方",
    content:
      "《千金要方》由唐代孙思邈编著，共三十卷，涉及内科、外科、妇科、儿科等多个领域。",
  },
  {
    id: 9,
    title: "本草纲目",
    content:
      "《本草纲目》由明代李时珍编著，是中药学的重要著作，详细记载了各种药材的功效。",
  },
  {
    id: 10,
    title: "温病条辨",
    content: "《温病条辨》是清代吴鞠通所著，专门讨论温热病证治的医学著作。",
  },
  {
    id: 11,
    title: "金匮要略",
    content: "《金匮要略》是张仲景所著，主要讲述内科杂病的治疗原则。",
  },
  {
    id: 12,
    title: "针灸甲乙经",
    content: "《针灸甲乙经》由皇甫谧编著，是关于针灸疗法的经典之作。",
  },
  {
    id: 13,
    title: "神农本草经",
    content: "《神农本草经》是最早的一部药物学著作，记载了365种药物。",
  },
  {
    id: 14,
    title: "肘后备急方",
    content: "《肘后备急方》由葛洪编著，是一部应急医疗手册，便于携带使用。",
  },
  {
    id: 15,
    title: "外科正宗",
    content: "《外科正宗》由明代陈实功编著，是关于外科疾病治疗的权威书籍。",
  },
  {
    id: 16,
    title: "妇人大全良方",
    content: "《妇人大全良方》由宋代陈自明编著，专门论述妇科疾病的治疗。",
  },
  {
    id: 17,
    title: "幼幼集成",
    content: "《幼幼集成》由清代夏禹铸编著，是儿科疾病治疗的重要参考书。",
  },
  {
    id: 18,
    title: "医学心悟",
    content: "《医学心悟》由清代程钟龄编著，强调治病须从整体出发，注重调养。",
  },
  {
    id: 19,
    title: "医学衷中参西录",
    content: "《医学衷中参西录》由张锡纯编著，探讨中医与西医结合的可能性。",
  },
  {
    id: 20,
    title: "医宗金鉴",
    content: "《医宗金鉴》由清代徐春甫编著，是一部全面总结前人经验的医学巨著。",
  },
  {
    id: 21,
    title: "十八反十九畏",
    content:
      "《神农本草经·序例》指出“勿用相恶、相反者”，“若有毒宜制，可用相畏、相杀者尔，勿合用也”。",
  },
];

const selectorData = [
  { src: "../../assets/images/baodian/book.png", title: "经典医书" },
  { src: "../../assets/images/baodian/zhongyao.png", title: "中医药方" },
  { src: "../../assets/images/baodian/ill.png", title: "自查疾病" },
  { src: "../../assets/images/baodian/food.png", title: "药膳食材" },
];

onMounted(() => {
  router.push({ path: "/baodian/content" });
});
</script>

<style lang="less" scoped>
.container {
  position: relative;
  height: 100vh;
  /* 设置容器高度为视口高度 */
  overflow: hidden;
  /* 隐藏溢出内容 */

  .title {
    width: 100%;
    height: 52px;
    background-color: rgba(192, 223, 124, 1);
    display: flex;
    flex-direction: row;
    position: sticky;
    /* 使标题栏固定 */
    top: 0;
    /* 确保标题栏始终位于顶部 */
    z-index: 1;

    /* 提升层级，确保覆盖其他元素 */
    h1 {
      font-size: 20px;
      line-height: 30px;
      color: rgba(6, 18, 30, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      text-shadow: 3px 3px 2px #fff;
    }

    .left {
      padding-left: 20px;
      margin-right: auto;
    }

    .right {
      padding-right: 20px;
      margin-left: auto;
    }
  }

  .selector {
    position: absolute;
    top: 58px;
    left: 100px;
    width: 280px;
    display: flex;
    justify-content: space-around;
    .item {
      display: flex;
      align-items: center;
      flex-direction: column;
      img {
        width: 35px;
      }
      span {
        /** 文本1 */
        font-size: 11px;
        font-weight: 700;
        color: rgba(56, 56, 56, 1);
      }
    }
  }

  .content {
    width: 100%;
    overflow-y: auto;
    /* 允许垂直滚动 */
  }

  .tab-bar {
    position: fixed;
    /* 使底部导航固定 */
    bottom: 0;
    /* 确保底部导航始终位于底部 */
    left: 0;
    right: 0;
    z-index: 1;
    /* 提升层级，确保覆盖其他元素 */
  }
}
</style>
