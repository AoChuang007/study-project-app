<template>
  <div class="index">
    <topNav title="创建新目标"></topNav>
    <!-- <div class="hello">hello</div> -->
    <img src="@/assets/target/Hello.png" alt="" class="hello" />
    <p class="text">快来创建你的新目标吧~</p>
    <img src="@/assets/target/people.png" alt="" class="people" />
    <div class="content">
      <div class="title">目标内容</div>
      <!-- <van-field v-model="targetContent" placeholder="快来填写你的新目标吧，我们将根据你的新目标帮你生成专属于你的周任务(例如：30天通过英语四级）" class="targetContent"/> -->
      <!-- <input
        type="text"
        v-model="targetContent"
        placeholder="快来填写你的新目标吧，我们将根据你的新目标帮你生成专属于你的周任务(例如：30天通过英语四级）"
        class="targetContent"
      /> -->
      <textarea
        id="message"
        v-model="targetContent"
        name="message"
        rows="5"
        cols="40"
        placeholder="快来填写你的新目标吧，我们将根据你的新目标帮你生成专属于你的周任务(例如：30天通过英语四级）"
        class="targetContent"
      ></textarea>
      <div class="box">
        <van-uploader :after-read="afterRead" multiple reupload :max-count="1">
          <template #default>
            <div class="photo">
              <img
                src="@/assets/target/addPhoto.png"
                style="width: 24px; height: 24px"
              />
            </div>
          </template>
        </van-uploader>
        <div class="photo micro">
          <img src="@/assets/target/micro.png" alt="" />
        </div>
      </div>
    </div>
    <div class="saveBut" @click="save">
      <div class="min"></div>
      <p>保存目标</p>
    </div>
  </div>
</template>

<script setup>
import topNav from "@/components/top/nomal.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useLoading } from "../../hooks/useLoading.js";
import { cleanDataByAi, createGoalsByAi } from "./api/index";
import createOCRClient from "./api/orc-api";
// 使用 hook
const { startLoading, stopLoading } = useLoading("正在解析中...");
const router = useRouter();

// 保存目标
const target = ref("");
// 上传文件
const afterRead = async (file) => {
  if (file) {
    let formData = {
      image: file.content,
    };
    try {
      const ocrClient = await createOCRClient();
      const response = await ocrClient.post("", formData);
      startLoading();
      if (response.data && response.status === 200) {
        //!! response.data 丢给接口作为入参
        const responseSecond = await cleanDataByAi(response.data);
        const responseThird = await createGoalsByAi(responseSecond.data);
        target.value = responseThird.data;
        console.log("responseSecond", responseThird.data);

        //!! 这里还需要调用我们自己的接口，然后再关闭loading，stopLoading这里方式是关闭Loading的
        console.log("response", response);
        stopLoading();

        // 跳转到目标列表页面
        router.push({ name: "target" });
      } else {
        console.error("OCR 识别失败:", response.data);
        stopLoading();
      }
    } catch (error) {
      console.error("OCR 请求失败:", error);
      stopLoading();
    }
  }
};
// 输入文本
const targetContent = ref("");

const save = async () => {
  if (!targetContent.value.trim()) {
    console.warn("目标内容不能为空");
    return;
  }

  try {
    startLoading();
    const params = {
      content: targetContent.value,
    };
    const responseSecond = await createGoalsByAi(params);
    console.log("responseSecond", responseSecond);
    // target.value = responseSecond.data;
    // console.log("target", target.value);
    console.log("目标创建成功");
    stopLoading();

    // 跳转到目标详情页面并传递数据
    router.push({
      name: "targetDetails",
      query: {
        // 生成的数据可能是数组，所以取第一个元素
        goal_id: responseSecond.data[0].id,
        title: responseSecond.data[0].title,
        estimatedHours: responseSecond.data[0].estimatedHours,
        actualHours: responseSecond.data[0].actualHours,
        targetListDate: JSON.stringify(responseSecond.data[0].goalTasks || []),
        startDate: responseSecond.data[0].startDate,
        endDate: responseSecond.data[0].endDate,
      },
    });
  } catch (error) {
    console.error("创建目标失败:", error);
    stopLoading();
  }
};

// 输入文本
</script>

<style lang="less">
.index {
  width: 100%;
  height: 100%;
  background: linear-gradient(327deg, #abcfff 7%, #def8ff 48%);

  position: relative;
  .hello {
    width: 116px;
    height: 56px;
    position: absolute;
    top: 90px;
    left: 45px;
  }
  .people {
    position: absolute;
    top: 84px;
    right: 36px;
  }
  .text {
    font-family: "Alibaba PuHuiTi 3.0";
    font-size: 14px;
    font-weight: normal;
    line-height: normal;
    letter-spacing: 0.08em;
    color: #5b5b5b;

    position: absolute;
    top: 156px;
    left: 45px;
  }
  .content {
    width: 330px;
    height: 271px;
    // border: 1px solid;
    // border-image: linear-gradient(90deg, #3178DB 0%, #87EFEC 23%) 1;
    border-radius: 0px 15px 15px 15px;
    background: #fafafa;
    box-shadow: 2px 2px 2px 0px rgba(199, 199, 199, 0.25);

    position: absolute;
    top: 207px;
    left: 25px;

    .title {
      width: 103px;
      height: 26px;
      background: url("@/assets/target/bgIcon.png") no-repeat;
      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 14px;
      font-weight: bold;
      line-height: normal;
      text-align: center;
      letter-spacing: 0.04em;
      color: #ffffff;

      display: flex;
      align-items: center;
      justify-content: center;

      position: absolute;
      left: 0px;
      top: -26px;
    }
    .targetContent {
      background: transparent;
      width: 100%;
      height: 68.63%;
      border: none;
      padding: 14px 15px 0 16px;

      font-family: " Alibaba PuHuiTi 3.0";
      font-size: 12px;
      font-weight: normal;
      line-height: normal;
      letter-spacing: normal;
    }
    textarea::placeholder {
      color: #c7c7c7;
    }
  }
  .content::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 0 15px 15px 15px;
    padding: 1px; /* 边框宽度 */
    background: linear-gradient(90deg, #3178db 0%, #87efec 23%);
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  .box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: 13px;
    .micro {
      margin-left: 9px;
    }
  }
  .photo {
    width: 67px;
    height: 69px;
    border-radius: 10px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .saveBut {
    width: 331px;
    height: 36px;
    border-radius: 15px;
    background: #3279e0;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5);

    position: absolute;
    bottom: 129px;
    left: 25px;
    .min {
      height: 7px;
    }
    p {
      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 16px;
      font-weight: 500;
      line-height: normal;
      text-align: center;
      letter-spacing: 0.18em;
      color: #ffffff;
    }
  }
}
</style>
