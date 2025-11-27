<!-- eslint-disable vue/multi-word-component-names -->
<template>
	<baidu-map
		class="map"
		style="overflow: auto"
		:center="{ lng: 116.332782, lat: 40.007978 }"
		:scroll-wheel-zoom="true"
		:zoom="16"
	>
		<bm-panorama></bm-panorama>
		<bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :showAddressBar="true" :autoLocation="true"></bm-geolocation>
		<!-- <bm-local-search keyword="医院" :nearby="nearby" :auto-viewport="true" :panel="false"></bm-local-search> -->
		<!-- <bm-circle :center="nearby.center" :radius="nearby.radius"></bm-circle> -->
		<!-- <bm-local-search :keyword="keyword" :auto-viewport="true" :location="location"></bm-local-search> -->
		<label>关键词：<input v-model="keyword" /></label>
		<label>地区：<input v-model="location" /></label>
	</baidu-map>
</template>

<script setup>
import { ref } from 'vue';

const location = ref('北京');
const keyword = ref('百度');
</script>

<style lang="less" scoped>
.map {
	width: 100%;
	height: 50vh;
}
</style>
