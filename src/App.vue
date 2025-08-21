<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1 class="app-title">🍽️ 今天吃什么</h1>
        <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          @select="handleMenuSelect"
          class="app-menu"
        >
          <el-menu-item index="decision">决策中心</el-menu-item>
          <el-menu-item index="diary">饮食日记</el-menu-item>
          <el-menu-item index="stats">统计分析</el-menu-item>
          <el-menu-item index="settings">数据管理</el-menu-item>
        </el-menu>
      </div>
    </el-header>

    <el-main class="app-main">
      <router-view />
    </el-main>

<el-footer class="app-footer">
    <p>
    © 2025 Nyquist ·
    <a href="https://kimi.moonshot.cn" target="_blank" rel="noopener">Kimi-K2 设计</a> ·
    <a href="https://trae.ai" target="_blank" rel="noopener">Trae 编码</a> ·
    </p>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFoodStore } from '@/stores/food'

const router = useRouter()
const foodStore = useFoodStore()
const activeIndex = ref('decision')

const handleMenuSelect = (key: string) => {
  activeIndex.value = key
  router.push({ name: key })
}

onMounted(() => {
  foodStore.loadFromLocalStorage()
  
  // 如果没有食物数据，添加一些示例数据
  if (foodStore.foods.length === 0) {
    const sampleFoods = [
      { name: '红烧肉', category: '荤菜', weight: 80, mealType: 'lunch' as const },
      { name: '番茄炒蛋', category: '荤素搭配', weight: 90, mealType: 'all' as const },
      { name: '青菜豆腐汤', category: '素菜', weight: 70, mealType: 'dinner' as const },
      { name: '牛奶燕麦', category: '早餐', weight: 85, mealType: 'breakfast' as const },
      { name: '宫保鸡丁', category: '荤菜', weight: 75, mealType: 'lunch' as const },
      { name: '清蒸鲈鱼', category: '海鲜', weight: 80, mealType: 'dinner' as const }
    ]
    
    sampleFoods.forEach(food => foodStore.addFood(food))
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.app-title {
  margin: 0;
  color: #ff6b35;
  font-size: 24px;
  font-weight: bold;
}

.app-menu {
  border-bottom: none;
  background: transparent;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-footer {
  text-align: center;
  color: rgba(139, 69, 19, 0.8);
  background: transparent;
}

.app-footer a {
  color: rgba(139, 69, 19, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
  font-weight: 500;
}

.app-footer a:hover {
  color: #ff6b35;
  text-decoration: underline;
}

.footer-content {
  text-align: center;
  line-height: 1.6;
}

.footer-content p {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    padding: 10px 0;
  }
  
  .app-title {
    margin-bottom: 10px;
    font-size: 20px;
  }
  
  .app-menu {
    width: 100%;
    justify-content: center;
  }
}
</style>
