<template>
	<div class="wrapper">
		<div>
			<button @click="toDetail">
				跳转到详情页
			</button>
		</div>
		<div>
			<button @click="sendMessage" style="width: 100px; height: 50px;">
				测试发送请求
			</button>
		</div>
	</div>
</template>

<script setup>

import { useRouter } from 'vue-router';
import HttpHelper from '../../common/utils/axios_helper';
import Urls from '../../common/urls/index';

const router = useRouter();
const toDetail = async () => {
	router.push('/detail');
};

// 测试发送请求
const sendMessage = async () => {
	// var res = await HttpHelper.post(Urls.getDetail, { name: 'test' });
	// console.log(res);
	var res = await HttpHelper.post(Urls.aa, { name: 'test' });
	console.log(res);
};

</script>

<style lang="less"></style>