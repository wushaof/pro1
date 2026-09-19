import { defineStore } from 'pinia'

const TOKEN_KEY = 'angang_token'
const USER_KEY = 'angang_user'

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    profile: loadUser() || {
      name: '管理员',
      account: 'admin',
      dept: '信息中心',
      role: '超级管理员',
    },
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    login({ account, password }) {
      if (account !== 'admin' || password !== '123456') {
        throw new Error('账号或密码错误，请使用 admin / 123456')
      }
      this.token = `mock-${Date.now()}`
      this.profile = {
        name: '管理员',
        account: 'admin',
        dept: '信息中心',
        role: '超级管理员',
      }
      localStorage.setItem(TOKEN_KEY, this.token)
      localStorage.setItem(USER_KEY, JSON.stringify(this.profile))
    },
    logout() {
      this.token = ''
      localStorage.removeItem(TOKEN_KEY)
    },
    updateProfile(payload) {
      this.profile = { ...this.profile, ...payload }
      localStorage.setItem(USER_KEY, JSON.stringify(this.profile))
    },
  },
})
