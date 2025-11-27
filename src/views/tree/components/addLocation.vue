<template>
  <div v-if="visible" class="overlay" @click="handleOverlayClick">
    <div class="modal" @click.stop>
      <div class="header">
        <p>添加地址</p>
      </div>
      <div class="form">
        <div class="form-item">
          <div class="icon-wrapper">
            <img
              v-if="formData.name"
              src="@/assets/tree/shopping/check.png"
              alt=""
              class="check-icon"
            />
            <div v-else class="empty-icon"></div>
          </div>
          <span class="label">收货人</span>
          <input
            v-model="formData.name"
            type="text"
            placeholder="请输入收货人姓名"
            class="input"
          />
        </div>
        <div class="form-item">
          <div class="icon-wrapper">
            <img
              v-if="formData.phone"
              src="@/assets/tree/shopping/check.png"
              alt=""
              class="check-icon"
            />
            <div v-else class="empty-icon"></div>
          </div>
          <span class="label">手机号码</span>
          <input
            v-model="formData.phone"
            type="tel"
            placeholder="请输入手机号"
            class="input"
          />
        </div>
        <div class="form-item">
          <div class="icon-wrapper">
            <img
              v-if="formData.region"
              src="@/assets/tree/shopping/check.png"
              alt=""
              class="check-icon"
            />
            <div v-else class="empty-icon"></div>
          </div>
          <span class="label">所在地区</span>
          <input
            v-model="formData.region"
            type="text"
            placeholder="请输入所在地址"
            class="input"
          />
        </div>
        <div class="form-item">
          <div class="icon-wrapper">
            <img
              v-if="formData.address"
              src="@/assets/tree/shopping/check.png"
              alt=""
              class="check-icon"
            />
            <div v-else class="empty-icon"></div>
          </div>
          <span class="label">详细地址</span>
          <input
            v-model="formData.address"
            type="text"
            placeholder="请输入详细地址"
            class="input"
          />
        </div>
      </div>
      <div class="buttons">
        <button class="cancel-btn" @click="handleCancel">取消</button>
        <button class="confirm-btn" @click="handleConfirm">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { showToast } from "vant";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "confirm", "cancel"]);

const formData = reactive({
  name: "",
  phone: "",
  region: "",
  address: "",
});

const handleOverlayClick = () => {
  emit("update:visible", false);
  emit("cancel");
};

const handleCancel = () => {
  // 清空表单数据
  Object.keys(formData).forEach((key) => {
    formData[key] = "";
  });
  emit("update:visible", false);
  emit("cancel");
};

const handleConfirm = () => {
  // 验证表单数据
  if (
    !formData.name ||
    !formData.phone ||
    !formData.region ||
    !formData.address
  ) {
    showToast({
      message: "请填写完整的地址信息",
      type: "fail",
      duration: 2000
    });
    return;
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(formData.phone)) {
    showToast({
      message: "请输入正确的手机号码格式",
      type: "fail",
      duration: 2000
    });
    return;
  }

  emit("confirm", { ...formData });
  emit("update:visible", false);

  // 清空表单数据
  Object.keys(formData).forEach((key) => {
    formData[key] = "";
  });
};
</script>

<style lang="less" scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  width: 316px;
  height: 335px;
  border-radius: 21px;
  padding: 0;
  background: linear-gradient(
    180deg,
    rgba(71, 186, 240, 0.87) 0%,
    #e1f5fd 0%,
    #e4f5fe 6%,
    #ffffff 22%,
    #ffffff 59%,
    #ffffff 94%,
    #ddf3fd 100%
  );

  box-shadow: 0px 4px 10px 0px rgba(149, 145, 145, 0.37);
}

.header {
  text-align: center;
  padding: 17px 0 0 0;

  font-family: "Alibaba PuHuiTi 3.0";
  font-size: 18px;
  font-weight: bold;
  line-height: normal;
  letter-spacing: 0em;
  color: #3d3d3d;
}

.form {
  padding: 21px 15px 38px 36px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .icon-wrapper {
    width: 20px;
    height: 20px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    .check-icon {
      width: 16px;
      height: 16px;
    }

    .empty-icon {
      width: 16px;
      height: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 50%;
    }
  }

  .label {
    min-width: 60px;
    font-size: 14px;
    color: #999999;
    margin-right: 12px;
  }

  .input {
    flex: 1;
    font-family: "Alibaba PuHuiTi 3.0";
    font-size: 16px;
    font-weight: 500;
    line-height: normal;
    letter-spacing: 0em;
    border: none;
    outline: none;
    font-size: 14px;
    color: #3d3d3d;
    width: 144px;

    &::placeholder {
      color: #999;
    }
  }
}

.buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
  //   border-top: 1px solid #f0f0f0;

  button {
    // flex: 1;
    // height: 50px;
    border: none;

    // cursor: pointer;

    &.cancel-btn {
      width: 134px;
      height: 41px;

      border-radius: 21px;
      border: 1px solid #88d8fd;
      background: #ffffff;
      box-shadow: 2px 2px 4px 0px rgba(9, 133, 245, 0.25);

      font-family: Roboto;
      font-size: 16px;
      font-weight: 500;
      line-height: 16px;
      text-align: center;
      color: #259DFF;
    }

    &.confirm-btn {
      width: 134px;
      height: 41px;
      border-radius: 36px;
      background: linear-gradient(
          236deg,
          rgba(255, 255, 255, 0.4) 3%,
          rgba(63, 179, 251, 0.4) 58%
        ),
        linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.1)
        ),
        #0085ff;
      border: 1px solid #bfe1ff;

      box-shadow: 2px 2px 4px 0px rgba(9, 133, 245, 0.25);

      color: #ffffff;
      font-family: Alibaba PuHuiTi 2;
      font-size: 18px;
      font-weight: bold;
      line-height: normal;
      text-align: center;

      &:hover {
        background: #357abd;
      }
    }
  }
}
</style>