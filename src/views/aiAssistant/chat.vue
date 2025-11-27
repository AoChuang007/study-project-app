<template>
  <div class="chat">
    <van-nav-bar class="nav" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
    <div class="iconBox">
      <!-- src\assets\aiAssistant\book.png -->
      <img src="@/assets/aiAssistant/notebook.png" alt="" class="notebook" />
      <img src="@/assets/aiAssistant/pencial.png" alt="" class="pencial" />
      <img src="@/assets/aiAssistant/people.png" alt="" class="people" />
    </div>
    <div class="content">
      <!-- 聊天消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message-item', message.type]"
        >
          <div class="message-content">
            <img
              :src="message.type === 'user' ? userAvatar : aiAvatar"
              alt="头像"
              class="avatar"
            />
            <div class="message-bubble">
              <div class="message-text">
                <span v-if="message.type === 'ai' && currentTypingMessage && currentTypingMessage.id === message.id">
                  {{ typingContent }}<span class="typing-cursor">|</span>
                </span>
                <span v-else>{{ message.content }}</span>
              </div>
              <!-- <div class="message-time">
                {{ formatTime(message.timestamp) }}
              </div> -->
            </div>
          </div>
        </div>

        <!-- AI思考中的加载状态 -->
        <div v-if="isLoading" class="message-item ai">
          <div class="message-content">
            <img :src="aiAvatar" alt="头像" class="avatar" />
            <div class="message-bubble loading">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="message-text">AI正在思考中...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示词区域 -->
      <div class="prompt-suggestions" v-if="showPrompts">
        <div class="prompt-title">猜你想问</div>
        <div class="prompt-list">
          <div
            v-for="prompt in prompts"
            :key="prompt.id"
            class="prompt-item"
            @click="sendPrompt(prompt.content)"
          >
            {{ prompt.content }}
            <img src="@/assets/aiAssistant/left.png" alt="" />
          </div>
        </div>
      </div>

      <!-- 输入框区域 -->
      <div class="input-area">
        <div class="box">
          <div class="input-container">
            <van-field
              v-model="inputMessage"
              placeholder="在这里输入你的问题"
              class="message-input"
              @keyup.enter="sendMessage"
            />
            <img src="@/assets/aiAssistant/icon4.png" alt="" class="icon">
          </div>
          <van-button
            type="primary"
            class="send-btn"
            @click="sendMessage"
            :disabled="!inputMessage.trim()"
          >
            发送
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import {
  sendMessageToAI,
  getPromptSuggestions,
  getUserInfo,
  getAIInfo,
} from "./api/index";

const route = useRouter();
const onClickLeft = () => {
  route.back();
};

// 用户和AI信息
const userInfo = ref({});
const aiInfo = ref(getAIInfo());
const userAvatar = ref('');
const aiAvatar = ref(aiInfo.value.avatar);

// 初始化用户信息
const initUserInfo = async () => {
  const info = await getUserInfo();
  userInfo.value = info;
  userAvatar.value = info.avatar;
};

// 消息数据
const messages = ref([]);
const inputMessage = ref("");
const messagesContainer = ref(null);
const isLoading = ref(false);

// 打字机效果相关
const currentTypingMessage = ref(null);
const typingContent = ref("");

// 提示词数据
const showPrompts = ref(true);
const prompts = ref([]);

// 初始化聊天
onMounted(async () => {
  // 初始化用户信息
  await initUserInfo();
  
  // 添加欢迎消息
  addMessage("ai", "欢迎！我是你的AI学习助手，有什么可以帮助你的吗？");

  // 获取提示词
  await loadPrompts();
});

// 加载提示词
const loadPrompts = async () => {
  try {
    const response = await getPromptSuggestions();
    if (response.success) {
      prompts.value = response.data;
    }
  } catch (error) {
    console.error("加载提示词失败:", error);
  }
};

// 添加消息
const addMessage = (type, content) => {
  const message = {
    id: Date.now() + Math.random(),
    type,
    content,
    timestamp: new Date(),
  };
  messages.value.push(message);

  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
  });
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const userMsg = inputMessage.value.trim();
  addMessage("user", userMsg);
  inputMessage.value = "";

  // 隐藏提示词
  showPrompts.value = false;

  // 设置加载状态
  isLoading.value = true;

  try {
    // 创建AI消息占位符
    const aiMessage = {
      id: Date.now() + Math.random(),
      type: "ai",
      content: "",
      timestamp: new Date(),
    };
    messages.value.push(aiMessage);
    
    // 设置当前正在打字的消息
    currentTypingMessage.value = aiMessage;
    typingContent.value = "";
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom();
    });

    // 调用流式API获取AI回复
    const result = await sendMessageToAI(userMsg, (chunk) => {
      if (chunk && chunk.success && chunk.data && chunk.data.content) {
        // 逐字添加内容
        typingContent.value += chunk.data.content;
        
        // 滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
        
        // 如果是最后一个字符，完成打字效果
        if (chunk.data.isComplete) {
          setTimeout(() => {
            aiMessage.content = typingContent.value;
            currentTypingMessage.value = null;
            typingContent.value = "";
            isLoading.value = false;
            showPrompts.value = true;
          }, 500); // 延迟500ms后完成
        }
      }
    });
    
    // 如果API调用失败，显示错误消息
    if (!result || !result.success) {
      aiMessage.content = result?.error || "网络连接异常，请检查网络后重试。";
      currentTypingMessage.value = null;
      typingContent.value = "";
      isLoading.value = false;
      showPrompts.value = true;
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    addMessage("ai", "网络连接异常，请检查网络后重试。");
    isLoading.value = false;
    showPrompts.value = true;
    currentTypingMessage.value = null;
    typingContent.value = "";
  }
};

// 发送提示词
const sendPrompt = (promptContent) => {
  inputMessage.value = promptContent;
  sendMessage();
};

// 格式化时间
// const formatTime = (timestamp) => {
//   const date = new Date(timestamp);
//   return `${date.getHours().toString().padStart(2, "0")}:${date
//     .getMinutes()
//     .toString()
//     .padStart(2, "0")}`;
// };

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};
</script>

<style lang="less" scoped>
.chat {
  width: 100%;
  height: 100vh;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .nav {
    background: transparent;
    --van-nav-bar-icon-color: #000;
    flex-shrink: 0;
  }

  .iconBox {
    .notebook {
      position: absolute;
      left: 45px;
      top: 76px;
    }
    .pencial {
      position: absolute;
      left: 87px;
      top: 58px;
    }
    .people {
      position: absolute;
      right: 52px;
      top: 58px;
      z-index: 1;
    }
  }

  .content {
    position: absolute;
    z-index: 10;
    bottom: -28px;
    left: 0px;
    background: linear-gradient(
      215deg,
      rgba(228, 242, 247, 0.98) 1%,
      rgba(152, 227, 252, 0.85) 111%
    );
    box-shadow: 2px 5px 10px 0px rgba(86, 178, 253, 0.49);
    width: 375px;
    height: 516px;
    border-radius: 31px;
    border-top: #98e3fc 6px solid;
    display: flex;
    flex-direction: column;
    padding: 27px 14px 23px 23px;

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding-bottom: 10px;
      max-height: 300px;
      scroll-behavior: smooth;

      .message-item {
        font-family: "Source Han Sans";
font-size: 14px;
font-weight: normal;
line-height: 20px;
        margin-bottom: 16px;

        .message-content {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .message-bubble {
            max-width: 240px;
            padding: 8px 9px 10px 12px;
            border-radius: 6px;
            position: relative;

            .message-text {
              font-size: 14px;
              line-height: 1.4;
              word-wrap: break-word;
            }

            .message-time {
              font-size: 11px;
              color: #999;
              margin-top: 4px;
            }
          }
        }

        &.user {
          .message-content {
            flex-direction: row-reverse;

            .message-bubble {
              background: #6CC4ED;
              color: white;

            //   &::after {
            //     content: "";
            //     position: absolute;
            //     top: 12px;
            //     right: -6px;
            //     width: 0;
            //     height: 0;
            //     border-left: 6px solid #007aff;
            //     border-top: 6px solid transparent;
            //     border-bottom: 6px solid transparent;
            //   }
            }
          }
        }

        &.ai {
          .avatar {
            border-radius: 0;
          }

          .message-bubble {
            background: white;
            color: #1D2129;
        
            // &::after {
            //   content: "";
            //   position: absolute;
            //   top: 12px;
            //   left: -6px;
            //   width: 0;
            //   height: 0;
            //   border-right: 6px solid white;
            //   border-top: 6px solid transparent;
            //   border-bottom: 6px solid transparent;
            // }

            &.loading {
              .loading-dots {
                display: flex;
                gap: 4px;
                margin-bottom: 8px;

                span {
                  width: 6px;
                  height: 6px;
                  background: #007aff;
                  border-radius: 50%;
                  animation: loading-bounce 1.4s infinite ease-in-out;

                  &:nth-child(1) {
                    animation-delay: -0.32s;
                  }

                  &:nth-child(2) {
                    animation-delay: -0.16s;
                  }
                }
              }

              .message-text {
                font-size: 12px;
                color: #666;
              }
            }
          }
        }
      }
    }

    .prompt-suggestions {
      position: absolute;
      top: 327px;
      margin-bottom: 16px;
      width: 186px;
      height: 90px;
      border-radius: 20px;
      background: #ffffff;

      box-sizing: border-box;
      overflow-y: auto;
      overflow-x: hidden;

      .prompt-title {
        margin: 9px 0px 0px 7px;
        font-family: "Alibaba PuHuiTi 3";
        font-size: 14px;
        font-weight: normal;
        line-height: 16px;

        background: linear-gradient(270deg, #81ce6c 0%, #78d0d6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
      }

      .prompt-list {
        margin: 9px 0px 0px 7px;
        display: flex;
        flex-wrap: wrap;
        gap: 14px;

        .prompt-item {
          //   padding: 6px 12px;
          font-family: "Alibaba PuHuiTi 3";
          font-size: 12px;
          font-weight: normal;
          line-height: 16px;
          color: #3d3d3d;
          cursor: pointer;
          transition: all 0.2s;

          width: 165px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          &:hover {
            background: rgba(255, 255, 255, 0.9);
            border-color: #007aff;
          }
        }
      }
    }

    .input-area {
      //   flex-shrink: 0;
      .box {
        display: flex;
      }
      .input-container {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 266px;
        height: 33px;
        border-radius: 50px;
        background: #fff7f7;

        position: absolute;
        top: 432px;
        .message-input {
          flex: 1;
          border: none;
          background: transparent;

          width: 266px;

          :deep(.van-field__control) {
            font-family: "Source Han Sans";
            border: none;
            background: transparent;
            padding: 8px 27px;
            font-size: 14px;
          }
        }
        .icon{
            position: absolute;
            top:6px;
            left:13px;
        }
      }
      .send-btn {
        width: 70px;
        height: 31px;
        border-radius: 21px;
        font-size: 14px;
        background: #ffffff;

        border: 1px solid #88d8fd;

        box-shadow: 2px 2px 4px 0px rgba(9, 133, 245, 0.25);

        display: flex;
        justify-content: center;
        align-items: center;

        font-family: Roboto;
        font-size: 16px;
        font-weight: 500;
        line-height: 16px;
        color: #259dff;

        position: absolute;
        top:434px;
        right:11px;
      }
    }
  }
}

// 滚动条样式
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

// 加载动画
@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// 打字机光标闪烁动画
@keyframes typing-cursor {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.typing-cursor {
  animation: typing-cursor 1s infinite;
  color: #007aff;
  font-weight: bold;
}
</style>