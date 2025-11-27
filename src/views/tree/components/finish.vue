<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="success-modal" @click.stop>
      <img src="@/assets/tree/cancal.png" alt="" class="close-btn"  @click="handleClose">
      <img src="@/assets/tree/book.png" alt="" class="book">
      <div class="modal-content">
        <img src="@/assets/tree/people2.png" alt="" class="people">
        <div class="congratulations">
          <p class="congrats-text">太棒啦！</p>
          <span class="level-text">恭喜你完成了<span class="special">第{{ resultData.levelId }}关</span>！</span>
          <div class="accuracy-text">正确率达到<span class="special">{{ accuracy }}%</span></div>
        </div>
        <div class="stars-display">
          <img
            v-for="i in 3"
            :key="i"
            :src="i <= resultData.starsEarned ? starPassImg : starImg"
            alt=""
            class="star"
          />
        </div>
        <div class="modal-buttons">
          <button class="continue-btn" @click="handleContinue">继续闯关</button>
          <button class="return-btn" @click="handleReturnHome">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import starImg from "@/assets/tree/star.png";
import starPassImg from "@/assets/tree/starPass.png";

const router = useRouter();

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  resultData: {
    type: Object,
    default: () => ({
      levelId: 1,
      starsEarned: 0,
      correctAnswers: 0,
      totalQuestions: 1
    })
  }
});

// 定义emits
const emit = defineEmits(['close', 'continue', 'return-home']);

// 计算正确率
const accuracy = computed(() => {
  if (!props.resultData.totalQuestions) return 0;
  return Math.round((props.resultData.correctAnswers / props.resultData.totalQuestions) * 100);
});

// 处理关闭弹窗
const handleClose = () => {
  emit('close');
};

// 处理点击遮罩层
const handleOverlayClick = () => {
  // 可以选择是否允许点击遮罩层关闭弹窗
  // handleClose();
};

// 处理继续闯关
const handleContinue = () => {
  emit('continue');
  handleClose();
};

// 处理返回首页
const handleReturnHome = () => {
  emit('return-home');
  handleClose();
};
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.success-modal {
  background: #EEF9FD;
  border-radius: 20px 61px 15px 15px;
  // padding: 30px;
  width: 285px;
height: 192px;
  position: relative;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: -7px;
  right: -6px;
  font-size: 24px;
  
}
.book{
   position: absolute;
  bottom: -9px;
  right: -15px;
}

.modal-content {
  text-align: center;
  color: white;
  .people{
    position:absolute;
    top:25px;
    left:9px;
  }
}

.congratulations {
  // margin-bottom: 30px;
  font-family: "Alibaba PuHuiTi 3.0";

  .congrats-text {
    // width: 87px;
    font-size: 22px;
font-weight: bold;
    color: #555252;
    margin-top: 22px;
    // margin-right:84px;
    margin-bottom:15px;
    margin-left:20px;
      }

  .level-text {
    margin-left:45px;
    font-weight: 700;
font-size: 14px;
color: #555252;
    margin-top: 20px;
    margin-bottom:15px;
    opacity: 0.9;
    .special{
      font-weight: 700;
font-size: 20px;
      color: #E4CB50
    }
  }

  .accuracy-text {
    font-weight: 700;
font-size: 14px;
color: #555252;
margin-top: 20px;
margin-left:40px;
    // margin: 8px 0;
    opacity: 0.8;
    .special{
      font-weight: 700;
font-size: 20px;
      color: #E4CB50
    }
  }
}

.stars-display {
  display: flex;
  justify-content: center;
  gap: 9px;
  margin: 10px 0;

  .star {
    width: 33px;
    height: 33px;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.modal-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 28px;

  button {
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
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 2px 4px 8px 0px rgba(9, 133, 245, 0.35);
    }
  }
}
</style>