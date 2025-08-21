<template>
  <div class="settings">
    <el-row :gutter="20">
      <!-- 数据概览 -->
      <el-col :span="24">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>📊 数据概览</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :xs="12" :sm="6" :lg="6">
              <div class="data-stat">
                <div class="stat-icon">🍽️</div>
                <div class="stat-info">
                  <div class="stat-number">{{ foodStore.foods.length }}</div>
                  <div class="stat-label">食物总数</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6" :lg="6">
              <div class="data-stat">
                <div class="stat-icon">📝</div>
                <div class="stat-info">
                  <div class="stat-number">{{ foodStore.dietRecords.length }}</div>
                  <div class="stat-label">饮食记录</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6" :lg="6">
              <div class="data-stat">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                  <div class="stat-number">{{ activeDays }}</div>
                  <div class="stat-label">活跃天数</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6" :lg="6">
              <div class="data-stat">
                <div class="stat-icon">💾</div>
                <div class="stat-info">
                  <div class="stat-number">{{ dataSize }}</div>
                  <div class="stat-label">数据大小</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据管理操作 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span>💾 数据备份</span>
            </div>
          </template>
          
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="exportData" style="width: 100%">
              📤 导出数据
            </el-button>
            <p class="action-description">
              将食物库和饮食记录导出为 JSON 文件，可用于备份或迁移数据
            </p>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span>📥 数据恢复</span>
            </div>
          </template>
          
          <div class="action-buttons">
            <el-upload
              class="upload-demo"
              action="#"
              :before-upload="importData"
              :show-file-list="false"
              accept=".json"
            >
              <el-button type="success" size="large" style="width: 100%">
                📥 导入数据
              </el-button>
            </el-upload>
            <p class="action-description">
              从之前导出的 JSON 文件中恢复数据，将覆盖现有数据
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据清理 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="danger-card">
          <template #header>
            <div class="card-header">
              <span>⚠️ 数据清理</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :xs="24" :lg="8">
              <div class="danger-zone">
                <h4>清理食物库</h4>
                <p>删除所有食物数据，但保留饮食记录</p>
                <el-button type="warning" @click="confirmClearFoods">
                  🗑️ 清理食物
                </el-button>
              </div>
            </el-col>
            <el-col :xs="24" :lg="8">
              <div class="danger-zone">
                <h4>清理记录</h4>
                <p>删除所有饮食记录，但保留食物库</p>
                <el-button type="warning" @click="confirmClearRecords">
                  🗑️ 清理记录
                </el-button>
              </div>
            </el-col>
            <el-col :xs="24" :lg="8">
              <div class="danger-zone">
                <h4>重置所有</h4>
                <p>删除所有数据，恢复到初始状态</p>
                <el-button type="danger" @click="confirmResetAll">
                  ⚠️ 重置全部
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 开源项目 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="github-card">
          <template #header>
            <div class="card-header">
              <span>🌟 开源项目</span>
            </div>
          </template>
          
          <div style="text-align: center; padding: 20px 0;">
            <p style="margin-bottom: 15px; font-size: 16px;">
              这是一个开源项目，欢迎访问GitHub仓库：
            </p>
            <a 
              href="https://github.com/Zyilin98/what-to-eat" 
              target="_blank" 
              rel="noopener noreferrer"
              class="github-link"
            >
              <el-button type="primary" size="large" style="font-size: 16px;">
                <svg height="16" width="16" viewBox="0 0 16 16" style="margin-right: 8px; vertical-align: text-bottom;">
                  <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                查看GitHub仓库
              </el-button>
            </a>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">
              欢迎⭐ Star、🍴 Fork 和 🤝 贡献代码！
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据预览 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <span>🍽️ 食物库预览</span>
              <el-button type="text" @click="showFoodsDialog = true">
                查看全部
              </el-button>
            </div>
          </template>
          
          <el-table :data="foodStore.foods.slice(0, 5)" style="width: 100%">
            <el-table-column prop="name" label="食物名称" />
            <el-table-column prop="category" label="分类" />
            <el-table-column prop="weight" label="权重" />
            <el-table-column prop="mealType" label="适用餐次">
              <template #default="{ row }">
                {{ getMealTypeText(row.mealType) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <span>📝 最近记录</span>
              <el-button type="text" @click="showRecordsDialog = true">
                查看全部
              </el-button>
            </div>
          </template>
          
          <el-table :data="recentRecords" style="width: 100%">
            <el-table-column prop="date" label="日期" />
            <el-table-column prop="foodName" label="食物" />
            <el-table-column prop="mealType" label="餐次">
              <template #default="{ row }">
                {{ getMealTypeText(row.mealType) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 食物库对话框 -->
    <el-dialog v-model="showFoodsDialog" title="食物库详情" width="800px">
      <el-table :data="foodStore.foods" style="width: 100%" max-height="400">
        <el-table-column prop="name" label="食物名称" />
        <el-table-column prop="category" label="分类" />
        <el-table-column prop="weight" label="权重" />
        <el-table-column prop="mealType" label="适用餐次">
          <template #default="{ row }">
            {{ getMealTypeText(row.mealType) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
      </el-table>
    </el-dialog>

    <!-- 记录对话框 -->
    <el-dialog v-model="showRecordsDialog" title="饮食记录详情" width="800px">
      <el-table :data="foodStore.dietRecords" style="width: 100%" max-height="400">
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="foodName" label="食物" />
        <el-table-column prop="mealType" label="餐次">
          <template #default="{ row }">
            {{ getMealTypeText(row.mealType) }}
          </template>
        </el-table-column>
        <el-table-column prop="calories" label="卡路里">
          <template #default="{ row }">
            {{ row.calories ? `${row.calories}卡` : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFoodStore } from '@/stores/food'
import { ElMessage, ElMessageBox } from 'element-plus'

const foodStore = useFoodStore()

const showFoodsDialog = ref(false)
const showRecordsDialog = ref(false)

// 计算数据大小
const dataSize = computed(() => {
  const foodsSize = JSON.stringify(foodStore.foods).length
  const recordsSize = JSON.stringify(foodStore.dietRecords).length
  const totalKB = ((foodsSize + recordsSize) / 1024).toFixed(1)
  return `${totalKB} KB`
})

// 计算活跃天数
const activeDays = computed(() => {
  const dates = new Set(foodStore.dietRecords.map(r => r.date))
  return dates.size
})

// 最近记录
const recentRecords = computed(() => {
  return [...foodStore.dietRecords]
    .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
    .slice(0, 5)
})

// 获取餐次文本
const getMealTypeText = (type: string) => {
  const map = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
    all: '全部'
  }
  return map[type as keyof typeof map] || type
}

// 导出数据
const exportData = () => {
  foodStore.exportData()
}

// 导入数据
const importData = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      ElMessageBox.confirm(
        '导入数据将覆盖现有数据，是否继续？',
        '确认导入',
        {
          confirmButtonText: '确认导入',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        foodStore.importData(file).then(() => {
          ElMessage.success('数据导入成功！')
        }).catch(() => {
          ElMessage.error('数据格式错误，导入失败！')
        })
      })
    } catch (error) {
      ElMessage.error('文件格式错误，请选择正确的 JSON 文件！')
    }
  }
  reader.readAsText(file)
  return false // 阻止自动上传
}

// 确认清理操作
const confirmClearFoods = () => {
  ElMessageBox.confirm(
    '确定要清理所有食物数据吗？此操作不可恢复！',
    '清理确认',
    {
      confirmButtonText: '确认清理',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    foodStore.foods = []
    foodStore.saveToLocalStorage()
    ElMessage.success('食物库已清理！')
  })
}

const confirmClearRecords = () => {
  ElMessageBox.confirm(
    '确定要清理所有饮食记录吗？此操作不可恢复！',
    '清理确认',
    {
      confirmButtonText: '确认清理',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    foodStore.dietRecords = []
    foodStore.saveToLocalStorage()
    ElMessage.success('饮食记录已清理！')
  })
}

const confirmResetAll = () => {
  ElMessageBox.confirm(
    '确定要重置所有数据吗？这将删除食物库和饮食记录，不可恢复！',
    '重置确认',
    {
      confirmButtonText: '确认重置',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    foodStore.clearAllData()
    ElMessage.success('所有数据已重置！')
  })
}

onMounted(() => {
  foodStore.loadFromLocalStorage()
})
</script>

<style scoped>
.settings {
  max-width: 1200px;
  margin: 0 auto;
}

.overview-card, .action-card, .danger-card, .preview-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.data-stat {
  text-align: center;
  padding: 20px;
}

.stat-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.action-buttons {
  text-align: center;
}

.action-description {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.danger-card {
  border-color: #ff6b6b;
}

.danger-zone {
  text-align: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin: 10px;
}

.danger-zone h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.danger-zone p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
}

.upload-demo {
  width: 100%;
}

@media (max-width: 768px) {
  .data-stat {
    padding: 15px;
  }
  
  .stat-icon {
    font-size: 28px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .danger-zone {
    margin: 5px 0;
  }
}
</style>