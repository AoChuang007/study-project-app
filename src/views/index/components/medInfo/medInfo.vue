<template>
    <div class="card" v-for="(item, index) in messages" :key="index" @click="goToDetails(index)">
        <img v-lazy="item.zyPic">
        <span class="name">{{ item.name }}</span>
        <p class="characteristic">{{ item.characteristic }}</p>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
	messages: {
		type: Array,
		default: () => [],
	},
});


const goToDetails = (path) =>{
	//暂时只能跳到人参，后续修改
	switch(path) {
		default:
			router.push('/medicinaldtails');
			break;
	}
}

</script>

<style lang="scss" scoped>
.card {
			display: flex;
			width: 170px;
			height: 100px;
			border-radius: 5px;
			background: rgba(165, 214, 63, 0.1);
			border: 1px solid rgba(165, 214, 63, 1);
			position: relative;
			padding: 2px;
			margin: 10px 0 0 10px;

			img {
				width: 70px;
				height: 90px;
				border-radius: 50%;
				object-fit: cover;/* 保持图片比例并裁剪 */
			}

			.name {
				
				left: 75px;
				writing-mode: vertical-rl; /* 文字垂直排列 */
				font-size: 24px;
				font-weight: 700;
				color: rgba(56, 56, 56, 0.79);
				
			}

			.characteristic {
				padding: 3px;
				align-items: center;
				writing-mode: vertical-lr; //竖直排列
				letter-spacing: 2px;
				line-height: 1.5;
				font-size: 12px;
				color: rgba(56, 56, 56, 0.79);
				text-overflow: ellipsis;
				overflow: hidden;
				position: absolute;
				left: 100px;
				width: 60px;
			}
		}
</style>