<template>
  <div class="cloud-dialog-mask" @click.self="onClose">
    <div class="cloud-dialog-container">
      <!-- 关闭按钮 -->
      <img src="@/assets/target/closeBut.png" alt="" class="close-btn" @click="onClose">
      <!-- 标题 -->
      <div class="dialog-title">
        {{ cloud?.cardName || "提示" }}
      </div>

      <!-- 内容区域 -->
      <div class="dialog-content">
        <div v-if="cloud?.explanation" class="section">
          <div class="section-label">解释：</div>
          <div class="section-body">
            {{ cloud.explanation }}
          </div>
        </div>

        <div v-if="cloud?.example" class="section">
          <div class="section-label">举例：</div>
          <div class="section-body">
            {{ cloud.example }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  cloud: {
    type: Object,
    default: null,
  },
  // 预留，如果之后需要在弹窗里切换多张卡片，可以用到
  clouds: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close"]);

const onClose = () => {
  emit("close");
};
</script>

<style lang="less" scoped>
.cloud-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.cloud-dialog-container {
  position: relative;
  width:343px;
  max-width: 90vw;
  min-height: 326px;
  background: #EEF9FD;
  border-radius: 20px 100px 15px 15px;
  // padding: 20px 18px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.close-btn {
  position: absolute;
  top: 0px;
  right: 0px;

  
}

.dialog-title {
  max-width: 199px;
  min-height: 32px;
  margin:35px auto 0px auto;
  margin-bottom: 0px;
  text-align: center;
  font-family: Alibaba PuHuiTi 2.0;
font-size: 18px;
font-weight: 500;
line-height: normal;
color: #575D5E;
  margin-bottom: 14px;
  border-radius: 25px;
  background: #E0ECF0;
  box-shadow: 4px 2px 10px 0px rgba(39, 99, 121, 0.3);
}

.dialog-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 13px 18px 18px 17px;
  font-size: 13px;
  color: #4a4a4a;
  margin:31px 20px 0 20px;
  min-height: 185px;
  min-width: 209px;
}

.section + .section {
  margin-top: 10px;
}

.section-label {
  width: 56px;height: 21px;border-radius: 12px;
  background: #F0F0F0;
  border: 1px solid #1E4F8C;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1E4F8C;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-body {
  line-height: 1.5;
  word-break: break-word;
  color: #3D3D3D;
  font-size: 12px;
  margin-left: 8px;
  margin-top: 18px;
}
</style>
