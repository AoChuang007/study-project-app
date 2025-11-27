<template>
  <div class="index">
    <topNav title="个人中心" />
    <tabber />
    <img src="@/assets/personal/round.png" alt="" class="bg1" />
    <div class="card1">
      <img :src="userInfo.picture" alt="" class="picture1" />

      <p class="level">Lv.{{ userInfo.level }}</p>
      <div class="points">
        <p class="name">{{ userInfo.name }}</p>
        <div class="pointsBox">
          <span class="number">{{ userInfo.points }}</span>
          <span class="text">积分</span>
        </div>
      </div>
      <div class="messageBox" @click="goToMessage">
        <p class="message">个人信息</p>
        <img src="@/assets/personal/left.png" alt="" />
      </div>

      <div class="card1First-item">
        <img src="@/assets/personal/medal.png" alt="" />
        <p class="text">所获勋章</p>
      </div>
      <p class="showmore" @click="goToMoreBage">查看更多</p>
      <div class="card1Second">
        <div class="showMedal" v-for="(item, index) in medalList" :key="index">
          <img :src="item.img" alt="" />
        </div>
      </div>
    </div>
    <div class="card2">
      <div v-for="(item, index) in card2List" :key="index">
        <van-cell class="cell1" @click="handleCellClick(index)">
          <template #icon>
            <img :src="item.img" class="cell-icon" />
          </template>
          <template #title>
            <span class="cell-title">{{ item.title }}</span>
          </template>
          <template #right-icon>
            <van-icon name="arrow" class="custom-arrow" v-if="index <= 2" />
            <van-switch
              v-model="checked"
              class="switch"
              v-if="index == 4"
              active-color="#097DF4"
              size="22"
            />
            <img
              v-if="index == 5"
              src="@/assets/personal/icon7.png"
              class="icon7"
            />
            <div class="chose" v-if="index == 3">
              <div
                class="selection"
                @click="toggleDropdown"
                :class="{ 'is-open': isOpen }"
              >
                <div class="header">
                  {{ selectedOption.text }}
                  <img src="@/assets/personal/icon8.png" alt="" />
                </div>
                <transition name="fade">
                  <ul class="options" v-show="isOpen">
                    <li
                      v-for="option in options"
                      :key="option.value"
                      @click="selectOption(option)"
                      :class="{
                        selected: option.value === selectedOption.value,
                      }"
                    >
                      <p class="optionText">{{ option.text }}</p>
                    </li>
                  </ul>
                </transition>
              </div>
            </div>
          </template>
        </van-cell>
      </div>
    </div>
  </div>
</template>

<script setup>
import topNav from "@/components/top/index.vue";
import tabber from "@/components/tabber/index.vue";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";

const router = useRouter();
const checked = ref(false);
const userStore = useUserStore();

// 从store获取用户信息，如果没有则使用默认值
const userInfo = computed(() => {
  const storeUserInfo = userStore.userInfo;
  return {
    id: storeUserInfo.id || 1,
    name: storeUserInfo.name || storeUserInfo.username || "用户",
    age: storeUserInfo.age || 18,
    points: storeUserInfo.points || 0,
    level: storeUserInfo.level || 1,
    picture:
      storeUserInfo.picture ||
      storeUserInfo.avatar ||
      "../src/assets/rank/picture8.png",
    badge: storeUserInfo.badge || 0,
  };
});
// 用户信息数据 - 从store获取真实数据
const userInfoData = computed(() => {
  const storeUserInfo = userStore.userInfo;
  return [
    {
      label: "名字",
      value: storeUserInfo.name || storeUserInfo.username || "未填写",
    },
    {
      label: "性别",
      value: storeUserInfo.gender || storeUserInfo.sex || "未填写",
    },
    {
      label: "手机号",
      value: storeUserInfo.phone || storeUserInfo.mobile || "未填写",
    },
    {
      label: "出生",
      value: storeUserInfo.birthday || storeUserInfo.birth || "未填写",
    },
    { label: "学校", value: storeUserInfo.school || "未填写" },
    { label: "年级", value: storeUserInfo.grade || "未填写" },
  ];
});

// 跳转到个人信息页面
const goToMessage = () => {
  router.push({
    path: "/personalCenter/message",
    query: {
      username: userInfo.value.name,
      userInfo: JSON.stringify(userInfoData.value),
    },
  });
};

// 处理列表项点击
const handleCellClick = (index) => {
  if (index === 0) {
    // 点击"我的学习"，跳转到学习行为日历页面
    router.push("/personalCenter/stydyBehaviour");
  } else if (index === 1) {
    // 点击"学习档案"
    // 可以在这里添加其他跳转逻辑
  } else if (index === 2) {
    // 点击"AI助手设置"
    // 可以在这里添加其他跳转逻辑
  }
};

// 跳转到更多勋章页面
const goToMoreBage = () => {
  router.push({
    path: "/personalCenter/moreBage",
    query: {
      userInfo: JSON.stringify(userInfo.value),
    },
  });
};

const medalList = ref([
  { img: "../src/assets/personal/medal1.png" },
  { img: "../src/assets/personal/medal2.png" },
  { img: "../src/assets/personal/medal3.png" },
  { img: "../src/assets/personal/medal4.png" },
]);
const card2List = ref([
  {
    title: "我的学习",
    img: "../src/assets/personal/icon1.png",
  },
  {
    title: "学习档案",
    img: "../src/assets/personal/icon2.png",
  },
  {
    title: "AI助手设置",
    img: "../src/assets/personal/icon3.png",
  },
  {
    title: "反馈频率调节",
    img: "../src/assets/personal/icon4.png",
  },
  {
    title: "隐藏特定时段记录",
    img: "../src/assets/personal/icon5.png",
  },
  {
    title: "历史数据导出",
    img: "../src/assets/personal/icon6.png",
  },
]);

const isOpen = ref(false);
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  selectedOption.value = option;
  isOpen.value = true;
  console.log(isOpen.value);
};
const selectedOption = ref({ value: "inTime", text: "即时" });
const options = ref([
  { value: "everyDay", text: "每日" },
  { value: "inTime", text: "即时" },
  { value: "everyWeak", text: "每周" },
]);
</script>

<style lang="less" scoped>
.index {
  width: 100%;
  height: 100%;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);
  position: relative;
  .bg1 {
    position: absolute;
    top: -70.96px;
    left: -85px;
    width: auto;
    height: auto;
    max-width: none;
    max-height: none;
    z-index: 5;
  }
  .card1 {
    width: 100%;
    height: 208px;
    background: url(@/assets/personal/bg4.png) no-repeat;
    background-position: center center;
    background-size: auto;
    position: absolute;
    z-index: 10;
    top: 100px;
    margin: 0 auto;
    .picture1 {
      width: 75px;
      height: 75px;
      position: absolute;
      top: -37px;
      left: 51px;
    }

    .level {
      position: absolute;
      top: -20px;
      left: 101px;
      font-family: YouSheBiaoTiHei;
      font-size: 14px;
      font-weight: normal;
      line-height: 14px;
      letter-spacing: 0px;
      background: linear-gradient(180deg, #ffffff 0%, #fce252 98%);
      -webkit-background-clip: text; /* Safari/Chrome 支持 */
      background-clip: text; /* 标准语法 */
      color: transparent; /* 关键：使文本透明以显示背景渐变 */
    }
    .points {
      position: absolute;
      top: 23px;
      left: 132px;
      display: flex;
          .name {
      font-family: Roboto;
      font-size: 18px;
      font-weight: 600;
      line-height: 21px;
      background: linear-gradient(71deg, #3b8fef 2%, #3fb3fb 98%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
      margin-right: 21px;
    }
      .number {
        color: #3fb3fb;
        text-shadow: 0px 4px 10px rgba(255, 255, 255, 0.3);
        font-family: Sansita One;
        font-size: 40px;
        font-weight: normal;
        line-height: 40px;
      }
      .text {
        margin-left: 4px;
        font-family: Sansita One;
        font-size: 12px;
        font-weight: normal;
        line-height: 40px;
        letter-spacing: 0px;
        color: #000000;
      }
      .pointsBox{
        position:relative;
        top: -12px;
      }
    }
    .messageBox {
      width: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      font-family: Source Han Sans;
      font-size: 12px;
      font-weight: normal;
      line-height: normal;
      text-align: center;
      letter-spacing: 0px;
      color: #2884ed;

      position: absolute;
      right: 30px;
      top: 57px;
      img {
        width: 6px;
        height: 10px;
      }
    }

    .card1First-item {
      height: 21px;
      width: 81px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      position: absolute;
      top: 84px;
      left: 30px;
      .text {
        font-family: "Alibaba PuHuiTi 2.0";
        font-size: 14px;
        font-weight: normal;
        line-height: 21px;
        letter-spacing: 0px;
        color: #000000;
      }
    }
    .showmore {
      color: #2884ed;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      line-height: 21px;
      position: absolute;
      top: 93px;
      right: 30px;
    }
    .card1Second {
      width: 339px;
      height: 69px;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      position: absolute;
      bottom: 18px;
      left: 19px;

      .showMedal {
        width: 61px;
        height: 69px;
        border-radius: 8px;
        opacity: 0.8;
        background: #f5f5f5;
        box-shadow: 0px 4px 6px 0px #b7d7eb;

        img {
          margin: 10px auto;
        }
      }
    }
  }
  .card2 {
    width: 340px;
    height: 252px;
    border-radius: 8px;
    background: #ffffff;
    position: absolute;
    margin: 0 auto;
    bottom: 87px;
    left: 19px;
    .cell1 {
      border-bottom: 1px solid #ebebeb;
      //  height: 20px;
      padding: 0px;
      line-height: 41px;
      width: 320px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .cell-icon {
        object-fit: contain; /* 保持原始比例显示完整图片 */
        width: auto;
        height: auto;
        max-width: none;
        max-height: none;
        margin-right: 11.5px;
      }
      .cell-title {
        font-family: "Alibaba PuHuiTi 2.0";
        font-size: 14px;
        font-weight: normal;
        line-height: 21px;
        color: #000000;
      }
      .custom-arrow {
        color: #3fb3fb;

        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px; /* 增加宽度确保图标有足够空间 */
        height: 32px; /* 增加高度确保图标有足够空间 */
        flex-shrink: 0; /* 防止图标被压缩 */
      }
      .icon7 {
        width: 16px;
        height: 16px;
        object-fit: cover;
      }
      .selection {
        border: 1px solid #e5e7eb;
        background: #e7eef6;
        width: 78px;
        height: 24px;
        border-radius: 8px;
        display: flex;
        // justify-content: space-around;
        align-items: center;
        position: relative;
        .header {
          font-family: "Alibaba PuHuiTi 2.0";
          font-size: 14px;
          font-weight: normal;
          color: #000000;
          width: 78px;
          height: 24px;
          display: flex;
          // justify-content: center;
          margin-left: 23px;
          align-items: center;
          img {
            margin-left: 10px;
          }
        }
        .options {
          position: fixed;
          width: 78px;
          height: 72px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0px 1px 2px 0px #a6c5e3;
          background: #e7eef6;
          bottom: 105px;
          right: 26px;
          z-index: 9999;

          font-family: "Alibaba PuHuiTi 2.0";
          font-size: 12px;
          font-weight: 300;
          // line-height: 0px;
          letter-spacing: 0px;
          text-align: center;
        }
      }
      .options li {
        height: 24px;
        line-height: 24px;
        transition: all 0.2s;
      }
      .options li.selected {
        background-color: #fff;
        color: #3fb3fb;
        font-weight: normal;
      }
    }
  }
}
.custom-arrow::before {
  width: 7px;
}
.options {
  line-height: 0px;
}
</style>