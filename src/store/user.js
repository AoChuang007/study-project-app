import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    state: () => ({
        // token 不再需要存储，因为由 HttpOnly Cookie 管理
        userInfo: (() => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                return userInfo ? JSON.parse(userInfo) : {};
            } catch (error) {
                console.error('Failed to parse userInfo from localStorage:', error);
                return {};
            }
        })()
    }),
    getters: {
        getUserInfo: (state) => state.userInfo,
    },
    actions: {
        setUserInfo(userInfo) {
            this.userInfo = userInfo;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        },
        clearUserInfo() {
            // 清除 Pinia 中的数据
            this.userInfo = {};
            // 清除 localStorage 中的数据
            localStorage.removeItem('userInfo');
        },
    },

    // 使用 localStorage 进行持久化存储
    persist: {
        storage: localStorage,
    },
})