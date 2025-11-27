<script setup lang="ts">

// import { toValue } from 'vue';

// import medInfo from './components/medInfo/medInfo.vue';

// const KeyWord = ref('');

// const handleSearch = () => {

// 	console.log('搜索：', KeyWord.value);
// };

// const router = useRouter();

// const Ai = () => {
// 	router.push('/ai').then(() => {
// 		// 重新刷新页面
// 		location.reload()
// 	});
// }
// const Conversion = () => {
// 	router.push('/conversion').then(() => {
// 		// 重新刷新页面
// 		location.reload()
// 	});
// }
// const menu3 = () => {
// 	router.push('/doctorConsultation').then(() => {
// 		// 重新刷新页面
// 		location.reload()
// 	});
// }
// const NearbyHosipital = () => {
// 	router.push('/nearbyHosipital').then(() => {
// 		// 重新刷新页面
// 		location.reload()
// 	});
// }
// const hospital = (UserName) => {
// 	router.push({
// 		path : '/hospital',
// 		query : {
// 			UserName:UserName,
// 		}
// 	}).then(() => {
// 		// 重新刷新页面
// 		location.reload()
// 	});
// }


// const list = ref([
// 	"https://i.postimg.cc/jd7RxNQt/1.webp",
// 	"https://i.postimg.cc/XY64pJQF/2.webp",
// 	"https://i.postimg.cc/zGw5WrcQ/3.webp",
// 	"https://i.postimg.cc/CKF0s2yx/4.webp"
// ])
// const current = ref(0)
// const content = ref<HTMLElement>()
// // 定时器
// let timer: number = 0;

// const contentChange = () => {
// 	if (!content.value) return
// 	if (current.value === 0) {
// 		content.value.style.transform = `translateX(${0 + 'px'})`
// 	} else {
// 		const setwidth = content.value?.offsetWidth
// 		content.value.style.transform = `translateX(${current.value * -setwidth + 'px'})`
// 	}
// }
// const thetiem = () => {
// 	window.clearInterval(timer)
// 	timer = window.setInterval(() => {
// 		current.value += 1
// 		if (!content.value) return
// 		if (current.value > list.value.length - 1) {
// 			current.value = 0
// 		}
// 		contentChange()
// 	}, 3000)
// }

// onMounted(() => {
// 	current.value = 0
// 	thetiem()
// })

// const indicatorChange = (i: number) => {
// 	current.value = i
// 	contentChange()
// }
// const stop = () => {
// 	if (timer) {
// 		clearInterval(timer)
// 	}
// }
// const start = () => {
// 	thetiem()
// }

//药材列表
// const messages = ref([]);
// //药材展示区的接口
// const getMessages = () => {
// 	getCategoryData({
// 		pageNum: 1,
// 		pageSize: 30,
// 	}).then((res) =>{
// 		if(res.code === 200){
// 			messages.value = res.data.items;
// 			console.log(messages.value);
// 		}else{
// 			showToast("数据获取失败")
// 		}
// 	})
// }
// onMounted(() => {
// 	getMessages();
// })
</script>

<template>
	<!-- <div class="container">
		<div class="title">
			<div class="test1">智医草本</div>
			<div class="test2">-基于AI和AR的中医药知识科普</div>
		</div>
		<div class="search">
			<input type="text" placeholder="" v-model="KeyWord" @input="handleSearch">
			<img class="logo" src="/src/assets/images/home/LOGO_透明.png.png">
		</div>
		<div class="menu">
			<div>
				<img src="/src/assets/images/home/AI识别.png" @click="Ai" />
				<h5>AI识别</h5>
			</div>
			<div>
				<img src="/src/assets/images/home/计算转换.png" @click="Conversion" />
				<h5>计算换算</h5>
			</div>
			<div>
				<img src="/src/assets/images/home/医药问诊.png" @click="menu3" />
				<h5>医师问诊</h5>
			</div>
			<div>
				<img src="/src/assets/images/home/查找医院.png" @click="hospital" />
				<h5>查找医院</h5>
			</div>
		</div>
		<hr>
		<div class="banner">
			<div class="cp-carousel" @mouseenter="stop" @mouseleave="start">
				<div class="carousel-content" ref="content">
					<div class="carousel-item" v-for="item in list" :key="item">
						<img :src="item" alt="img">
					</div>
				</div>
				
				<div class="indicator">
					<span v-for="(item, i) in list" :key="i" :class="{ active: i === current }"
						@click="indicatorChange(i)"></span>
				</div>
			</div>
		</div>
		<hr>
		<div class="show">
			<medInfo :messages="messages"/>
		</div>
		<tab-bar></tab-bar>
	</div> -->
	<div></div>

</template>

<style lang="less" scoped>
.container {
	.title {
		display: flex;

		.test1 {
			width: 20%;
			margin-left: 10px;
			padding-top: 16px;
			font-size: 16px;
			font-weight: 700;
			color: rgba(0, 0, 0, 1);
		}

		.test2 {
			padding-top: 20px;
			font-size: 12px;
			color: rgba(0, 0, 0, 1);
		}
	}

	.search {
		margin-top: 10px;
		width: 300px;
		height: 20px;
		line-height: 50px;
		display: flex;
	}

	.logo {
		width: 40px;
		height: 40px;
		position: absolute;
		top: 5%;
		left: 85%;
	}

	.search input {
		flex: 1;
		height: 30px;
		line-height: 20px;
		box-sizing: border-box;
		margin-left: 10px;
		border-radius: 15px;
		transition: all .3s;
		background: url('/src/assets/images/home/search.png')no-repeat right center;
		background-size: 30px;
		padding-right: 40px;
		border: 2px solid #8CA84D;
	}

	.search input:focus {
		box-shadow: 0 0 5px #eee;
	}

	.menu {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row;
		gap: 20px;
		margin: 15px;
		background-color: #f0e9e9cc;
		height: 90px;
		border-radius: 10px;
		div{
			text-align: center;
		}

		img {
			border-radius: 10px;
			margin: 5px;
			width: 55px;
			height: 55px;
		}
	}

	hr {
		border: 0;
		height: 1px;
		width: 85%;
		background-color: #8CA84D;
		margin: 5px 30px;
	}

	.banner {
		.cp-carousel {
			width: 350px;
			background: #000;
			height: 180px;
			margin: 0 auto;
			overflow: hidden;
			position: relative;
			border: 8px solid #eff5e0;
			border-radius: 10px;

			.carousel-content {
				position: absolute;
				left: 0;
				bottom: 0;
				top: 0;
				right: 0;
				display: flex;
				transition: all 0.7s;
			}

			.carousel-item {
				flex: 0 0 100%;

				img {
					width: 100%;
					height: 100%;
				}

			}
		}

		// 下面的小点
		.indicator {
			position: absolute;
			bottom: 8px;
			width: 100%;
			z-index: 10;
			left: 0;
			text-align: center;
			cursor: pointer;
			span {
				display: inline-block;
				background-color: rgba(0, 0, 0, 0.5);
				width: 8px;
				height: 8px;
				border-radius: 50%;
				margin-left: 12px;
			}

			.active {
				background-color: #fff;
			}
		}
	}

	.show {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		height: 230px;
		overflow-y: auto;
	}
	
}
</style>
<style>
.van-key--blue {
    color: var(--van-number-keyboard-button-text-color);
    background: #8CA84D;
}
</style>