<!--
 * @Author: Chuang Ao chuang.ao@ly.com
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-08 16:46:12
 * @FilePath: /study-ai-zy-dev_0602 2/src/views/aiAssistant/components/human/index.vue
-->
<template>
  <div class="human-container">
    <div class="test"></div>
    <canvas id="live2d" ref="canvasRef" />

    <!-- 控制按钮 -->
    <div class="controls">
      <van-button @click="playVoice">发声</van-button>
      <van-button @click="switchModel">切换模型</van-button>
      <van-button
        @click="toggleRecognition"
        :type="isRecording ? 'danger' : 'primary'"
      >
        {{ isRecording ? "停止识别" : "语音识别" }}
      </van-button>
    </div>

    <!-- 识别结果显示 -->
    <div v-if="recognizedText" class="recognized-text">
      <p>识别结果: {{ recognizedText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Config, Live2DSprite, LogLevel } from "easy-live2d";
import { Application, Ticker } from "pixi.js";
import { showToast } from "vant";
import { onMounted, onUnmounted, ref } from "vue";

const canvasRef = ref();
const app = new Application();
const selectedModel = ref("hiyori");
let currentSprite: Live2DSprite | null = null;

// 语音识别相关
const isRecording = ref(false);
const recognizedText = ref("");
let recognition: any = null;

// 模型配置
const modelConfigs = {
  hiyori: {
    path: "/Resources/Hiyori/Hiyori.model3.json",
    voice: "/Resources/Hiyori/sounds/test3.wav",
  },
  haru: {
    path: "/Resources/haru/haru_greeter_t05.model3.json",
    voice: "/Resources/Hiyori/sounds/music.wav",
  },
};

// 设置 Config 默认配置
Config.MotionGroupIdle = "Idle";
Config.CubismLoggingLevel = LogLevel.LogLevel_Off;

// 初始化 Hiyori 模型
const initHiyoriModel = async () => {
  const sprite = new Live2DSprite();
  await sprite.init({
    modelPath: modelConfigs.hiyori.path,
    ticker: Ticker.shared as any,
  });

  // 监听点击事件
  sprite.onLive2D("hit", ({ hitAreaName, x, y }) => {
    console.log("hit Hiyori", hitAreaName, x, y);
    playVoice();
  });

  return sprite;
};

// 初始化 Haru 模型
const initHaruModel = async () => {
  const sprite = new Live2DSprite();
  await sprite.init({
    modelPath: modelConfigs.haru.path,
    ticker: Ticker.shared as any,
  });

  // 监听点击事件
  sprite.onLive2D("hit", ({ hitAreaName, x, y }) => {
    console.log("hit Haru", hitAreaName, x, y);
    playVoice();
  });

  return sprite;
};

// 加载选中的模型
const loadSelectedModel = async () => {
  try {
    showToast({ message: "正在加载模型...", duration: 1000 });

    // 移除并销毁当前模型
    if (currentSprite) {
      app.stage.removeChild(currentSprite as any);
      currentSprite.destroy();
      currentSprite = null;
    }

    // 根据选择加载新模型
    if (selectedModel.value === "hiyori") {
      currentSprite = await initHiyoriModel();
    } else {
      currentSprite = await initHaruModel();
    }

    // 设置尺寸和位置
    if (canvasRef.value && currentSprite) {
      currentSprite.width =
        canvasRef.value.clientWidth * window.devicePixelRatio;
      currentSprite.height =
        canvasRef.value.clientHeight * window.devicePixelRatio;
      app.stage.addChild(currentSprite as any);

      currentSprite.setExpression({
        expressionId: "normal",
      });
    }

    showToast({ message: "模型加载成功", type: "success" });
  } catch (error) {
    console.error("模型加载失败:", error);
    showToast({ message: "模型加载失败", type: "fail" });
  }
};

// 播放声音
const playVoice = () => {
  if (!currentSprite) return;

  const config = modelConfigs[selectedModel.value as keyof typeof modelConfigs];
  currentSprite.playVoice({
    voicePath: config.voice,
  });
};

// 切换模型
const switchModel = async () => {
  // 切换选择
  selectedModel.value = selectedModel.value === "hiyori" ? "haru" : "hiyori";
  // 加载新模型
  await loadSelectedModel();
};

// 初始化语音识别
const initSpeechRecognition = () => {
  // 检查协议
  if (
    location.protocol === "http:" &&
    location.hostname !== "localhost" &&
    location.hostname !== "127.0.0.1"
  ) {
    showToast({
      message: "语音识别需要 HTTPS 环境",
      type: "fail",
      duration: 3000,
    });
    return null;
  }

  // 兼容性处理
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showToast({ message: "当前浏览器不支持语音识别", type: "fail" });
    return null;
  }

  const recognitionInstance = new SpeechRecognition();

  // 配置识别参数
  recognitionInstance.lang = "zh-CN"; // 设置中文识别
  recognitionInstance.continuous = true; // 持续识别
  recognitionInstance.interimResults = true; // 返回临时结果
  recognitionInstance.maxAlternatives = 1; // 只返回一个结果

  // 识别开始
  recognitionInstance.onstart = () => {
    console.log("语音识别已开始");
    isRecording.value = true;
    showToast({ message: "开始识别,请说话...", duration: 1500 });
  };

  // 识别结果
  recognitionInstance.onresult = (event: any) => {
    let interimTranscript = "";
    let finalTranscript = "";

    // 遍历识别结果
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // 更新显示文本(优先显示最终结果)
    recognizedText.value = finalTranscript || interimTranscript;

    if (finalTranscript) {
      console.log("识别完成:", finalTranscript);
    }
  };

  // 识别错误
  recognitionInstance.onerror = (event: any) => {
    console.error("识别错误:", event.error);

    // 根据不同错误类型显示提示
    const errorMessages: Record<string, string> = {
      "no-speech": "没有检测到语音,请重试",
      "audio-capture": "无法捕获音频,请检查麦克风",
      "not-allowed": "麦克风权限被拒绝,请在浏览器设置中允许麦克风访问",
      network: "网络错误,请检查网络连接",
      aborted: "识别已中止",
      "service-not-allowed": "语音识别服务不可用",
    };

    const message = errorMessages[event.error] || `识别错误: ${event.error}`;
    showToast({ message, type: "fail", duration: 3000 });

    isRecording.value = false;
  };

  // 识别结束
  recognitionInstance.onend = () => {
    console.log("语音识别已结束");
    isRecording.value = false;
  };

  return recognitionInstance;
};

// 切换语音识别
const toggleRecognition = () => {
  if (!recognition) {
    recognition = initSpeechRecognition();
    if (!recognition) return;
  }

  if (isRecording.value) {
    recognition.stop();
    showToast({ message: "停止识别" });
  } else {
    recognizedText.value = "";
    try {
      // 直接启动识别,浏览器会自动请求麦克风权限
      recognition.start();
    } catch (error: any) {
      console.error("启动识别失败:", error);
      showToast({
        message: "语音识别启动失败,请刷新页面重试",
        type: "fail",
      });
    }
  }
};

onMounted(async () => {
  await app.init({
    view: canvasRef.value,
    backgroundAlpha: 0,
  });

  // 默认加载第一个模型
  await loadSelectedModel();
});

onUnmounted(() => {
  if (currentSprite) {
    currentSprite.destroy();
  }
  if (recognition) {
    recognition.stop();
  }
  app.destroy(true);
});

// 暴露方法供父组件使用
defineExpose({
  recognizedText,
  toggleRecognition,
});
</script>

<style scoped lang="less">
.human-container {
  height: 100vh;
  width: 100%;
  position: relative;

  .controls {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    gap: 15px;
    ::v-deep(.van-button__content) {
      white-space: nowrap;
    }
  }

  .recognized-text {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    padding: 12px 20px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    max-width: 80%;

    p {
      margin: 0;
      font-size: 14px;
      color: #333;
      word-break: break-all;
    }
  }

  .test {
    display: inline-block;
    position: absolute;
    width: 100%;
    height: 70%;
    background-color: pink;
  }

  #live2d {
    position: absolute;
    top: 0%;
    right: 0%;
    width: 100%;
    height: 100%;
  }
}
</style>
