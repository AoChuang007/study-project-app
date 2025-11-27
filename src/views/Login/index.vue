<template>
  <div class="index">
    <img src="@/assets/login/logo.png" alt="" class="logo" />
    <img src="@/assets/login/surround.png" alt="" class="surround" />
    <img src="@/assets/login/figure.png" alt="" class="figure" />
    <img src="@/assets/login/login_left_star.png" alt="" class="leftStar" />
    <img src="@/assets/login/login_right_star.png" alt="" class="rightStar" />
    <img src="@/assets/login/login_word.png" alt="" class="loginWord" />
    <div class="card">
      <div class="title">
        <div class="active">
          <div class="word">手机快速登录</div>
          <!-- <img
            src="@/assets/login/line.png"
            alt=""
            class="line"
          /> -->
        </div>
      </div>
      <div class="login">
        <form action="">
          <div class="input-wrapper">
            <img src="@/assets/login/phone.png" alt="" class="input-icon" />
            <input
              type="tel"
              placeholder="请输入您的手机号"
              v-model="formData.phone"
              maxlength="11"
            />
          </div>
          <div class="input-wrapper">
            <img src="@/assets/login/lock.png" alt="" class="input-icon" />
            <input
              type="password"
              placeholder="请输入验证码"
              v-model="formData.sms"
              maxlength="8"
              minlength="6"
            />
            <p
              class="forgetPassword"
              @click="getSmsCode()"
              :class="{ disabled: countdown > 0 }"
            >
              {{ countdown > 0 ? `${countdown}s` : "获取验证码" }}
            </p>
          </div>
        </form>
      </div>
      <div class="agreement">
        <input
          type="checkbox"
          id="agreement"
          v-model="agreed"
          class="checkbox"
        />
        <label for="agreement" class="agreement-text">
          已阅读并同意<span class="link">天翼账号认证服务条款</span>和<span
            class="link"
            >用户协议、隐私协议</span
          >
        </label>
      </div>
      <div class="button" @click="handleLogin()">
        <p>同意协议并登录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import { getSms, getUserLogin } from "./api/index";
import { setToken } from "@/utils/auth";
import { useUserStore } from "@/store/user";

const router = useRouter();
const userStore = useUserStore();

const formData = ref({
  phone: "",
  sms: "",
});

const agreed = ref(false);
const countdown = ref(0);
let countdownTimer = null;

const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const getSmsCode = async () => {
  // 验证手机号
  if (!formData.value.phone) {
    showToast("请输入手机号");
    return;
  }
  if (!validatePhone(formData.value.phone)) {
    showToast("请输入正确的手机号");
    return;
  }

  // 验证是否同意协议
  if (!agreed.value) {
    showToast("请先同意用户协议");
    return;
  }

  // 防止重复点击
  if (countdown.value > 0) {
    return;
  }

  try {
    // 这里调用后端接口获取验证码
    console.log("发送验证码到：", formData.value.phone);

    // 添加重试机制
    let retryCount = 0;
    const maxRetries = 2;
    
    const sendSmsWithRetry = async () => {
      try {
        await getSms(formData.value.phone);
        return true;
      } catch (error) {
        if (error.code === 'ECONNABORTED' && retryCount < maxRetries) {
          retryCount++;
          showToast(`网络超时，正在重试... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒后重试
          return sendSmsWithRetry();
        }
        throw error;
      }
    };

    await sendSmsWithRetry();
    showToast("验证码已发送");

    // 开始倒计时
    countdown.value = 60;
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }, 1000);
  } catch (error) {
    console.error("发送验证码失败：", error);
    // 不再显示额外的错误提示，因为formRequest已经处理了
  }
};

const handleLogin = async () => {
  if (!agreed.value) {
    showToast("请先同意用户协议");
    return;
  }
  if (!formData.value.phone) {
    showToast("请输入手机号");
    return;
  }
  if (!validatePhone(formData.value.phone)) {
    showToast("请输入正确的手机号");
    return;
  }
  if (!formData.value.sms) {
    showToast("请输入验证码");
    return;
  }
  console.log("登录信息：", formData.value);
  // 这里添加登录逻辑
  try {
    const res = await getUserLogin(formData.value);
    if (res.code === 200) {
      console.log("登录成功：", res);
      // 安全存储token到Cookie
      if (res.data && res.data.token) {
        setToken(res.data.token);
      }
      // 保存用户信息到localStorage
      if (res.data) {
        const userInfo = { ...res.data };
        // 移除敏感信息
        delete userInfo.token;
        console.log(userInfo)
        userStore.setUserInfo(userInfo);
      }
      showToast("登录成功");
      // 登录成功后跳转到首页
      router.push("/studyLook");
    }
  } catch (error) {
    console.error("登录失败：", error);
    showToast("登录失败，请检查手机号和验证码是否正确");
  }
};

// 组件销毁时清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});
</script>

<style lang="less" scoped>
.index {
  font-family: AlibabaPuHuiTi;
  background: linear-gradient(268deg, #abcfff 14%, #def8ff 76%);
  width: 100%;
  height: 100%;
  position: relative;

  .logo {
    position: absolute;
    top: 20px;
    right: 20.24px;
  }

  .figure {
    position: absolute;
    top: 6px;
    right: 29px;
  }

  .leftStar {
    position: absolute;
    top: 160px;
    left: 23px;
  }

  .rightStar {
    position: absolute;
    top: 88px;
    right: 22px;
  }

  .loginWord {
    position: absolute;
    top: 80px;
    left: 51px;
  }

  .surround {
    position: absolute;
    top: 84px;
    left: 23px;
  }

  .card {
    .login {
      margin-top: 38px;
      margin-left: 28px;

      .input-wrapper {
        width: 280px;
        height: 36px;
        font-size: 12px;

        position: relative;
        display: flex;
        align-items: center;
        margin-bottom: 31px;
        background: #ffffff;
        box-shadow: inset 0px 2px 4px 0px rgba(9, 133, 245, 0.35);
        border-radius: 18px;

        .input-icon {
          margin-left: 16px;
          margin-right: 24.6px;
        }

        input {
          width: 145px;
          padding: 0px;
          border: none;
          outline: none;

          &::placeholder {
            color: #b1c5d5;
          }
        }

        .forgetPassword {
          color: #2375bb;
          margin-right: 12px;
          cursor: pointer;
          user-select: none;

          &.disabled {
            color: #ccc;
            cursor: not-allowed;
          }
        }
      }
    }

    position: absolute;
    top: 225px;
    left: 20px;
    width: 335px;
    height: 323px;
    border-radius: 16px;
    opacity: 1;
    background: linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.2)
      ),
      linear-gradient(180deg, rgba(146, 204, 251, 0) 38%, #ffffff 100%),
      linear-gradient(180deg, #f7faff 0%, rgba(247, 250, 255, 0) 33%);

    box-shadow: 2px 2px 4px 0px rgba(140, 163, 184, 0.25);
    .title {
      font-family: AlibabaPuHuiTi;
      font-size: 22px;
      font-weight: bold;
      line-height: normal;
      letter-spacing: 0.11em;
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 335px;
      height: 44px;
      border-radius: 16px 16px 1px 1px;
      background: linear-gradient(180deg, #ffffff 0%, #6cb8fd 75%);

      .active {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-items: center;
      }
    }
  }

  .agreement {
    // margin: 20px 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;

    .checkbox {
      width: 14px;
      height: 14px;
      margin-right: 8px;
      margin-top: 2px;
      flex-shrink: 0;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      border: 1px solid #ccc;
      border-radius: 50%;
      background-color: #fff;
      cursor: pointer;
      position: relative;

      &:checked {
        background-color: #2375bb;
        border-color: #2375bb;

        &::after {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 10px;
          font-weight: bold;
        }
      }
    }

    .agreement-text {
      color: #9ca3af;

      .link {
        color: #3d3d3d;
        text-decoration: none;
      }
    }
  }

  .button {
    margin: 30px auto 0;
    color: #f5f7ff;
    font-size: 16px;
    font-weight: 500;
    width: 209px;
    height: 36px;
    border-radius: 18px;
    background: linear-gradient(90deg, #e7c5f4 0%, #0985f5 73%);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    p {
      margin: 0;
    }
  }
}
</style>