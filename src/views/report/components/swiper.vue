<template>
  <div
    class="swiper-container-wrapper"
    v-if="shouldShowModule"
    :data-count="displayData.length"
  >
    <div class="swiper-container" ref="swiperRef">
      <div class="swiper-wrapper">
        <div
          class="swiper-slide"
          v-for="(item, index) in displayData"
          :key="`slide-${index}-${item.title}`"
        >
          <div class="percentage">{{ item.percentage }}%</div>
          <div class="title">{{ item.title }}</div>
          <img :src="item.img" alt="" class="picture" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import erxiangshiImg from "@/assets/report/erxiangshi.png";
import gailvImg from "@/assets/report/gailv.png";
import hanshuImg from "@/assets/report/hanshu.png";
import jiheImg from "@/assets/report/jihe.png";
import shulieImg from "@/assets/report/shulie.png";
import { computed, defineProps, nextTick, onMounted, ref, watch } from "vue";

// 定义props
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

// 动态导入 Swiper
let Swiper = null;

const loadSwiper = async () => {
  try {
    const swiperModule = await import("swiper");
    Swiper = swiperModule.default || swiperModule.Swiper || swiperModule;
    return true;
  } catch (error) {
    console.warn("Swiper未能正确导入:", error);
    return false;
  }
};

const swiperRef = ref(null);
let swiperInstance = null;

// 根据图片的数据进行mock
const defaultData = [
  {
    title: "数列数数列数数列数数列数",
    percentage: 28,
    img: shulieImg,
  },
  { title: "函数", percentage: 35, img: hanshuImg },
  { title: "概率", percentage: 42, img: gailvImg },
  { title: "立体几何", percentage: 35, img: jiheImg },
  {
    title: "二项式",
    percentage: 28,
    img: erxiangshiImg,
  },
];

// 使用传入的数据或默认数据
const displayData = computed(() => {
  return props.data.length > 0 ? props.data : defaultData;
});

// 计算属性：是否显示模块
const shouldShowModule = computed(() => {
  return displayData.value.length >= 4;
});

// 判断是否需要自动轮播
const shouldAutoplay = computed(() => {
  return displayData.value.length > 5;
});

// 获取slidesPerView - 最多显示5个
const getSlidesPerView = computed(() => {
  const length = displayData.value.length;
  if (length === 4) return 4;
  return Math.min(length, 5); // 最多显示5个
});

// 初始化Swiper
const initSwiper = async () => {
  if (!swiperRef.value) return;

  // 先加载 Swiper
  if (!Swiper) {
    const loaded = await loadSwiper();
    if (!loaded) return;
  }

  // 如果已存在实例，先销毁
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
    swiperInstance = null;
  }

  try {
    const swiperOptions = {
      slidesPerView: getSlidesPerView.value,
      centeredSlides: displayData.value.length > 4,
      spaceBetween: displayData.value.length > 4 ? 4 : 8,
      // loop: displayData.value.length > 5,
      initialSlide:
        displayData.value.length > 5
          ? Math.floor(displayData.value.length / 2)
          : 0,
    };

    // 只有大于5个时才自动轮播
    if (shouldAutoplay.value) {
      swiperOptions.autoplay = {
        delay: 1000,
        disableOnInteraction: false,
      };
    }

    swiperInstance = new Swiper(swiperRef.value, swiperOptions);
  } catch (error) {
    console.error("Swiper初始化失败:", error);
  }
};

onMounted(() => {
  nextTick(() => {
    initSwiper();
  });
});

// 监听数据变化，重新初始化
watch(
  () => displayData.value,
  () => {
    nextTick(() => {
      initSwiper();
    });
  },
  { deep: true }
);
</script>

<style lang="less" scoped>
.swiper-container-wrapper {
  margin: 0 auto;
  margin-top: 20px;
  width: 345px;
  height: 105px;
  padding: 2.5px 4px 0 4px;
  border-radius: 4px;
  background: linear-gradient(180deg, #279bf8 0%, rgba(192, 232, 255, 0) 100%);

  .swiper-container {
    width: 337px;
    height: 102.57px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.75);
    box-shadow: 0px 2px 2px 0px rgba(172, 197, 211, 0.65);
    overflow: hidden;
    position: relative;

    .swiper-wrapper {
      margin-left: 10px;
      margin-top: 18px;
      display: flex;
      align-items: center;

      .swiper-slide {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: #82c7ff;
        color: #fff;
        text-align: center;
        transition: all 0.3s ease;
        flex-shrink: 0; // 防止压缩

        // 默认尺寸 (最小的)
        width: 53px;
        height: 51px;

        .percentage {
          font-size: 14px;
          font-weight: bold;
          line-height: 16px;
          text-align: center;
          margin-bottom: 4px;
        }

        .title {
          margin-top: 2px;
          font-size: 12px;
          font-weight: normal;
          line-height: 14px;
          text-align: center;
          white-space: nowrap; // 防止文字换行
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          margin-bottom: 4px;
        }
        .picture {
          width: 14px;
          height: 14px;
        }
      }
    }
  }
}

// 使用深度选择器来覆盖 Swiper 的默认样式
:deep(.swiper-slide) {
  // 默认尺寸
  width: 53px !important;
  height: 51px !important;
  flex-shrink: 0 !important;

  .percentage {
    font-size: 14px !important;
  }

  .title {
    font-size: 12px !important;
  }
  .picture {
    width: 14px;
    height: 14px;
  }
}

// 当前激活的slide (最大的)
:deep(.swiper-slide-active) {
  width: 74px !important;
  height: 72px !important;

  .percentage {
    font-size: 18px !important;
    font-weight: bold !important;
  }

  .title {
    font-size: 16px !important;
  }
  .picture {
    width: 17px !important;
    height: 17px !important;
  }
}

// 前一个和后一个slide (中等大小)
:deep(.swiper-slide-prev),
:deep(.swiper-slide-next) {
  width: 64px !important;
  height: 61px !important;

  .percentage {
    font-size: 16px !important;
  }

  .title {
    font-size: 14px !important;
  }
}

// 等于4个时，所有slide都使用中间大小
.swiper-container-wrapper[data-count="4"] {
  :deep(.swiper-slide) {
    width: 74px !important;
    height: 72px !important;

    .percentage {
      font-size: 18px !important;
      font-weight: bold !important;
    }

    .title {
      font-size: 16px !important;
    }
  }
}

// 等于5个时，居中显示，中间的最大
.swiper-container-wrapper[data-count="5"] {
  :deep(.swiper-slide) {
    width: 64px !important;
    height: 61px !important;

    .percentage {
      font-size: 16px !important;
    }

    .title {
      font-size: 14px !important;
    }
  }

  :deep(.swiper-slide-active) {
    width: 74px !important;
    height: 72px !important;

    .percentage {
      font-size: 18px !important;
      font-weight: bold !important;
    }

    .title {
      font-size: 16px !important;
    }
  }
}

// 大于5个时，可视区域显示5个，支持轮播
.swiper-container-wrapper[data-count] {
  &[data-count="6"],
  &[data-count="7"],
  &[data-count="8"],
  &[data-count="9"],
  &[data-count="10"] {
    :deep(.swiper-slide) {
      width: 53px !important;
      height: 51px !important;

      .percentage {
        font-size: 14px !important;
      }

      .title {
        font-size: 12px !important;
      }
    }

    :deep(.swiper-slide-active) {
      width: 74px !important;
      height: 72px !important;

      .percentage {
        font-size: 18px !important;
        font-weight: bold !important;
      }

      .title {
        font-size: 16px !important;
      }
    }

    :deep(.swiper-slide-prev),
    :deep(.swiper-slide-next) {
      width: 64px !important;
      height: 61px !important;

      .percentage {
        font-size: 16px !important;
      }

      .title {
        font-size: 14px !important;
      }
    }
  }
}
</style>
