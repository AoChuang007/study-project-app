<template>
  <div class="assistant">
    <van-nav-bar class="nav" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
    <div class="iconBox">
      <!-- src\assets\aiAssistant\notebook.png -->
      <img src="@/assets/aiAssistant/notebook.png" alt="" class="notebook" />
      <img src="@/assets/aiAssistant/pencial.png" alt="" class="pencial" />
      <img src="@/assets/aiAssistant/book.png" alt="" class="book" />
      <img src="@/assets/aiAssistant/people.png" alt="" class="people" />
      <img src="@/assets/aiAssistant/plane.png" alt="" class="plane" />
      <img
        src="@/assets/aiAssistant/smallPlane.png"
        alt=""
        class="smallPlane"
      />
    </div>
    <span class="text"><span v-html="displayedText"></span></span>
    <div class="discrebBox">
      <div class="box1">
        <p class="text1">精准定位</p>
        <p class="text2">解决 “学什么” 的迷茫</p>
        <img src="@/assets/aiAssistant/icon1.png" alt="" class="icon1" />
      </div>
      <div class="box2">
        <p class="text1">复盘迭代</p>
        <p class="text2">解决 “学完没沉淀”</p>
        <img src="@/assets/aiAssistant/icon2.png" alt="" class="icon2" />
      </div>
      <div class="box3">
        <p class="text1">方法优化</p>
        <p class="text2">解决 “用错方法白费力”</p>
        <img src="@/assets/aiAssistant/icon3.png" alt="" class="icon3" />
      </div>
    </div>
    <div class="questionBox">
      <img src="@/assets/aiAssistant/icon4.png" alt="" class="icon4" />
      <input
        type="text"
        class="question"
        v-model="question"
        placeholder="在这里输入你的问题"
        @click="goToChat"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const route = useRouter();
const question = ref("");
const displayedText = ref("");

// 原始文本内容
const fullText = '我是小智，你的<span class="special">学习规划</span>助手';

const onClickLeft = () => {
  route.back();
};

// 跳转到聊天页面
const goToChat = () => {
  route.push("/aiAssistant/chat");
};

// 打字机效果
const startTypewriter = () => {
  // 将文本按照HTML标签分割成片段
  const segments = [];
  let tempText = fullText;

  // 分离HTML标签和普通文字
  const regex = /(<[^>]*>)/g;
  const parts = tempText.split(regex);

  parts.forEach((part) => {
    if (part.startsWith("<") && part.endsWith(">")) {
      // HTML标签作为整体
      segments.push({ type: "tag", content: part });
    } else if (part) {
      // 普通文字逐字分割
      for (let char of part) {
        segments.push({ type: "char", content: char });
      }
    }
  });

  let index = 0;
  let currentHtml = "";

  const typeInterval = setInterval(() => {
    if (index < segments.length) {
      const segment = segments[index];
      currentHtml += segment.content;
      displayedText.value = currentHtml;
      index++;
    } else {
      clearInterval(typeInterval);
    }
  }, 100); // 每100ms显示一个片段
};

// 随机跳动效果
const startRandomBounce = () => {
  const images = document.querySelectorAll(".iconBox img");

  images.forEach((img) => {
    // 排除pencial和book图片，它们不需要跳动效果
    if (img.classList.contains("people") || img.classList.contains("book")) {
      return;
    }

    // 为每个图片设置随机延迟
    const randomDelay = Math.random() * 2000; // 0-2秒随机延迟

    setTimeout(() => {
      img.classList.add("bounce-animation");

      // 设置随机间隔的持续跳动
      setInterval(
        () => {
          img.classList.remove("bounce-animation");
          setTimeout(() => {
            img.classList.add("bounce-animation");
          }, 100);
        },
        2000 + Math.random() * 3000
      ); // 2-5秒随机间隔
    }, randomDelay);
  });
};

onMounted(() => {
  // 页面加载后开始打字机效果
  setTimeout(() => {
    startTypewriter();
  }, 300);

  // 页面加载后开始随机跳动效果
  setTimeout(() => {
    startRandomBounce();
  }, 500);
});
</script>

<style lang="less" scoped>
.assistant {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);

  position: relative;
  .nav {
    background: transparent;
    --van-nav-bar-icon-color: #000;
  }
  .iconBox {
    .notebook {
      position: absolute;
      top: 100px;
    }
    .pencial {
      position: absolute;
      top: 47px;
      left: 53px;
    }
    .book {
      position: absolute;
      top: 168px;
      left: 53px;
    }
    .plane {
      position: absolute;
      top: 81px;
      right: 38px;
    }
    .smallPlane {
      position: absolute;
      top: 51px;
      right: 54px;
    }
    .people {
      position: absolute;
      top: 100px;
      right: 120px;
      z-index: 10px;
    }

    // 跳动动画效果
    img {
      transition: transform 0.3s ease;

      &.bounce-animation {
        animation: bounce 0.6s ease-in-out;
      }
    }
  }

  // 定义跳动动画
  @keyframes bounce {
    0% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-15px) scale(1.05);
    }
    50% {
      transform: translateY(-8px) scale(1.02);
    }
    70% {
      transform: translateY(-12px) scale(1.03);
    }
    100% {
      transform: translateY(0) scale(1);
    }
  }
  .text {
    font-family: "Alibaba PuHuiTi 3.0";
    font-size: 24px;
    font-weight: bold;
    line-height: normal;
    letter-spacing: 0em;
    color: #3d3d3d;

    position: absolute;
    top: 388px;
    left: 38px;

    // 使用深度选择器确保动态生成的HTML能应用样式
    :deep(.special) {
      color: #1093ff;
    }
  }
  .discrebBox {
    display: flex;
    align-items: center;
    position: absolute;
    left: 2px;
    bottom: 105px;
    .box1,
    .box2,
    .box3 {
      position: relative;
      width: 119px;
      height: 114px;
      border-radius: 10px;
      margin-left: 8px;
      background: linear-gradient(
        46deg,
        #d5ecff 0%,
        rgba(102, 217, 255, 0.77) 97%
      );

      box-shadow: 2px 4px 10px 0px rgba(86, 178, 253, 0.55);

      padding: 35px 0px 0px 6px;
      .text1 {
        font-family: "Alibaba PuHuiTi 3.0";
        font-size: 22px;
        font-weight: bold;
        line-height: normal;
        letter-spacing: 0em;
        color: #3b82f6;

        margin-bottom: 7px;
      }
      .text2 {
        font-family: "Alibaba PuHuiTi 3.0";
        font-size: 11px;
        font-weight: bold;
        line-height: normal;
        letter-spacing: 0em;
        color: #639cfb;
      }
      .icon1 {
        position: absolute;
        right: -8px;
        top: -38px;
      }
      .icon2 {
        position: absolute;
        right: -15px;
        bottom: -10px;
      }
      .icon3 {
        position: absolute;
        right: -5px;
        bottom: -7px;
      }
    }
    .box2 {
      width: 111px;
      height: 101px;
      background: linear-gradient(130deg, #ddf5ff 1%, #98e3fc 97%);

      box-shadow: 2px 5px 10px 0px rgba(86, 178, 253, 0.49);

      padding: 23px 0px 0px 7px;
      .text1 {
        font-size: 18px;
        font-weight: bold;
      }
      .text2 {
        font-size: 10px;
        font-weight: bold;
      }
    }
    .box3 {
      width: 111px;
      height: 101px;
      background: linear-gradient(310deg, #98e3fc 2%, #ddf5ff 98%);

      box-shadow: 2px 5px 10px 0px rgba(86, 178, 253, 0.49);
      padding: 23px 0px 0px 6px;
      .text1 {
        font-size: 18px;
        font-weight: bold;
      }
      .text2 {
        font-size: 10px;
        font-weight: bold;
      }
    }
  }
  .questionBox {
    position: absolute;
    bottom: 25px;
    left: 54px;
    width: 285px;
    height: 46px;
    border-radius: 50px;
    background: #fff7f7;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .question {
      border: none;
      background: transparent;

      font-family: "Source Han Sans";
      font-size: 14px;
      font-weight: normal;
      line-height: normal;
      color: #000;
      &::placeholder {
        color: #818181;
      }
    }
    .icon4 {
      margin-left: 15px;
      margin-right: 8px;
      //   position: absolute;
      //   top: 10px;
      //   left: 15px;
    }
  }
}
</style>
