<template>
  <div class="guide-page">
    <!-- 图片轮播 -->
    <div class="slider" @touchstart="pauseAutoSlide" @touchend="resumeAutoSlide">
      <div 
        class="slide" 
        v-for="(item, index) in slides" 
        :key="index"
        :style="{ transform: `translateX(${-currentIndex * 100}%)` }"
      >
        <img :src="item.image" alt="">
      </div>
    </div>
    
    <!-- 跳过按钮和总倒计时 -->
    <div class="control">
      <div class="skip" @click="skipGuide">
        跳过 {{ Math.ceil(remainingTime / 1000) }}s
      </div>
    </div>
    
    <!-- 指示器 -->
    <div class="indicator">
      <span 
        v-for="(item, index) in slides" 
        :key="index"
        :class="{ active: currentIndex === index }"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount,computed } from 'vue'
import { useRouter } from 'vue-router'
import guide1 from '@/assets/guideO/guide1.png'
import guide2 from '@/assets/guideO/guide2.png'
import guide3 from '@/assets/guideO/guide3.png'
// 如果使用vite，图片导入可以这样写
// const guide1 = new URL('@/assets/guide1.jpg', import.meta.url).href

const currentIndex = ref(0) // 当前图片索引
const startTime = ref(0)
const remainingTime = ref(6000) // 总时长5秒(5000毫秒)
const animationFrame = ref(null)
const isPaused = ref(false)
const router = useRouter()

// 每张图片显示时长（毫秒）
const slideDuration = computed(() => {
  return 6000 / slides.length // 平均分配5秒
})

// 开始自动播放
const startAutoSlide = () => {
  startTime.value = Date.now()
  updateCountdown()
}

const slides = [
  { image: guide1 },
  { image: guide2 },
  { image: guide3 }
]

// 更新倒计时
const updateCountdown = () => {
  if (isPaused.value) return
  
  const elapsed = Date.now() - startTime.value
  remainingTime.value = Math.max(0, 5000 - elapsed)
  
  // 计算当前应该显示的图片索引
  const newIndex = Math.floor(elapsed / slideDuration.value)
  if (newIndex !== currentIndex.value && newIndex < slides.length) {
    currentIndex.value = newIndex
  }
  
  if (remainingTime.value <= 0) {
    completeGuide()
  } else {
    animationFrame.value = requestAnimationFrame(updateCountdown)
  }
}

// 暂停自动播放（触摸时）
const pauseAutoSlide = () => {
  isPaused.value = true
  cancelAnimationFrame(animationFrame.value)
}

// 恢复自动播放（触摸结束）
const resumeAutoSlide = () => {
  if (!isPaused.value) return
  
  // 调整开始时间，保持总时长不变
  startTime.value = Date.now() - (5000 - remainingTime.value)
  isPaused.value = false
  updateCountdown()
}

// 完成引导
const completeGuide = () => {
  cancelAnimationFrame(animationFrame.value)
  console.log('引导完成，跳转到首页')
  router.push('/login')
}

// 跳过引导
const skipGuide = () => {
  cancelAnimationFrame(animationFrame.value)
  console.log('用户跳过，跳转到首页')
  router.push('/login')
}

// 生命周期钩子
onMounted(() => {
  startAutoSlide()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame.value)
})
</script>

<style scoped>
.guide-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.slider {
  display: flex;
  width: 300%;
  height: 100%;
  transition: transform 0.3s ease;
}

.slide {
  width: 100vw;
  height: 100%;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.control {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.skip {
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
}

.indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  z-index: 10;
}

.indicator span {
  width: 8px;
  height: 8px;
  margin: 0 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

.indicator span.active {
  background: #fff;
}
</style>