<template>
  <div class="index">
    <topNav title="个人信息"></topNav>
    <div class="content">
      <div class="avatar-container">
        <div class="avatar">
          <img src="@/assets/personal/picture2.png" alt="头像" />
          <div class="camera-icon">
            <!-- <van-uploader reupload max-count="1" class="cameraUplode"/> -->
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="line"></div>
        <div class="info-card-in">
          <div class="info-item" v-for="(item, index) in userInfo" :key="index">
            <div class="label">{{ item.label }}</div>
            <div class="value">
              {{ item.value }}
              <img src="@/assets/personal/left2.png" alt="" class="icon" />
            </div>
          </div>
        </div>
      </div>

      <div class="logout-btn" @click="handleLogout">
        <span>切换账号</span>
      </div>

      <div class="tip-text">删除数据并注销账号</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import topNav from "@/components/top/nomal.vue";
import { logOut } from "../api/index.js";
import { useUserStore } from "@/store/user.js";
import {  removeToken } from "@/utils/auth.js";
import { showToast, showConfirmDialog } from "vant";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const userInfo = ref([]);

// 退出登录处理函数
const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: "确认退出",
      message: "确定要切换账号吗？这将清除当前登录状态。",
    });

    // 调用退出登录接口
    await logOut();

    // 清除本地存储的用户数据
      // 安全地使用 token
      removeToken();
      userStore.clearUserInfo();


    showToast("退出成功");

    // 跳转到登录页面
    router.replace("/login");
  } catch (error) {
    if (error !== "cancel") {
      console.error("退出登录失败:", error);
      showToast("退出失败，请重试");
    }
  }
};

// 从路由参数中获取用户信息数据
onMounted(() => {
  try {
    // 如果有传递的用户信息数据，则使用传递的数据
    if (route.query.userInfo) {
      userInfo.value = JSON.parse(route.query.userInfo);
    } else {
      // 否则使用默认数据（模拟从API获取数据）
      userInfo.value = [
        { label: "名字", value: "小智" },
        { label: "性别", value: "男" },
        { label: "手机号", value: "150****4180" },
        { label: "出生", value: "2005-7-11" },
        { label: "学校", value: "未填写" },
        { label: "年级", value: "大二" },
      ];
    }
  } catch (error) {
    console.error("解析用户信息数据失败:", error);
    // 使用默认数据
    userInfo.value = [
      { label: "名字", value: "小智" },
      { label: "性别", value: "男" },
      { label: "手机号", value: "150****4180" },
      { label: "出生", value: "2005-7-11" },
      { label: "学校", value: "未填写" },
      { label: "年级", value: "大二" },
    ];
  }
});
</script>

<style lang="less" scoped>
.index {
  width: 100%;
  height: 100vh;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);

  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .avatar-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 14px;

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 2px solid #fff;
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .camera-icon {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(61, 61, 61, 0.5);
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .cameraUplode {
          margin: 0 auto;
          background: transparent;
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .info-card {
    width: 351px;
    height: 255px;
    // width: 100%;
    background: linear-gradient(
      180deg,
      #279bf8 0%,
      rgba(192, 232, 255, 0) 100%
    );
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    .line {
      width: 100%;
      height: 6px;
    }
    .info-card-in {
      width: 342.86px;
      height: 249.09px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.75);

      box-shadow: 0px 2px 2px 0px rgba(172, 197, 211, 0.65);
      .info-item {
        // 字体
        font-family: "Alibaba PuHuiTi 2.0";
        font-weight: normal;

        letter-spacing: 0px;

        margin: 0 auto;
        width: 317px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 10px;
        border-bottom: 1px solid #d8d8d8;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #000000;
          font-size: 14px;
          line-height: 21px;
        }

        .value {
          color: #6d6c6c;
          font-size: 12px;
          line-height: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .icon {
            margin-left: 8px;
            width: 7px;
            height: 12.25px;
          }
        }
      }
    }
  }

  .logout-btn {
    width: 185px;
    height: 44px;
    border-radius: 44px;
    background: radial-gradient(
        50% 50% at 50% 50%,
        rgba(186, 217, 253, 0.25) 0%,
        rgba(255, 254, 254, 0) 100%
      ),
      #299ffd;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;

    font-family: AlibabaPuHuiTi;
    font-size: 16px;
    font-weight: 500;
    line-height: normal;
    letter-spacing: 0em;
    margin-top: 80px;
    box-shadow: 0px 2px 4px 0px #78afda;
  }

  .tip-text {
    color: #000000;
    text-align: center;
    margin-top: 28px;
    padding-bottom: 20px;
    font-family: "Alibaba PuHuiTi 2";
    font-size: 10px;
    font-weight: 300;
    line-height: 20px;
    letter-spacing: 0px;
  }
}
</style>