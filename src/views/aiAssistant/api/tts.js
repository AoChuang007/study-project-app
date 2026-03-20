// 讯飞在线语音合成（TTS）前端直连工具
// 文档参考：https://www.xfyun.cn/doc/tts/online_tts/API.html

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

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function utf8TextToBase64(text) {
  return bytesToBase64(new TextEncoder().encode(String(text ?? "")));
}

function warnIfEncodedSecret(secret) {
  try {
    const decoded = atob(secret);
    const isHexLike = /^[0-9a-fA-F]{16,}$/.test(decoded);
    if (decoded && decoded !== secret && isHexLike) {
      console.warn("[TTS] API_SECRET 看起来像 Base64 编码值，请确认使用讯飞控制台原始 APISecret");
    }
  } catch (e) {
    void e;
  }
}

function writeAscii(view, offset, text) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function clampSample(v) {
  return Math.max(-1, Math.min(1, v));
}

async function decodeAudioBytesToBuffer(bytes, mimeType) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error("当前浏览器不支持 AudioContext，无法转换为 WAV");
  }

  const audioContext = new AudioCtx();
  try {
    const blob = new Blob([bytes], { type: mimeType });
    const arrayBuffer = await blob.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    await audioContext.close();
  }
}

function encodeAudioBufferToWav(audioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = (channelCount * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataLength = audioBuffer.length * blockAlign;

  const wavBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(wavBuffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let c = 0; c < channelCount; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let c = 0; c < channelCount; c++) {
      const sample = clampSample(channels[c][i]);
      const pcm = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, pcm, true);
      offset += 2;
    }
  }

  return new Uint8Array(wavBuffer);
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

async function buildXfyunTtsAuthUrl() {
  const appId = import.meta.env.VITE_XFYUN_TTS_APP_ID || import.meta.env.VITE_XFYUN_APP_ID;
  const apiKey = import.meta.env.VITE_XFYUN_TTS_API_KEY || import.meta.env.VITE_XFYUN_API_KEY;
  const apiSecret =
    import.meta.env.VITE_XFYUN_TTS_API_SECRET || import.meta.env.VITE_XFYUN_API_SECRET;

  if (!appId || !apiKey || !apiSecret) {
    throw new Error(
      "缺少讯飞 TTS 配置：请在 .env 中设置 VITE_XFYUN_TTS_APP_ID / VITE_XFYUN_TTS_API_KEY / VITE_XFYUN_TTS_API_SECRET（或复用听写的三个变量）"
    );
  }

  warnIfEncodedSecret(apiSecret);

  const hostUrl =
    import.meta.env.VITE_XFYUN_TTS_URL ||
    import.meta.env.VITE_XFYUN_TTS_WS_URL ||
    "wss://cbm01.cn-huabei-1.xf-yun.com/v1/private/mcd9m97e6";
  const url = new URL(hostUrl);
  const host = url.host;
  const date = new Date().toUTCString(); // RFC1123
  // request-line 必须与实际请求路径一致，否则会鉴权失败。
  const requestLine = `GET ${url.pathname} HTTP/1.1`;

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

// 将文字合成为音频字节（默认 mp3）
export async function synthesizeTextToAudio(text, options = {}) {
  console.log("[TTS] 即将播放文本:", text);
  const { url, appId } = await buildXfyunTtsAuthUrl();
  const vcn = options.vcn || import.meta.env.VITE_XFYUN_TTS_VCN || "x6_lingyouyou_pro"; // 默认女声
  const speed = options.speed ?? 50;
  const volume = options.volume ?? 50;
  const pitch = options.pitch ?? 50;
  const bgs = options.bgs ?? 0;
  const reg = options.reg ?? 0;
  const rdn = options.rdn ?? 0;
  const rhy = options.rhy ?? 0;
  const oralLevel = options.oralLevel;
  const sparkAssist = options.sparkAssist;
  const sampleRate = options.sampleRate ?? 24000;

  const ws = new WebSocket(url);
  const audioChunks = [];

  return await new Promise((resolve, reject) => {
    let settled = false;
    const safeResolve = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const safeReject = (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    ws.onopen = () => {
      try {
        const parameter = {
          tts: {
            vcn,
            speed,
            volume,
            pitch,
            bgs,
            reg,
            rdn,
            rhy,
            audio: {
              encoding: "lame",
              sample_rate: sampleRate,
              channels: 1,
              bit_depth: 16,
              frame_size: 0,
            },
          },
        };
        if (oralLevel || typeof sparkAssist === "number") {
          parameter.oral = {};
          if (oralLevel) parameter.oral.oral_level = oralLevel;
          if (typeof sparkAssist === "number") parameter.oral.spark_assist = sparkAssist;
        }

        const payload = {
          header: {
            app_id: appId,
            status: 2,
          },
          parameter,
          payload: {
            text: {
              encoding: "utf8",
              compress: "raw",
              format: "plain",
              status: 2,
              seq: 0,
              text: utf8TextToBase64(text),
            },
          },
        };
        ws.send(JSON.stringify(payload));
      } catch (e) {
        safeReject(e);
      }
    };

    ws.onerror = () => {
      safeReject(new Error("TTS WebSocket 连接失败（请检查网络、密钥或签名参数）"));
    };

    ws.onmessage = (evt) => {
      try {
        const raw = String(evt.data);
        const msg = JSON.parse(raw);

        // 兼容超拟人私有协议与公有协议的错误字段。
        const code = msg?.code ?? msg?.header?.code;
        const message = msg?.message ?? msg?.header?.message ?? msg?.header?.msg;
        if (typeof code === "number" && code !== 0) {
          safeReject(new Error(message || `TTS 错误 code=${code}`));
          try {
            ws.close();
          } catch (e) {
            void e;
          }
          return;
        }

        const audioNode = msg?.payload?.audio ?? msg?.data;
        const audioBase64 = audioNode?.audio;
        if (audioBase64) {
          const chunk = base64ToUint8Array(audioBase64);
          audioChunks.push(chunk);
        }

        const status = audioNode?.status ?? msg?.header?.status;
        if (status === 2) {
          // 合成结束
          const totalLength = audioChunks.reduce((sum, c) => sum + c.length, 0);
          const merged = new Uint8Array(totalLength);
          let offset = 0;
          for (const c of audioChunks) {
            merged.set(c, offset);
            offset += c.length;
          }
          safeResolve(merged);
          try {
            ws.close();
          } catch (e) {
            void e;
          }
        }

        // 兜底：如果既没有可识别状态，也没有音频字段，给出原始结构片段便于排查
        if (!audioBase64 && typeof status !== "number") {
          safeReject(new Error(`TTS 返回格式无法识别：${raw.slice(0, 240)}`));
        }
      } catch (e) {
        safeReject(e);
      }
    };

    ws.onclose = (evt) => {
      if (settled) return;
      const code = evt?.code;
      const reason = evt?.reason || "";
      safeReject(new Error(`TTS WebSocket 已关闭（code=${code}${reason ? `, reason=${reason}` : ""}）`));
    };
  });
}

export async function convertMp3ToWavBytes(mp3Bytes) {
  const audioBuffer = await decodeAudioBytesToBuffer(mp3Bytes, "audio/mpeg");
  return encodeAudioBufferToWav(audioBuffer);
}

export async function synthesizeTextToWav(text, options = {}) {
  const mp3Bytes = await synthesizeTextToAudio(text, options);
  return await convertMp3ToWavBytes(mp3Bytes);
}

// 合成并直接播放（返回 Audio 实例）
export async function playTextByXfyunTts(text, options = {}) {
  const audioFormat = options.audioFormat === "wav" ? "wav" : "mp3";
  const audioBytes =
    audioFormat === "wav"
      ? await synthesizeTextToWav(text, options)
      : await synthesizeTextToAudio(text, options);
  const blob = new Blob([audioBytes], {
    type: audioFormat === "wav" ? "audio/wav" : "audio/mpeg",
  });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
  audio.onended = () => {
    URL.revokeObjectURL(url);
  };
  return audio;
}

let __ttsChain = Promise.resolve();

function playAudioBytes(bytes, mimeType = "audio/mpeg") {
  return new Promise((resolve) => {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const done = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}

export function speakTextQueued(text, options = {}) {
  __ttsChain = __ttsChain.then(async () => {
    const audioFormat = options.audioFormat === "wav" ? "wav" : "mp3";
    const bytes =
      audioFormat === "wav"
        ? await synthesizeTextToWav(text, options)
        : await synthesizeTextToAudio(text, options);
    await playAudioBytes(bytes, audioFormat === "wav" ? "audio/wav" : "audio/mpeg");
  });
  return __ttsChain;
}

export async function speakStream(asyncIterable, options = {}) {
  let buf = "";
  const minChars = typeof options.minChars === "number" ? options.minChars : 24;
  for await (const part of asyncIterable) {
    if (typeof part !== "string" || !part) continue;
    buf += part;
    if (/[。！？.!?]\s*$/.test(buf) || buf.length >= minChars) {
      await speakTextQueued(buf, options);
      buf = "";
    }
  }
  if (buf) {
    await speakTextQueued(buf, options);
  }
}

