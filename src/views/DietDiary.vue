<template>
  <div class="diet-diary">
    <el-row :gutter="20">
      <!-- 左侧：添加记录 -->
      <el-col :xs="24" :lg="8">
        <el-card class="add-record-card">
          <template #header>
            <div class="card-header">
              <span>📝 添加饮食记录</span>
            </div>
          </template>

          <el-form :model="newRecord" label-width="80px">
            <el-form-item label="食物名称">
              <el-select
                v-model="newRecord.foodName"
                filterable
                allow-create
                placeholder="选择或输入食物名称"
                style="width: 100%"
              >
                <el-option
                  v-for="food in foodStore.foods"
                  :key="food.id"
                  :label="food.name"
                  :value="food.name"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="餐次">
              <el-select v-model="newRecord.mealType" placeholder="选择餐次" style="width: 100%">
                <el-option label="早餐" value="breakfast" />
                <el-option label="午餐" value="lunch" />
                <el-option label="晚餐" value="dinner" />
                <el-option label="加餐" value="snack" />
              </el-select>
            </el-form-item>

            <el-form-item label="日期">
              <el-date-picker
                v-model="newRecord.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="时间">
              <el-time-picker
                v-model="newRecord.time"
                placeholder="选择时间"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="卡路里">
              <el-input-number
                v-model="newRecord.calories"
                :min="0"
                :max="2000"
                placeholder="可选"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                v-model="newRecord.notes"
                type="textarea"
                :rows="3"
                placeholder="添加备注..."
              />
            </el-form-item>

            <el-button type="primary" @click="addRecord" style="width: 100%">
              📋 添加记录
            </el-button>
          </el-form>
        </el-card>

        <!-- 今日统计 -->
        <el-card class="today-stats-card" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>📊 今日统计</span>
            </div>
          </template>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ todayRecords.length }}</div>
              <div class="stat-label">今日记录</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ todayCalories || '-' }}</div>
              <div class="stat-label">总卡路里</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ todayFoods.length }}</div>
              <div class="stat-label">不同食物</div>
            </div>
          </div>

          <el-divider>今日食物</el-divider>
          <div class="today-foods">
            <el-tag
              v-for="food in todayFoods"
              :key="food"
              type="info"
              class="food-tag"
            >
              {{ food }}
            </el-tag>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：历史记录 -->
      <el-col :xs="24" :lg="16">
        <el-card class="history-card">
          <template #header>
            <div class="card-header">
              <span>📜 历史记录</span>
              <div class="header-actions">
            <el-select
              v-model="mealFilter"
              placeholder="筛选餐次"
              clearable
              style="width: 120px; margin-right: 10px"
            >
              <el-option label="早餐" value="breakfast" />
              <el-option label="午餐" value="lunch" />
              <el-option label="晚餐" value="dinner" />
              <el-option label="加餐" value="snack" />
              <template #empty>
                <div style="padding: 10px; text-align: center; color: #999">
                  暂无餐次记录
                </div>
              </template>
            </el-select>
            <el-select
              v-model="foodFilter"
              placeholder="筛选食物"
              clearable
              filterable
              style="width: 150px; margin-right: 10px"
              :disabled="availableFoods.length === 0"
            >
              <el-option
                v-for="food in availableFoods"
                :key="food"
                :label="food"
                :value="food"
              />
              <template #empty>
                <div style="padding: 10px; text-align: center; color: #999">
                  暂无食物记录
                </div>
              </template>
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px; margin-right: 10px"
            />
            <el-button type="danger" @click="clearAllRecords">
              🗑️ 清空记录
            </el-button>
          </div>
            </div>
          </template>

          <el-table :data="filteredRecords" style="width: 100%" max-height="600">
            <el-table-column prop="date" label="日期" width="100" sortable>
              <template #default="{ row }">
                {{ formatDate(row.date) }}
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" width="80" />
            <el-table-column prop="foodName" label="食物" />
            <el-table-column prop="mealType" label="餐次" width="80">
              <template #default="{ row }">
                <el-tag :type="getMealTypeTag(row.mealType)">
                  {{ getMealTypeText(row.mealType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="calories" label="卡路里" width="80">
              <template #default="{ row }">
                {{ row.calories ? `${row.calories}卡` : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="notes" label="备注" show-overflow-tooltip />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="deleteRecord(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination" v-if="filteredRecords.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredRecords.length"
              layout="prev, pager, next"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFoodStore } from '@/stores/food'
import type { DietRecord } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const foodStore = useFoodStore()

const newRecord = ref({
  foodName: '',
  mealType: 'lunch' as const,
  date: new Date(),
  time: new Date(),
  calories: undefined as number | undefined,
  notes: ''
})

const dateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const mealFilter = ref('')
const foodFilter = ref('')

// 计算今日记录
const todayRecords = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return foodStore.getDietRecordsByDate(today)
})

const todayCalories = computed(() => {
  return todayRecords.value.reduce((sum, record) => sum + (record.calories || 0), 0)
})

const todayFoods = computed(() => {
  const foods = new Set(todayRecords.value.map(record => record.foodName))
  return Array.from(foods)
})

const availableFoods = computed(() => {
  const foods = new Set(foodStore.dietRecords.map(record => record.foodName))
  return Array.from(foods).sort()
})

// 过滤历史记录
const filteredRecords = computed(() => {
  let records = [...foodStore.dietRecords].sort((a, b) => 
    new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
  )

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    const startDate = start.toISOString().split('T')[0]
    const endDate = end.toISOString().split('T')[0]
    
    records = records.filter(record => 
      record.date >= startDate && record.date <= endDate
    )
  }

  if (mealFilter.value) {
    records = records.filter(record => record.mealType === mealFilter.value)
  }

  if (foodFilter.value) {
    records = records.filter(record => record.foodName === foodFilter.value)
  }

  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  
  return records.slice(startIndex, endIndex)
})

const addRecord = () => {
  if (!newRecord.value.foodName.trim()) {
    ElMessage.warning('请输入食物名称')
    return
  }

  const record: Omit<DietRecord, 'id'> = {
    foodName: newRecord.value.foodName.trim(),
    mealType: newRecord.value.mealType,
    date: newRecord.value.date.toISOString().split('T')[0],
    time: newRecord.value.time.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    calories: newRecord.value.calories,
    notes: newRecord.value.notes.trim(),
    recommended: false
  }

  foodStore.addDietRecord(record)
  
  // 重置表单
  newRecord.value = {
    foodName: '',
    mealType: 'lunch',
    date: new Date(),
    time: new Date(),
    calories: undefined,
    notes: ''
  }

  ElMessage.success('记录添加成功！')
}

const deleteRecord = (id: string) => {
  ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    foodStore.deleteDietRecord(id)
    ElMessage.success('删除成功！')
  })
}

const clearAllRecords = () => {
  ElMessageBox.confirm('确定要清空所有记录吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定清空',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    foodStore.dietRecords = []
    foodStore.saveToLocalStorage()
    ElMessage.success('所有记录已清空！')
  })
}

const formatDate = (date: string) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const getMealTypeText = (type: string) => {
  const map = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐'
  }
  return map[type as keyof typeof map] || type
}

const getMealTypeTag = (type: string) => {
  const map = {
    breakfast: 'warning',
    lunch: 'success',
    dinner: 'info',
    snack: 'default'
  }
  return map[type as keyof typeof map] || 'info'
}

onMounted(() => {
  foodStore.loadFromLocalStorage()
})

watch([mealFilter, foodFilter, dateRange], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.diet-diary {
  max-width: 1200px;
  margin: 0 auto;
}

.add-record-card, .today-stats-card, .history-card {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  text-align: center;
}

.stat-item {
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.today-foods {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.food-tag {
  margin: 2px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .el-date-picker {
    width: 100% !important;
    margin-bottom: 10px;
  }
}
</style>