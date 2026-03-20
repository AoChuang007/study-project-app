<!--
 * @Author: Chuang Ao chuang.ao@ly.com
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-08 17:25:46
 * @FilePath: /study-ai-zy-dev_0602 2/src/views/aiAssistant/components/human/index.vue
-->
<template>
  
  <div class="human-container">
    <van-nav-bar class="nav" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
    <div class="test"></div>
    <canvas
      id="live2d"
      ref="canvasRef"
      :class="{ 'is-flipped': selectedModel === 'haru' }"
    />

    <!-- 控制按钮 -->
    <button
      class="shift-model-btn"
      :class="selectedModel === 'hiyori' ? 'is-right' : 'is-left'"
      aria-label="切换模型"
      @click="switchModel"
    >
      <img :src="shiftModelIcon" alt="切换模型" />
    </button>

    <div class="mic-controls">
      <button
        v-if="!isRecording"
        class="mic-icon-btn"
        aria-label="开始对话"
        @click="startRecording"
      >
        <img :src="microphoneIcon" alt="开始对话" />
      </button>
      <button
        v-else-if="isRecording"
        class="mic-icon-btn is-recording"
        aria-label="结束录音"
        @click="stopRecording"
      >
        <span class="mic-wave mic-wave-1"></span>
        <span class="mic-wave mic-wave-2"></span>
        <span class="mic-wave mic-wave-3"></span>
        <img :src="microphoneIcon" alt="结束录音" />
      </button>
    </div>

    <!-- 录音状态和结果显示 -->
    <div v-if="isTranscribing || isAskingAi" class="recording-status">
      <div class="audio-result">
        <p>正在思考...</p>
        <div class="transcribing">
          <van-loading size="18px" />
          <span>正在思考</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Config, Live2DSprite, LogLevel } from "easy-live2d";
import { Application, Ticker } from "pixi.js";
import { showToast } from "vant";
import { onMounted, onUnmounted, ref } from "vue";
import { sendMessageToAI } from "../../api";
// import { playTextByXfyunTts } from "../../api/tts";
import { synthesizeTextToWav } from '../../api/tts';
import { useRouter } from "vue-router";
import microphoneIcon from "@/assets/aiAssistant/microphone.png";
import shiftModelIcon from "@/assets/aiAssistant/shiftModel.png";

const route = useRouter();
const canvasRef = ref();
const app = new Application();
const selectedModel = ref("hiyori");
let currentSprite = null;
const onClickLeft = () => {
  route.back();
};
// 录音相关
const isRecording = ref(false);
const audioBlob = ref(null);
const recordingDuration = ref(0); // 实时录音时长
const finalDuration = ref(0); // 最终录音时长
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = 0;
let recordingTimer = null;
let modelVoiceObjectUrl = "";

// 讯飞听写（前端直连）相关
// ⚠️ 注意：把 APISecret 放前端会泄露，仅建议本地/内网演示用。
const recognizedText = ref("");
const isTranscribing = ref(false);
let iatWs = null;

// AI 对话相关
const aiReplyText = ref("");
const isAskingAi = ref(false);
const lastSentText = ref("");
const defaultTtsVcn = import.meta.env.VITE_XFYUN_TTS_VCN || "x5_lingxiaotang_flow";

// 模型配置
const modelConfigs = {
  hiyori: {
    path: "/Resources/Hiyori/Hiyori.model3.json",
    voice: "/Resources/Hiyori/sounds/test3.wav",
    ttsVcn: defaultTtsVcn,
  },
  haru: {
    path: "/Resources/haru/haru_greeter_t05.model3.json",
    voice: "/Resources/Hiyori/sounds/music.wav",
    ttsVcn: "x6_wumeinv_pro",
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
    ticker: Ticker.shared,
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
    ticker: Ticker.shared,
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
      app.stage.removeChild(currentSprite);
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
      app.stage.addChild(currentSprite);

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
function normalizeText(text) {
  if (typeof text !== "string") return "";
  return text.replace(/\s+/g, " ").trim();
}

// 保留文本清洗：后端回复可能包含 emoji，先清洗再送 TTS
function cleanTextForTTS(text) {
  const normalized = normalizeText(text);
  if (!normalized) return "";

  let cleaned = normalized.replace(
    /[^\u4e00-\u9fa5a-zA-Z0-9\s.,!?;:'"-，。！？；：‘’“”…—～·《》〈〉【】（）]/g,
    ""
  );
  cleaned = cleaned.replace(/\p{Extended_Pictographic}/gu, "");
  return normalizeText(cleaned);
}
// 播放声音
const playVoice = async (text = "") => {
  if (!currentSprite) return;

  const config = modelConfigs[selectedModel.value] || modelConfigs.hiyori;
  const sourceText = cleanTextForTTS(text || aiReplyText.value);

  // 没有可读文本时，回退到模型内置语音
  if (!sourceText) {
    currentSprite.playVoice({
      voicePath: config.voice,
    });
    return;
  }

  try {
    const wavBytes = await synthesizeTextToWav(sourceText, {
      vcn: config.ttsVcn,
    });
    if (modelVoiceObjectUrl) {
      URL.revokeObjectURL(modelVoiceObjectUrl);
      modelVoiceObjectUrl = "";
    }

    const blob = new Blob([wavBytes], { type: "audio/wav" });
    const voicePath = URL.createObjectURL(blob);
    modelVoiceObjectUrl = voicePath;

    currentSprite.playVoice({
      voicePath: voicePath,
    });
  } catch (e) {
    console.error("模型语音播放失败，回退本地语音:", e);
    currentSprite.playVoice({
      voicePath: config.voice,
    });
  }
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

      showToast({ message: "录音完成，正在处理", type: "success" });
      void uploadRecording(blob);
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
  } catch (error) {
    console.error("录音启动失败:", error);
    if (error?.name === "NotAllowedError") {
      showToast({ message: "请允许使用麦克风权限", type: "fail" });
    } else if (error?.name === "NotFoundError") {
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

// 上传/发送录音
const uploadRecording = async (blobOverride = null) => {
  const sourceBlob = blobOverride || audioBlob.value;
  if (!sourceBlob) return;

  try {
    recognizedText.value = "";
    aiReplyText.value = "";
    isTranscribing.value = true;

    const pcm16k = await decodeWebmToPcm16k(sourceBlob);
    const text = await xfyunIatTranscribe(pcm16k);
    const promptText = normalizeText(text);

    if (!promptText) {
      showToast({ message: "未识别到有效文本", type: "fail" });
      return;
    }

    recognizedText.value = promptText;
    lastSentText.value = promptText;
    showToast({ message: "正在思考...", duration: 800 });

    // 将文字发送给后端 AI 接口（流式回调 + 最终结果）
    isAskingAi.value = true;
    const aiResult = await sendMessageToAI(promptText, (chunk) => {
      if (chunk && chunk.success && chunk.data && chunk.data.content) {
        aiReplyText.value += chunk.data.content;
      }
    });

    if (!aiResult.success) {
      showToast({ message: aiResult.error || "AI 请求失败", type: "fail" });
    } else if (aiResult.data && aiResult.data.content) {
      // 确保最终内容为后端完整结果
      aiReplyText.value = aiResult.data.content;
      await playVoice(aiReplyText.value);
    }
  } catch (error) {
    console.error("转写失败:", error);
    showToast({ message: "转写失败", type: "fail" });
  } finally {
    isTranscribing.value = false;
    isAskingAi.value = false;
  }
};

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64FromArrayBuffer(buf) {
  return bytesToBase64(new Uint8Array(buf));
}

async function hmacSha256Base64(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return base64FromArrayBuffer(sig);
}

async function buildXfyunIatAuthUrl() {
  const appId = import.meta.env.VITE_XFYUN_APP_ID;
  const apiKey = import.meta.env.VITE_XFYUN_API_KEY;
  const apiSecret = import.meta.env.VITE_XFYUN_API_SECRET;

  if (!appId || !apiKey || !apiSecret) {
    throw new Error(
      "缺少讯飞配置：请在 .env 中设置 VITE_XFYUN_APP_ID / VITE_XFYUN_API_KEY / VITE_XFYUN_API_SECRET"
    );
  }

  const hostUrl = "wss://iat-api.xfyun.cn/v2/iat";
  const url = new URL(hostUrl);
  const host = url.host;
  const date = new Date().toUTCString(); // RFC1123
  const requestLine = "GET /v2/iat HTTP/1.1";

  const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}`;
  const signature = await hmacSha256Base64(signatureOrigin, apiSecret);

  const authorizationOrigin =
    `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);

  url.searchParams.set("authorization", authorization);
  url.searchParams.set("date", date);
  url.searchParams.set("host", host);

  return { url: url.toString(), appId };
}

function floatTo16BitPCM(float32) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7fff);
  }
  return out;
}

function int16ToBytesLE(int16) {
  const bytes = new Uint8Array(int16.length * 2);
  for (let i = 0; i < int16.length; i++) {
    const v = int16[i];
    bytes[i * 2] = v & 0xff;
    bytes[i * 2 + 1] = (v >> 8) & 0xff;
  }
  return bytes;
}

async function decodeWebmToPcm16k(blob) {
  // decodeAudioData 支持情况依赖浏览器；Chrome/Edge 一般可解 webm/opus
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error("当前浏览器不支持 AudioContext");

  const ctx = new AudioCtx();
  try {
    const arrBuf = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrBuf.slice(0));

    // mixdown to mono
    const chCount = audioBuffer.numberOfChannels;
    const len = audioBuffer.length;
    const mono = new Float32Array(len);
    for (let ch = 0; ch < chCount; ch++) {
      const data = audioBuffer.getChannelData(ch);
      for (let i = 0; i < len; i++) mono[i] += data[i] / chCount;
    }

    // resample to 16k using OfflineAudioContext
    if (audioBuffer.sampleRate !== 16000) {
      const duration = audioBuffer.duration;
      const targetLength = Math.max(1, Math.ceil(duration * 16000));
      const offline = new OfflineAudioContext(1, targetLength, 16000);
      const buffer = offline.createBuffer(1, mono.length, audioBuffer.sampleRate);
      buffer.copyToChannel(mono, 0);

      const source = offline.createBufferSource();
      source.buffer = buffer;
      source.connect(offline.destination);
      source.start(0);

      const rendered = await offline.startRendering();
      const resampled = rendered.getChannelData(0);
      return int16ToBytesLE(floatTo16BitPCM(resampled));
    }

    return int16ToBytesLE(floatTo16BitPCM(mono));
  } finally {
    await ctx.close();
  }
}

function extractTextFromResult(result) {
  if (!result?.ws) return "";
  return result.ws
    .map((x) => (x.cw || []).map((c) => c.w || "").join(""))
    .join("");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function xfyunIatTranscribe(pcm16kBytes) {
  // 讯飞要求：40ms 一帧，16k/16bit/mono => 1280 bytes
  const frameBytes = 1280;
  const { url, appId } = await buildXfyunIatAuthUrl();

  if (iatWs) {
    try {
      iatWs.close();
    } catch (e) {
      void e;
    }
    iatWs = null;
  }

  const segments = new Map();

  return await new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    iatWs = ws;

    ws.onopen = async () => {
      try {
        // 首帧
        const firstChunk = pcm16kBytes.subarray(0, Math.min(frameBytes, pcm16kBytes.length));
        ws.send(
          JSON.stringify({
            common: { app_id: appId },
            business: {
              language: "zh_cn",
              domain: "iat",
              accent: "mandarin",
              // dwa: "wpgs", // 如需动态修正可打开（会影响结果合并策略）
              ptt: 1,
            },
            data: {
              status: 0,
              format: "audio/L16;rate=16000",
              encoding: "raw",
              audio: bytesToBase64(firstChunk),
            },
          })
        );

        // 中间帧
        let offset = frameBytes;
        while (offset < pcm16kBytes.length) {
          const chunk = pcm16kBytes.subarray(offset, Math.min(offset + frameBytes, pcm16kBytes.length));
          ws.send(
            JSON.stringify({
              data: {
                status: 1,
                format: "audio/L16;rate=16000",
                encoding: "raw",
                audio: bytesToBase64(chunk),
              },
            })
          );
          offset += frameBytes;
          await sleep(40);
        }

        // 结束帧
        ws.send(JSON.stringify({ data: { status: 2 } }));
      } catch (e) {
        reject(e);
      }
    };

    ws.onerror = () => {
      reject(new Error("WebSocket 连接失败（请检查网络、wss、或密钥配置）"));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(String(evt.data));
        if (msg.code !== 0) {
          reject(new Error(msg.message || `讯飞错误 code=${msg.code}`));
          try {
            ws.close();
          } catch (e) {
            void e;
          }
          return;
        }

        const result = msg.data?.result;
        if (result) {
          const sn = typeof result.sn === "number" ? result.sn : undefined;
          const pgs = result.pgs;
          const rg = result.rg;
          const part = extractTextFromResult(result);

          if (typeof sn === "number") {
            if (pgs === "rpl" && Array.isArray(rg) && rg.length === 2) {
              for (let i = rg[0]; i <= rg[1]; i++) segments.delete(i);
            }
            segments.set(sn, part);

            const full = [...segments.entries()]
              .sort((a, b) => a[0] - b[0])
              .map(([, t]) => t)
              .join("");
            recognizedText.value = full;
          } else if (part) {
            // 兜底：没有 sn 就追加
            recognizedText.value += part;
          }
        }

        if (msg.data?.status === 2) {
          const full = [...segments.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([, t]) => t)
            .join("");
          resolve((full || recognizedText.value || "").trim());
          try {
            ws.close();
          } catch (e) {
            void e;
          }
          iatWs = null;
        }
      } catch (e) {
        reject(e);
      }
    };

    ws.onclose = () => {
      // onerror/onmessage 会 reject/resolve，这里不额外处理
      void 0;
    };
  });
}

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
  if (iatWs) {
    try {
      iatWs.close();
    } catch (e) {
      void e;
    }
    iatWs = null;
  }
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  if (recordingTimer) {
    clearInterval(recordingTimer);
  }
  if (modelVoiceObjectUrl) {
    URL.revokeObjectURL(modelVoiceObjectUrl);
    modelVoiceObjectUrl = "";
  }
  app.destroy(true);
});

// 暴露方法供父组件使用
defineExpose({
  audioBlob,
  isRecording,
  startRecording,
  stopRecording,
  recognizedText,
  aiReplyText,
});
</script>

<style scoped lang="less">
.human-container {
  height: 100vh;
  width: 100%;
  position: relative;
  .nav{
    float:left;

    ::v-deep(.van-icon) {
      color: #6fb5ff;
    }
  }

  .mic-controls {
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

    .mic-icon-btn {
      width: 55px;
      height: 55px;
      border: none;
      border-radius: 50%;
      padding: 0;
      background: rgba(171, 207, 255, 0.35);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      overflow: visible;
      box-shadow: 0 4px 14px rgba(72, 136, 222, 0.24);

      img {
        width: 30px;
        height: 30px;
        object-fit: contain;
        display: block;
        position: relative;
        z-index: 2;
      }

      &.is-recording {
        background: rgba(96, 170, 255, 0.35);
      }

      .mic-wave {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid rgba(116, 188, 255, 0.7);
        box-shadow: 0 0 14px rgba(116, 188, 255, 0.45);
        animation: micWave 1.8s ease-out infinite;
        z-index: 1;
        pointer-events: none;
      }

      .mic-wave-2 {
        animation-delay: 0.6s;
      }

      .mic-wave-3 {
        animation-delay: 1.2s;
      }
    }
  }

  @keyframes micWave {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    100% {
      transform: scale(2.1);
      opacity: 0;
    }
  }

  .shift-model-btn {
    position: absolute;
    bottom: 30px;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    padding: 0;
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;

    &.is-right {
      right: 16px;
    }

    &.is-left {
      left: 16px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  .recording-status {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    padding: 16px 24px;
    background-color: rgba(255, 255, 255, 0.55);
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
    max-width: 80%;
    min-width: 280px;

    &.recording-active {
      background-color: rgba(255, 245, 245, 0.58);
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

    .transcribing {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #666;
      font-size: 14px;
    }

    .transcript {
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 10px;
      padding: 10px 12px;
      background: rgba(250, 250, 250, 0.9);
      display: flex;
      flex-direction: column;
      gap: 6px;

      .transcript-block {
        & + .transcript-block {
          border-top: 1px dashed rgba(0, 0, 0, 0.06);
          padding-top: 6px;
          margin-top: 4px;
        }
      }

      .ai-block .transcript-title {
        color: #1989fa;
      }

      .transcript-title {
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
      }

      .transcript-text {
        font-size: 14px;
        line-height: 1.5;
        color: #222;
        word-break: break-word;
        max-height: 120px;
        overflow: auto;
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
    background: linear-gradient(
      160deg,
      #abcfff 2%,
      #ccf4fe 27%,
      #fafeff 66%,
    );
  }

  #live2d {
    position: absolute;
    top: 0%;
    right: 0%;
    width: 100%;
    height: 100%;

    &.is-flipped {
      transform: scaleX(-1);
      transform-origin: center;
    }
  }
}
</style>
