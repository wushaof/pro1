<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <h1>鞍钢物流智能平台</h1>
      <p class="tip"> · 账号 admin / 123456</p>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="onSubmit">
        <el-form-item prop="account">
          <el-input v-model="form.account" prefix-icon="User" placeholder="账号" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" prefix-icon="Lock" type="password" show-password placeholder="密码" />
        </el-form-item>
        <el-button type="primary" class="submit" :loading="loading" @click="onSubmit">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const formRef = ref()
    const loading = ref(false)
    const form = reactive({ account: 'admin', password: '123456' })
    const rules = {
      account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    }

    const onSubmit = async () => {
      await formRef.value.validate()
      loading.value = true
      try {
        userStore.login(form)
        ElMessage.success('登录成功')
        router.push(route.query.redirect || '/overview')
      } catch (error) {
        ElMessage.error(error.message)
      } finally {
        loading.value = false
      }
    }

    return { formRef, form, rules, loading, onSubmit }
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2a37 0%, #c41e3a 100%);
}

.login-card {
  width: 380px;
}

h1 {
  margin: 0 0 8px;
  text-align: center;
  font-size: 22px;
}

.tip {
  margin: 0 0 20px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.submit {
  width: 100%;
}
</style>
