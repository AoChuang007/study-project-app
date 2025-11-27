<script setup>
import PageTitle from '@/components/pageTitle/pageTitle.vue';
import { reactive, ref } from 'vue';
import { showToast } from 'vant';
import { useRoute } from 'vue-router';
import { togoCollect } from '../api/index';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const route = useRoute();
const title = ref(route.query.title);
const classify = `${title.value}`;
const text = ref({
	title: '神农尝百草',
	content1:
		'传说中，神农氏怀着一颗济世救人之心，毅然踏上了遍尝百草之路。他每日穿梭于山林之间、荒野之上，不知疲惫地寻找着各种植物。每一次尝试新的草木，都如同在与未知进行一场惊心动魄的较量。每天，他都要遭受无数次的毒害，那些有毒的植物在他的身体里发作，带来难以忍受的痛苦，然而他从未退缩。',
	content2:
		'神农氏凭借着非凡的勇气和坚韧的毅力，仔细辨识着每一种植物是否有毒以及其独特的药性。他以自己的身体为试验，只为了能让百姓避开那些有毒的植物，让他们免受伤害。他将自己的发现一一记录下来，无私地与众人分享。在他的努力下，百姓们逐渐学会了辨别哪些植物可以食用、哪些可以治病，生活也变得更加安全和美好。',
	content3:
		'后人怀着对神农氏的崇敬之情，将他的伟大事迹和草药知识整理记录，托其名著成《神农本草经》。这部著作凝聚了神农氏的智慧和心血，是我国现存最早的中药学著作，为后世的医学发展奠定了坚实的基础，成为了中华民族宝贵的文化遗产，激励着一代又一代的医者为了百姓的健康而不懈努力。',
});

const isfavorte = reactive({ essayId: '0' });
const favorite = async () => {
	isfavorte.essayId = isfavorte.essayId === 0 ? 1 : 0;
	console.log('token:', userStore.token);
	togoCollect({
		essayId: 1, //改成动态
		token: userStore.token,
	}).then((res) => {
		if (res.code === 200) {
			showToast('收藏成功');
		} else {
			showToast('收藏失败');
		}
	});
};
</script>

<template>
	<PageTitle classify="神农尝百草" />
	<div class="body">
		<div class="text">
			<span class="title">{{ text.title }}</span>
			<span class="content1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ text.content1 }}</span>
			<span class="content2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ text.content2 }}</span>
			<span class="content3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ text.content3 }}</span>
		</div>
		<div class="next">
			<button>下一篇</button>
		</div>
		<div class="collect">
			<button @click="favorite">{{ isfavorte.essayId === 0 ? '取消收藏' : '一键收藏' }}</button>
			<img src="/src/assets/images/text/hurt.png" />
		</div>
	</div>
</template>

<style lang="less" scoped>
.body {
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 622px;
	background-image: url('/src/assets/images/text/background.png');
	background-repeat: no-repeat;
	background-size: cover;
	background-position: center;
	opacity: 0.95;

	.next {
		width: 260px;
		height: 45px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 10px;
		font-size: 20px;
		border-bottom-right-radius: 30px;
		border-bottom-left-radius: 30px;

		button {
			background-color: #8ca84d;
			border: none;
		}

		background-color: #8ca84d;
		opacity: 0.96;
	}

	.collect {
		width: 260px;
		height: 45px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 15px;
		font-size: 20px;
		border-top-right-radius: 30px;
		border-top-left-radius: 30px;

		button {
			background-color: #fff;
			border: none;
		}

		background-color: #fff;
		opacity: 0.96;

		img {
			width: 15px;
			margin-left: 20px;
		}
	}
}

.text {
	padding: 10px 0;
	width: 330px;
	height: 420px;
	background-color: #fff;
	color: rgba(0, 0, 0, 1);
	opacity: 0.9;
	border-radius: 5px;
	margin-top: 35px;
	overflow-y: auto;

	.title {
		font-size: 20px;
		text-align: center;
		margin: 10px 110px;
	}

	.content1 {
		display: block;
		width: 261px;
		font-size: 12px;
		line-height: 1.6;
		margin-left: 25px;
		margin-right: 250px;
		margin-top: 10px;
	}

	.content2 {
		padding-top: 10px;
		display: block;
		width: 261px;
		font-size: 12px;
		line-height: 1.6;
		margin-left: 25px;
		margin-right: 120px;
	}

	.content3 {
		padding-top: 10px;
		display: block;
		width: 261px;
		font-size: 12px;
		line-height: 1.6;
		margin-left: 25px;
	}
}
</style>
