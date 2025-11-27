<template>
  <div class="finish-overlay" @click="handleClose">
    <div class="finish-wrapper" @click.stop>
      <img src="@/assets/target/people3.png" alt="" class="people" />
      <img src="@/assets/target/calendar.png" alt="" class="calendar" />
      <img src="@/assets/target/book.png" alt="" class="book" />
      <img src="@/assets/target/closeBut.png" alt="" class="close" @click="handleClose">
      <div class="redcircle-group">
        <img src="@/assets/target/redcircle.png" alt="" class="redcircle" v-for="(item,index) in displayCircles" :key="index" />
      </div>

      <div class="finish-content">
        <p class="title">太棒啦！</p>
        <div class="text-group1">
          <span class="text">恭喜你今天完成了</span>
          <span class="text special">{{ time }}</span>
          <span class="text">次打卡！</span>
        </div>
        <div class="text-group2">
          <span class="text">获得</span>
          <span class="text special">20</span>
          <span class="text">积分</span>
        </div>
            <span class="text2">已连续打卡{{ linktime }}天，累计获得{{points}}积分</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// 定义props
const props = defineProps({
  time: {
    type: Number,
    default: 1
  },
  linktime: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  }
});

const router = useRouter();
const time = ref(props.time);
const linktime = ref(props.linktime);
const points = ref(props.points);
// 限制显示的红圈数量最多15个
const displayCircles = computed(() => {
  // 确保 linktime 是有效的正数
  const validLinktime = Math.max(0, Number(linktime.value) || 0);
  const count = Math.min(validLinktime, 15);
  // 确保 count 是有效的整数
  const safeCount = Math.max(0, Math.floor(count));
  return safeCount > 0 ? Array.from({ length: safeCount }, (_, index) => index) : [];
});

// 定义emit事件
const emit = defineEmits(['close']);

// 关闭弹窗
const handleClose = () => {
  emit('close');
  // 跳转到details页面
  router.push('/target');
};
</script>

<style lang="less" scoped>
.finish-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.finish-wrapper {
  width: 293px;
height: 235px;
  background: #eef9fd;
  border-radius: 20px 79px 15px 15px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  .finish-content {

    font-family: "Alibaba PuHuiTi 3.0";

    font-weight: bold;
    line-height: 183.89%;
    text-align: center;
    
    .title {
      position: absolute;
      top: 16px;
      right: 77px;
      font-size: 22px;
      letter-spacing: 0em;
    }
    .text-group1,.text-group2 {
            position: absolute;
    top: 73px;
    left:80px;
      font-weight: 700;

      .text {
        font-size: 14px;
        color: #555252;
      }
      .special {
        font-size: 20px;
        color: #e4cb50;
      }
    }
    .text-group2{
                    position: absolute;
    top: 115px;
    right:-80px;
        letter-spacing: 0.04em;
    }
    .text2{
        position:absolute;
        bottom:10px;
        left:62px;
        font-family: "Alibaba PuHuiTi 3.0";
font-size: 9px;
font-weight: 500;
line-height: 183.89%;
text-align: center;
letter-spacing: 0em;
        color: rgba(167, 167, 167, 0.97);
    }
  }
  .people {
    position: absolute;
    top: 5px;
    left: 8px;
  }
  .calendar {
    position: absolute;
    bottom: 30px;
    left: 72px;
  }
  .book {
    position: absolute;
    bottom: -7px;
    right: -19px;
  }
  .close{
    position:absolute;
    top: 0px;
    right: 0px;
  }
  .redcircle-group{
        position: absolute;
    top: 168px;
    left: 82px;

    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    align-items: center;
    width: 60px;
    .redcircle{
        padding-left:4px;
    }
  }
}
</style>