import { defineStore } from 'pinia'; //引入pinia

// 这里官网是单独导出  是可以写成默认导出的  官方的解释为大家一起约定仓库用use打头的单词
export const useUserStore = defineStore('user', {
	state: () => ({
		id: '', // u_id
		username: '', // 用户名
		password: '', // 用户密码
		userPic: '', // 用户头像
		token: '', // token
		nickname: '', // 用户信息
	}),
	actions: {
		// 设置网页标题
		setToken(data) {
			this.token = data;
		},
		setUserInfo(data) {
			this.id = data.id;
			this.username = data.username;
			this.password = data.password;
			this.userPic = data.userPic;
			this.nickname = data.nickname;
		},
	},
	persist: {
		storage: localStorage, //default localStorage
	},
});
