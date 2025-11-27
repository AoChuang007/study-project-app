import axios from 'axios';

const access_token = '24.541258a5f868df56716dca9700b422ec.2592000.1730122615.282335-93386212';
export default axios.create({
	baseURL: `https://aip.baidubce.com/rest/2.0/image-classify/v1/plant?access_token=${access_token}`, // 这里填写你的API服务器地址
	headers: {
		'Content-type': 'application/x-www-form-urlencoded',
		Accept: 'application/json',
	},
});
