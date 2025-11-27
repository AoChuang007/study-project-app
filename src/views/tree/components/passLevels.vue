<template>
  <topNav :title="title"></topNav>
  <div class="pass-levels">
    <div class="header">
      <img src="@/assets/tree/people.png" alt="" class="people-icon" />
      <img src="@/assets/tree/title.png" alt="" class="title" />
    </div>

    <div
      class="questions-container"
      v-if="questions.length > 0 && currentQuestion"
    >
    <div class="progress-section">
        <div class="progress-info" v-if="questions.length > 0">
            <span class="current-progress">第{{ currentQuestionIndex + 1 }}题</span>
            <span class="total-progress">/ 共{{ questions.length }}题</span>
        </div>
        
        <!-- 自定义进度条 -->
        <div class="custom-progress-bar">
            <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
            ></div>
        </div>
    </div>
    
    <div class="question-content">
        <div class="question-text">
            {{ currentQuestion.questionText }}
        </div>

        <div class="options">
            <div
                class="option"
                v-for="(option, optionKey) in getOptions(currentQuestion)"
                :key="optionKey"
                @click="selectOption(optionKey)"
                :class="{ selected: currentAnswer === optionKey }"
            >
                <span class="option-label">{{ optionKey.toUpperCase() }}.</span>
                <span class="option-text">{{ option }}</span>
            </div>
        </div>
        
        <div class="actions">
            <!-- 上一题按钮：除了第一题外都显示 -->
            <button class="prev-btn" @click="prevQuestion" v-if="currentQuestionIndex > 0">
                上一题
            </button>
            
            <!-- 下一题按钮：除了最后一题外都显示 -->
            <button class="next-btn" @click="handleNextQuestion" v-if="currentQuestionIndex < questions.length - 1">
                下一题
            </button>
            
            <!-- 提交按钮：只在最后一题显示 -->
            <button 
              class="submit-btn" 
              @click="handleSubmit" 
              v-if="currentQuestionIndex === questions.length - 1"
              :class="{ disabled: submitting }"
              :disabled="submitting"
            >
              <van-loading v-if="submitting" size="16px" color="#fff" />
              <span v-if="!submitting">提交</span>
              <span v-else>提交中...</span>
            </button>
        </div>
    </div>
    
    </div>

    <div class="loading-container" v-else-if="loading">
      <div class="loading-content">
        <van-loading size="24px" color="#0985f5" />
        <p class="loading-text">加载题目中...</p>
      </div>
    </div>

    <div class="no-questions" v-else>暂无题目数据</div>

    <!-- <div class="actions" v-if="questions.length > 0">
      <button
        class="prev-btn"
        @click="prevQuestion"
        v-if="currentQuestionIndex > 0"
        :disabled="currentQuestionIndex === 0"
      >
        上一题
      </button>

      <button
        class="next-btn"
        @click="nextQuestion"
        v-if="currentQuestionIndex < questions.length - 1"
        :disabled="!currentAnswer"
      >
        下一题
      </button>

      <button
        class="submit-btn"
        @click="submitAllAnswers"
        v-if="
          currentQuestionIndex === questions.length - 1 && allQuestionsAnswered
        "
      >
        提交答案
      </button>
    </div> -->
  </div>
  
  <!-- 全屏分析提示 -->
  <div class="analyzing-overlay" v-if="showAnalyzing">
    <div class="analyzing-content">
      <div class="analyzing-text">正在分析你的答案</div>
      <div class="analyzing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
  
  <!-- 成功弹窗组件 -->
  <FinishModal 
    :visible="showFinishModal" 
    :result-data="finishResultData"
    @close="handleFinishClose"
    @continue="handleFinishContinue"
    @return-home="handleFinishReturnHome"
  />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getQuestionById, submitAnswers } from "../api/index.js";
import topNav from "@/components/top/nomalStar.vue";
import FinishModal from "./finish.vue";
import { showToast, showConfirmDialog } from "vant";

const route = useRoute();
const router = useRouter();
const questions = ref([]);
const loading = ref(true);
const submitting = ref(false); // 添加提交状态
const showAnalyzing = ref(false); // 添加分析状态
const selectedAnswers = ref([]); // 存储所有题目的答案，按顺序存储
const currentQuestionIndex = ref(0); // 当前题目索引
const levelId = route.query.levelId;
const goalIds = route.query.goalIds ? JSON.parse(route.query.goalIds) : [];
const title = "第" + levelId + "关";

// 弹窗相关状态
const showFinishModal = ref(false);
const finishResultData = ref({});

// 当前题目
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null;
});

// 当前题目的答案
const currentAnswer = computed(() => {
  return selectedAnswers.value[currentQuestionIndex.value] || null;
});

// 移除未使用的变量以解决linter警告
// const allQuestionsAnswered = computed(() => {
//   return (
//     selectedAnswers.value.length === questions.value.length &&
//     selectedAnswers.value.every(
//       (answer) => answer !== null && answer !== undefined
//     )
//   );
// });

// 计算进度百分比
const progressPercentage = computed(() => {
    if (questions.value.length === 0) return 0
    return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100)
})

// 获取选项对象
const getOptions = (question) => {
  return {
    a: question.optionA,
    b: question.optionB,
    c: question.optionC,
    d: question.optionD,
  };
};

// 选择答案
const selectOption = (option) => {
  selectedAnswers.value[currentQuestionIndex.value] = option;
};

// 下一题
const nextQuestion = () => {
  if (
    currentQuestionIndex.value < questions.value.length - 1 &&
    currentAnswer.value
  ) {
    currentQuestionIndex.value++;
  }
};

// 处理下一题点击（包含提示逻辑）
const handleNextQuestion = () => {
  if (!currentAnswer.value) {
    showToast({
      message: "请先选择一个答案再进入下一题",
      type: "fail",
    });
    return;
  }
  nextQuestion();
};

// 处理提交点击（包含提示逻辑）
const handleSubmit = () => {
  if (!currentAnswer.value) {
    showToast({
      message: "请先选择一个答案再提交",
      type: "fail",
    });
    return;
  }
  submitAllAnswers();
};

// 上一题
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

// 提交所有答案
const submitAllAnswers = async () => {
  try {
    // 确认对话框
    await showConfirmDialog({
      title: "确认提交",
      message: `您已完成所有${questions.value.length}道题目，确定要提交答案吗？`,
    });

    submitting.value = true; // 开始提交，设置加载状态
    showAnalyzing.value = true; // 显示分析提示

    // 转换答案格式为大写字母数组
    const userAnswers = selectedAnswers.value.map((answer) =>
      answer ? answer.toUpperCase() : "A"
    );

    console.log("提交的答案:", {
      levelId: parseInt(levelId),
      userAnswers: userAnswers,
    });

    // 调用提交接口
    const response = await submitAnswers(parseInt(levelId), userAnswers);
    
    console.log("接口返回数据:", response);

    if (response && (response.code === 200 || response.status === 200)) {
      showToast({
        message: "答案提交成功！",
        type: "success",
      });

      // 显示成功弹窗
      finishResultData.value = response.data;
      showFinishModal.value = true;
    } else {
      showToast({
        message: (response && response.msg) || "提交失败，请重试",
        type: "fail",
      });
    }
  } catch (error) {
    if (error === "cancel") {
      // 用户取消提交
      return;
    }

    console.error("提交答案失败:", error);
    showToast({
      message: "提交失败，请检查网络后重试",
      type: "fail",
    });
  } finally {
    submitting.value = false; // 提交完成，取消加载状态
    showAnalyzing.value = false; // 隐藏分析提示
  }
};

// 获取题目数据
const fetchQuestions = async () => {
  try {
    if (!levelId) {
      console.error("未获取到关卡ID");
      showToast({
        message: "关卡ID错误",
        type: "fail",
      });
      return;
    }

    loading.value = true;
    const response = await getQuestionById(levelId, goalIds);
    questions.value = response.data || response || [];

    // 初始化答案数组，所有答案初始为null
    selectedAnswers.value = new Array(questions.value.length).fill(null);

    if (questions.value.length === 0) {
      showToast({
        message: "暂无题目数据",
        type: "fail",
      });
    }
  } catch (error) {
    console.error("获取题目失败:", error);
    showToast({
      message: "获取题目失败，请重试",
      type: "fail",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchQuestions();
});

// 弹窗事件处理函数
const handleFinishClose = () => {
  showFinishModal.value = false;
  // 关闭弹窗后跳转回关卡页面
  router.push("/tree");
};

const handleFinishContinue = () => {
  showFinishModal.value = false;
  // 继续闯关，跳转回关卡页面
  router.push("/tree");
};

const handleFinishReturnHome = () => {
  showFinishModal.value = false;
  // 返回首页
  router.push("/");
};
</script>

<style lang="scss" scoped>
.pass-levels {
  padding: 0px;
  background: linear-gradient(339deg, #abcfff 8%, #def8ff 48%);
height: auto;
min-height: 667px;
//   max-width: 800px;
  margin: 0 auto;
  .header {
    position: relative;
    z-index: 1;
    .people-icon {
      position: absolute;
      left: 146px;
      top: -55px;
    }
    .title {
      position: absolute;
      left: 49px;
      top: 15px;
    }
  }

  .questions-container {
    position: absolute;
    top: 136px;
    width: 375px;
    overflow-y: auto;
    height: auto;
    min-height: 516px;
    border-radius: 31px 31px 0 0 ;
    border-top: 6px solid rgba(174, 208, 235, 0.36);
    box-shadow: 
      0 -6px 0 0 rgba(86, 178, 253, 0.49),
      2px 5px 10px 0px rgba(86, 178, 253, 0.49);
    background: linear-gradient(
      215deg,
      rgba(228, 242, 247, 0.98) 1%,
      rgba(152, 227, 252, 0.85) 111%
    );
    z-index: 2; // 确保题目容器在header图片之上

    .progress-section {
      padding: 9px 0px 0px 0px;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .progress-info {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        
        .current-progress {
          font-family: 'Alibaba PuHuiTi 2.0', sans-serif;
          font-size: 18px;
          font-weight: bold;
          line-height: normal;
          display: flex;
          align-items: center;
          letter-spacing: 0em;
          background: linear-gradient(180deg, #73AFF7 0%, #6DE1D5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        
        .total-progress {
          font-family: 'Alibaba PuHuiTi 2.0', sans-serif;
          font-size: 18px;
          font-weight: 500;
          line-height: normal;
          display: flex;
          align-items: center;
          letter-spacing: 0em;
          color: #6A6A6A;
          margin-left: 4px;
        }
      }
      
      .custom-progress-bar {
        width: 310px;
height: 16px;
border-radius: 28px;
        background: #F4FDFF;
        overflow: hidden;
        box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.3);
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(122, 153, 240, 0.549) 2%, #8BEAFD 100%);
          border-radius: 28px;
          transition: width 0.3s ease;
        }
      }
    }

    box-shadow: 2px 5px 10px 0px rgba(86, 178, 253, 0.49);
    
    .question-content {
      padding: 24px 36px;
      
      .question-text {
        font-family: "Alibaba PuHuiTi 2.0";
        color: #6A6A6A;
font-size: 18px;
font-weight: bold;
line-height: normal;
display: flex;
align-items: center;
letter-spacing: 0em;
margin-bottom:15px
      }
      
      .options {
        margin-bottom: 24px;
        
        .option {
          display: flex;
          align-items: center;
          padding: 6px 15px;
          margin-bottom: 12px;
          background: #F4FDFF;
          border: 2px solid #E8F4FD;
          border-radius: 17px;
          cursor: pointer;
          transition: all 0.3s ease;
          
         font-family: "Alibaba PuHuiTi 2.0";
font-size: 18px;
font-weight: bold;
line-height: normal;
letter-spacing: 0em;
          &:hover {
            border-color: #73AFF7;
            background: #F8FCFF;
          }
          
          &.selected {
            border-color: #73AFF7;
            background: linear-gradient(135deg, #E8F4FD 0%, #F0F8FF 100%);
          }
          
          .option-label {
            font-weight: bold;
            color: #6A6A6A;
            // margin-right: 8px;
            min-width: 24px;
          }
          
          .option-text {
             color: #6A6A6A;
            font-size: 14px;

          }
        }
      }
      
      .actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        
        .prev-btn, .next-btn, .submit-btn {
          width: 100px;
          height: 31px;
          border-radius: 21px;
          opacity: 1;
          background: #FFFFFF;
          box-sizing: border-box;
          border: 1px solid #88D8FD;
          box-shadow: 2px 2px 4px 0px rgba(9, 133, 245, 0.25);
          color: #259DFF;
          font-family: Roboto;
          font-size: 16px;
          font-weight: 500;
          line-height: 16px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0px;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(115, 175, 247, 0.4);
          }
        }
      }
    }
    
    .question-item {
      // background: #fff;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        .question-number {
          font-weight: bold;
          color: #0985f5;
          font-size: 16px;
        }

        .difficulty {
          background: #f0f8ff;
          color: #0985f5;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      }

      .question-text {
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 20px;
        color: #333;
      }

      .options {
        margin-bottom: 15px;

        .option {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: #0985f5;
            background-color: #f8f9ff;
          }

          &.selected {
            border-color: #0985f5;
            background-color: #e6f3ff;
          }

          .option-label {
            font-weight: bold;
            color: #0985f5;
            margin-right: 10px;
            min-width: 20px;
          }

          .option-text {
            flex: 1;
            color: #333;
          }
        }
      }

      .knowledge-point {
        margin-bottom: 10px;
        color: #666;
        font-size: 14px;
      }

      .explanation {
        color: #666;
        font-size: 14px;
        background: #f9f9f9;
        padding: 10px;
        border-radius: 6px;
      }
    }
  }

  .loading-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.95);
      padding: 30px 40px;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      
      .loading-text {
        margin-top: 16px;
        font-family: 'Alibaba PuHuiTi 2.0', sans-serif;
        font-size: 16px;
        font-weight: 500;
        color: #0985f5;
        margin-bottom: 0;
      }
    }
  }

  .loading,
  .no-questions {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 16px;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 49px;

    .prev-btn,
    .next-btn,
    .submit-btn {
      border: none;
    //   padding: 12px 30px;
    display: flex;
    align-items: center;
    justify-content: center;
      border-radius: 21px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      background: #FFFFFF;

box-sizing: border-box;
border: 1px solid #88D8FD;

box-shadow: 2px 2px 4px 0px rgba(9, 133, 245, 0.25);

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      &.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }

      &:hover:not(:disabled):not(.disabled) {
        transform: translateY(-2px);
      }
    }

    // .prev-btn {
    //   background: #f5f5f5;
    //   color: #666;

    //   &:hover:not(:disabled) {
    //     background: #e8e8e8;
    //     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    //   }
    // }

    .next-btn {
    //   background: linear-gradient(135deg, #0985f5, #0066cc);
    //   color: white;
    color: #259DFF;
    font-family: Roboto;
font-size: 16px;
font-weight: 500;
line-height: 16px;
text-align: center;
display: flex;
align-items: center;
letter-spacing: 0px;
    width: 100px;
height: 31px;
border-radius: 21px;
background: #FFFFFF;

box-sizing: border-box;
border: 1px solid #88D8FD;

box-shadow: 2px 2px 4px 0px rgba(9, 133, 245, 0.25);
      &:hover:not(:disabled) {
        box-shadow: 0 4px 12px rgba(9, 133, 245, 0.3);
      }
    }

    // .submit-btn {
    //   background: linear-gradient(135deg, #28a745, #20c997);
    //   color: white;

    //   &:hover:not(:disabled) {
    //     box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    //   }
    // }
  }
}

// 全屏分析提示样式
.analyzing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .analyzing-content {
    text-align: center;
    color: white;
    
    .analyzing-text {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #fff;
    }
    
    .analyzing-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      
      span {
        width: 8px;
        height: 8px;
        background: #fff;
        border-radius: 50%;
        animation: analyzing-bounce 1.4s infinite ease-in-out both;
        
        &:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        &:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        &:nth-child(3) {
          animation-delay: 0s;
        }
      }
    }
  }
}

@keyframes analyzing-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>