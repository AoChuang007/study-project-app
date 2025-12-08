<!--
 * @Author: Chuang Ao chuang.ao@ly.com
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-08 17:25:46
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
        v-if="!isRecording && !audioBlob"
        @click="startRecording"
        type="primary"
        icon="volume-o"
      >
        开始录音
      </van-button>
      <van-button
        v-else-if="isRecording"
        @click="stopRecording"
        type="danger"
        icon="stop-circle-o"
      >
        结束录音
      </van-button>
    </div>

    <!-- 录音状态和结果显示 -->
    <div v-if="isRecording" class="recording-status recording-active">
      <div class="recording-indicator">
        <div class="pulse"></div>
        <span>正在录音 {{ recordingDuration }}s</span>
      </div>
      <van-button size="small" type="danger" @click="stopRecording">
        点击结束
      </van-button>
    </div>
    <div v-else-if="audioBlob" class="recording-status">
      <div class="audio-result">
        <p>录音完成 • 时长: {{ finalDuration }}s</p>
        <div class="button-group">
          <van-button size="small" icon="play-circle-o" @click="playRecording">
            播放
          </van-button>
          <van-button
            size="small"
            type="success"
            icon="success"
            @click="uploadRecording"
          >
            发送
          </van-button>
          <van-button size="small" plain icon="close" @click="cancelRecording">
            取消
          </van-button>
        </div>
      </div>
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

// 录音相关
const isRecording = ref(false);
const audioBlob = ref<Blob | null>(null);
const recordingDuration = ref(0); // 实时录音时长
const finalDuration = ref(0); // 最终录音时长
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingStartTime = 0;
let recordingTimer: any = null;

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

// 开始录音
const startRecording = async () => {
  if (isRecording.value) return;

  try {
    // 请求麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // 创建 MediaRecorder
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    audioChunks = [];
    recordingStartTime = Date.now();

    // 数据可用时收集
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // 录音停止时处理
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      audioBlob.value = blob;

      // 保存最终时长
      finalDuration.value = Math.round(
        (Date.now() - recordingStartTime) / 1000
      );

      // 停止所有音轨
      stream.getTracks().forEach((track) => track.stop());

      showToast({ message: "录音完成", type: "success" });
    };

    // 开始录音
    mediaRecorder.start();
    isRecording.value = true;

    // 启动计时器
    recordingTimer = setInterval(() => {
      recordingDuration.value = Math.round(
        (Date.now() - recordingStartTime) / 1000
      );
    }, 100);
  } catch (error: any) {
    console.error("录音启动失败:", error);
    if (error.name === "NotAllowedError") {
      showToast({ message: "请允许使用麦克风权限", type: "fail" });
    } else if (error.name === "NotFoundError") {
      showToast({ message: "未找到麦克风设备", type: "fail" });
    } else {
      showToast({ message: "无法启动录音", type: "fail" });
    }
  }
};

// 停止录音
const stopRecording = () => {
  if (!isRecording.value || !mediaRecorder) return;

  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }

  if (mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  isRecording.value = false;
  // 重置实时时长，等待 onstop 事件设置 finalDuration
  recordingDuration.value = 0;
};

// 处理鼠标离开按钮（保留以免意外情况）
const handleMouseLeave = () => {
  // 点击模式下不自动停止
  // if (isRecording.value) {
  //   stopRecording();
  // }
};

// 取消录音
const cancelRecording = () => {
  audioBlob.value = null;
  recordingDuration.value = 0;
  finalDuration.value = 0;
  showToast({ message: "已取消" });
};

// 播放录音
const playRecording = () => {
  if (!audioBlob.value) return;

  const audioUrl = URL.createObjectURL(audioBlob.value);
  const audio = new Audio(audioUrl);
  audio.play();

  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };
};

// 上传/发送录音
const uploadRecording = async () => {
  if (!audioBlob.value) return;

  try {
    showToast({ message: "正在发送录音...", duration: 1000 });

    // 创建 FormData
    const formData = new FormData();
    formData.append("audio", audioBlob.value, "recording.webm");

    // TODO: 替换为你的实际上传接口
    // const response = await fetch('/api/upload-audio', {
    //   method: 'POST',
    //   body: formData
    // });

    // 模拟上传成功
    console.log("录音文件:", audioBlob.value);
    console.log("文件大小:", (audioBlob.value.size / 1024).toFixed(2), "KB");

    showToast({ message: "发送成功", type: "success" });

    // 清空录音
    audioBlob.value = null;
    recordingDuration.value = 0;
    finalDuration.value = 0;
  } catch (error) {
    console.error("上传失败:", error);
    showToast({ message: "发送失败", type: "fail" });
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
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  if (recordingTimer) {
    clearInterval(recordingTimer);
  }
  app.destroy(true);
});

// 暴露方法供父组件使用
defineExpose({
  audioBlob,
  isRecording,
  startRecording,
  stopRecording,
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

  .recording-status {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    padding: 16px 24px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
    max-width: 80%;
    min-width: 280px;

    &.recording-active {
      background-color: rgba(255, 245, 245, 0.98);
      border: 1px solid rgba(238, 10, 36, 0.2);
    }

    .recording-indicator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;

      > div:first-child {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .pulse {
        width: 12px;
        height: 12px;
        background-color: #ee0a24;
        border-radius: 50%;
        animation: pulse 1.5s ease-in-out infinite;
      }

      span {
        font-size: 15px;
        color: #ee0a24;
        font-weight: 500;
      }
    }

    .audio-result {
      display: flex;
      flex-direction: column;
      gap: 12px;

      p {
        margin: 0;
        font-size: 15px;
        color: #333;
        font-weight: 500;
        text-align: center;
      }

      .button-group {
        display: flex;
        gap: 8px;
        justify-content: center;

        .van-button {
          flex: 1;
        }
      }
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.3);
      opacity: 0.6;
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
