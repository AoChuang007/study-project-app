<template>
	<childNavBar :title="title" />
	<div>
		<Uploader :after-read="afterRead" multiple reupload :max-count="1" />
		<img class="ai_tabber" src="@/assets/images/ai/ai_tabber.png" />
		<!-- <wordCloud :titles="titles" /> -->
		<!-- 弹窗 -->
		<van-popup v-model:show="showDialog">
			<!-- 成功弹窗 -->
			<div class="dialog-success" v-if="status">
				<img class="show_img" :src="showImgURl" />
				<template v-if="resultList">
					<div class="resultList" v-for="(item, index) in resultList" :key="index">
						相似度: &nbsp;&nbsp;
						<span style="color: #678c18; font-size: 16px; font-weight: 600">{{
							(item.score * 100).toFixed(2) + '%'
						}}</span>
						&nbsp;&nbsp;
						{{ item.name }}
					</div>
				</template>
			</div>
			<!-- 失败弹窗 -->
			<img src="../../../assets/images/ai/ai_error.png" v-else class="dialog-error" />
		</van-popup>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { Uploader } from 'vant';
import getAiApi from './api/ai-api';
import childNavBar from '@/components/childNavBar/index.vue';
// import wordCloud from "@/components/wordCloud/index.vue";
// navbar标题
const title = ref('Ai识别');
// // 词云数据
// const titles = ref([
//   "Vue.js",
//   "JavaScript",
//   "HTML",
//   "CSS",
//   "Web Development",
//   "Frontend",
//   "Backend",
//   "Node.js",
//   "Express",
//   "React",
//   "Angular",
//   "TypeScript",
//   "Webpack",
//   "Babel",
//   "GraphQL",
//   "REST API",
//   "Git",
//   "Docker",
//   "Kubernetes",
//   "Microservices",
// ]);
// 结果列表
const resultList = ref([]);
// 弹窗显示
const showDialog = ref(false);
// 识别状态
const status = ref(true);
// 展示图片
const showImgURl = ref('');

// 上传文件
const afterRead = (file) => {
	if (file) {
		let param = {
			image: file.content,
		};
		getAiApi
			.post('', param)
			.then((response) => {
				showDialog.value = true;
				if (response.status === 200) {
					status.value = true;
					showImgURl.value = file.content;
					resultList.value = response.data.result;
				} else {
					status.value = false;
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}
};
</script>

<style lang="less" scoped>
/deep/ .van-uploader__upload {
	width: 375px;
	height: 600px;
	background-color: transparent;
}
/deep/ .van-uploader__upload-icon {
	margin: 0 auto;
	margin-top: -60px;
	width: 100%;
	height: 540px;
	background-image: url('@/assets/images/ai/ai_bg.png');
	background-size: 100% 100%;
	display: flex;
	justify-content: center;
}
.ai_tabber {
	position: absolute;
	bottom: 0;
	height: 80px;
}
.dialog-success {
	position: relative;
	background-image: url('../../../assets/images/ai/ai_success.png');
	width: 350px;
	height: 380px;
	object-fit: cover;
	background-size: 100% 100%;
	.show_img {
		position: absolute;
		top: 105px;
		margin-left: 76px;
		width: 200px;
		height: 150px;
		border-radius: 5px;
		background-color: #678c18;
		border: 2.5px double #678c18;
	}
	.resultList {
		position: relative;
		top: 270px;
		margin-left: 80px;
	}
}
.dialog-error {
	width: 350px;
	height: 175px;
}
</style>
