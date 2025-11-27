<script setup>
import PageTitle from '@/components/pageTitle/pageTitle.vue';
import { ref, watch } from 'vue';

const option = ref(['清朝', '汉朝']); // 显示选择朝代时，选项列表
const selectOption = ref('清朝'); // 显示选择朝代时，选择的选项
const displayText = ref(''); // 显示选择朝代时，显示的内容
const selectNum = ref(1.5); // 计算选择朝代时，计算转换的系数
const show = ref(false); // 是否显示键盘
const showType = ref(0); // 判断是第几个选中的

const input1 = ref('0');
const input2 = ref('0');
/**
 * 点击按键时触发
 */
const onInput = (value) => {
	if (showType.value == 1) {
		if (input1.value == '0') {
			input1.value = value;
		} else {
			input1.value = input1.value + `${value}`;
		}
	} else {
		if (input2.value == '0') {
			input2.value = value;
		} else {
			input2.value = input2.value + `${value}`;
		}
	}
};
/**
 * 点击按键删除时触发
 */
const onDelete = () => {
	if (showType.value == 1) {
		input1.value = `${input1.value}`; // 将 数字转成 字符串
		input1.value = input1.value.substr(0, input1.value.length - 1);
	} else {
		input2.value = `${input2.value}`; // 将 数字转成 字符串
		input2.value = input2.value.substr(0, input2.value.length - 1);
	}
};
/**
 * 输入框获取焦点时触发-第一个输入框
 */
const handleFocus1 = () => {
	showType.value = 1;
	show.value = true;
};
/**
 * 输入框获取焦点时触发-第二个输入框
 */
const handleFocus2 = () => {
	showType.value = 2;
	show.value = true;
};
/**
 * 选择朝代时触发，计算转换的系数
 */
const handleSelection = () => {
	displayText.value = selectOption.value;
	selectNum.value = displayText.value === '清朝' ? 1.5 : 3.69;
};

watch(
	() => input1.value,
	(newValue) => {
		input2.value = +newValue * selectNum.value;
	},
);
watch(
	() => input2.value,
	(newValue) => {
		input1.value = +newValue / selectNum.value;
	},
);
</script>

<template>
	<PageTitle classify="计算转换" />
	<div class="select-content">
		<select v-model="selectOption" @change="handleSelection">
			<option value="" disabled>朝代</option>
			<option v-for="(item, index) in option" :key="index">
				{{ item }}
			</option>
		</select>
	</div>
	<van-number-keyboard
		:show="show"
		theme="custom"
		extra-key="."
		close-button-text="完成"
		@blur="show = false"
		@input="onInput"
		@delete="onDelete"
	/>

	<div class="container">
		<div class="inputs">
			<div class="input">
				<span class="dynasty">现代</span>
				<span class="unit">克/g</span>
				<input v-model.number="input1" @focus="handleFocus1" />
			</div>

			<div class="input">
				<span class="dynasty">{{ displayText || '清朝' }}</span>
				<span class="unit">钱匕</span>
				<input v-model.number="input2" @focus="handleFocus2" />
			</div>
		</div>

		<div class="last">
			<p>
				梧桐子大＝黄豆大
				<br />方寸匙＝金石类2.74克＝草本类药末约1克 <br />蜀椒一升＝ 50克 <br />半方寸匙＝ 1.5克
				<br />掌房子一升 = 60克 <br />一钱匙＝ 1.5-1.8克 <br />吴茱萸一升＝ 50克 <br />五味子一升＝50克
				<br />一铢＝100个黍米的重量 <br />半夏一升＝130克 <br />虻虫一升＝16克 <br />附子大者1枚 = 20-30克
				<br />附子中者1枚＝ 15克 <br />强乌头1枚小者＝3克 <br />强乌头1枚大者＝ 5-6克
			</p>
		</div>
	</div>
</template>

<style lang="less" scoped>
/deep/ .van-number-keyboard__keys {
	font-family: none;
}
/deep/.van-key--blue {
    background: #8CA84D;
}
/deep/.van-key {
  border-radius: 40px;
}
/deep/.van-key-wrapper{
  .van-key{
    background: #aaa;
  }
}

.select-content {
	position: absolute;
	top: 6px;
	left: 118px;
	select {
		font-family: '思源宋体';
		width: 220px;
		height: 27px;
		text-align: center;
		border-radius: 25px;
		margin-left: 10px;
		background-color: #f4f8ea;
		color: rgba(128, 128, 128, 1);
		border: none;
		font-size: 16px;
	}
}

.container {
	margin-top: 10px;
	border-radius: 10px;
	width: 92%;
	position: absolute;
	left: 4%;
	background-color: #f9faf7;
	.inputs {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;

		.input {
			background-color: #dafa95;
			width: 85%;
			height: 70px;
			margin-top: 5px;
			border-radius: 15px;
			display: flex;
			justify-content: flex-start;
			align-items: center;

			.dynasty {
				display: flex;
				justify-content: center;
				writing-mode: vertical-rl;
				font-family: '微软雅黑';
				font-size: 20px;
				letter-spacing: 5px;
				line-height: 1.5;
				margin: 0 10px;
				font-weight: 600;
			}
			.unit {
				display: flex;
				justify-content: center;
			}
			input {
				width: 180px;
				height: 35px;
				display: flex;
				align-items: center;
				border-radius: 8px;
				margin: 18px 20px;
				background-color: #f4f8ea;
				border: none;
			}
		}
	}
	.last {
		width: 300px;
		position: absolute;
		left: 7%;
		background-color: #fff;
		margin-top: 10px;
		padding-top: 10px;
		padding-bottom: 10px;
		border-radius: 15px;
		border-width: 2px;
		border-color: #dafa95;
		text-align: center;
	}
}
</style>
