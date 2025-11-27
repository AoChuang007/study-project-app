<!-- eslint-disable vue/multi-word-component-names -->
<template>
	<div>
		<vue3dLoader
			:filePath="filePath"
			:lights="lights"
			:cameraPosition="{ x: 0, y: 0, z: 0 }"
			:rotation="rotation"
			@load="onLoad()"
			:controlsOptions="{
				enableZoom,
				enableRotate,
			}"
			:enableDamping="true"
			:enableDraco="true"
			outputEncoding="sRGB"
			:height="350"
			backgroundColor="#F2F2F2"
			dracoDir="../../assets/draco/gltf/"
		/>
	</div>
</template>

<script setup>
import { vue3dLoader } from 'vue-3d-loader';
import { ref } from 'vue';
const enableZoom = ref(false);
const enableRotate = ref(false);
const filePath = ref('https://project-3dmodel.oss-cn-beijing.aliyuncs.com/model/renshen.glb');
const lights = ref();
lights.value = [
	{
		type: 'AmbientLight',
		color: '#fff',
	},
	{
		type: 'DirectionalLight',
		position: { x: 100, y: 10, z: 100 },
		color: '#fff',
		intensity: 1,
	},
	{
		type: 'PointLight',
		color: '#fff',
		position: { x: 200, y: -200, z: 100 },
		intensity: 1,
	},
	{
		type: 'PointLight',
		color: '#fff',
		position: { x: -200, y: -200, z: 100 },
		intensity: 1,
	},
	{
		type: 'PointLight',
		color: '#fff',
		position: { x: -200, y: -200, z: -100 },
		intensity: 1,
	},
];
const rotation = ref();
rotation.value = {
	x: 0,
	y: 0,
	z: 0,
};
function onLoad() {
	rotate();
}
function rotate() {
	requestAnimationFrame(rotate);
	rotation.value.y -= 0.01;
}
</script>

<style lang="less" scoped></style>
