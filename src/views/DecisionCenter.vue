<template>
  <div class="decision-center">
    <el-row :gutter="20">
      <!-- 左侧：食物管理和设置 -->
      <el-col :xs="24" :lg="8">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>🎯 决策设置</span>
            </div>
          </template>

          <el-form label-width="80px">
            <el-form-item label="餐次选择">
              <el-select v-model="selectedMealType" placeholder="选择餐次" style="width: 100%">
                <el-option label="全部" value="all" />
                <el-option label="早餐" value="breakfast" />
                <el-option label="午餐" value="lunch" />
                <el-option label="晚餐" value="dinner" />
              </el-select>
            </el-form-item>

            <el-form-item label="决策次数">
              <el-input-number 
                v-model="decisionCount" 
                :min="1" 
                :max="10" 
                style="width: 100%"
              />
            </el-form-item>
          </el-form>

          <el-divider>食物库管理</el-divider>
          
          <div class="food-management">
            <el-button type="primary" @click="showAddFoodDialog = true" style="width: 100%">
              ➕ 添加食物
            </el-button>
            
            <el-table :data="filteredFoods" style="width: 100%; margin-top: 15px" max-height="300">
              <el-table-column prop="name" label="食物名称" width="100" />
              <el-table-column prop="category" label="分类" width="70" />
              <el-table-column label="餐次" width="60">
                <template #default="{ row }">
                  <el-tag size="small" :type="getMealTypeTag(row.mealType)">
                    {{ getMealTypeText(row.mealType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="权重" width="70">
                <template #default="{ row }">
                  <el-input-number 
                    v-model="row.weight" 
                    :min="1" 
                    :max="100" 
                    size="small"
                    @change="updateFoodWeight(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{ row }">
                  <el-button type="danger" size="small" @click="deleteFood(row.id)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>

      <!-- 中间：转盘 -->
      <el-col :xs="24" :lg="8">
        <el-card class="roulette-card">
          <template #header>
            <div class="card-header">
              <span>🎡 智能转盘</span>
            </div>
          </template>

          <div class="roulette-container">
            <div class="roulette-wheel" :class="{ spinning: isSpinning }">
              <canvas ref="rouletteCanvas" width="300" height="300"></canvas>
              <div class="roulette-pointer"></div>
            </div>
            
            <div class="roulette-result" v-if="selectedFood">
              <h3>🎉 今天吃：{{ selectedFood.name }}</h3>
              <p class="food-category">分类：{{ selectedFood.category }}</p>
              <el-button type="success" @click="recordSelection" style="margin-top: 10px">
                📋 记录到日记
              </el-button>
            </div>

            <el-button 
              type="primary" 
              size="large" 
              @click="spinRoulette"
              :disabled="isSpinning || filteredFoods.length === 0"
              style="margin-top: 20px; width: 100%"
            >
              {{ isSpinning ? '旋转中...' : '🎯 开始决策' }}
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：随机列表 -->
      <el-col :xs="24" :lg="8">
        <el-card class="random-list-card">
          <template #header>
            <div class="card-header">
              <span>📋 随机推荐</span>
            </div>
          </template>

          <div class="random-list">
            <el-button 
              type="primary" 
              @click="generateRandomList"
              :disabled="filteredFoods.length === 0"
              style="width: 100%; margin-bottom: 15px"
            >
              🎲 生成推荐列表
            </el-button>

            <el-list v-if="randomList.length > 0">
              <el-card 
                v-for="(food, index) in randomList" 
                :key="food.id"
                class="food-item-card"
                :class="{ 'selected-item': index === 0 }"
              >
                <div class="food-item">
                  <span class="rank">{{ index + 1 }}.</span>
                  <span class="name">{{ food.name }}</span>
                  <span class="category">{{ food.category }}</span>
                  <el-tag size="small" :type="getMealTypeTag(food.mealType)" class="meal-tag">
                    {{ getMealTypeText(food.mealType) }}
                  </el-tag>
                  <el-button 
                    size="small" 
                    type="success" 
                    @click="selectFromList(food)"
                  >
                    选择
                  </el-button>
                </div>
              </el-card>
            </el-list>

            <el-empty v-else description="暂无推荐，点击生成列表" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加食物对话框 -->
    <el-dialog v-model="showAddFoodDialog" title="添加新食物" width="500px">
      <el-form :model="newFood" label-width="80px">
        <el-form-item label="食物名称">
          <el-input v-model="newFood.name" placeholder="请输入食物名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="newFood.category" placeholder="选择分类" style="width: 100%">
            <el-option label="早餐" value="早餐" />
            <el-option label="荤菜" value="荤菜" />
            <el-option label="素菜" value="素菜" />
            <el-option label="荤素搭配" value="荤素搭配" />
            <el-option label="海鲜" value="海鲜" />
            <el-option label="汤类" value="汤类" />
            <el-option label="主食" value="主食" />
            <el-option label="小吃" value="小吃" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用餐次">
          <el-select v-model="newFood.mealType" placeholder="选择适用餐次" style="width: 100%">
            <el-option label="全部" value="all" />
            <el-option label="早餐" value="breakfast" />
            <el-option label="午餐" value="lunch" />
            <el-option label="晚餐" value="dinner" />
          </el-select>
        </el-form-item>
        <el-form-item label="权重">
          <el-input-number v-model="newFood.weight" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddFoodDialog = false">取消</el-button>
        <el-button type="primary" @click="addFood">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFoodStore } from '@/stores/food'
import type { FoodItem } from '@/types'

const foodStore = useFoodStore()
const selectedMealType = ref('all')
const decisionCount = ref(1)
const isSpinning = ref(false)
const selectedFood = ref<FoodItem | null>(null)
const randomList = ref<FoodItem[]>([])
const showAddFoodDialog = ref(false)

const newFood = ref({
  name: '',
  category: '',
  mealType: 'all' as const,
  weight: 50
})

const filteredFoods = computed(() => {
  return foodStore.getFoodsByMealType(selectedMealType.value)
})

const rouletteCanvas = ref<HTMLCanvasElement>()

onMounted(() => {
  drawRoulette()
})

const drawRoulette = () => {
  if (!rouletteCanvas.value || filteredFoods.value.length === 0) return

  const canvas = rouletteCanvas.value
  const ctx = canvas.getContext('2d')!
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = 140

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const totalWeight = filteredFoods.value.reduce((sum, food) => sum + food.weight, 0)
  let currentAngle = -Math.PI / 2

  filteredFoods.value.forEach((food, index) => {
    const sliceAngle = (food.weight / totalWeight) * 2 * Math.PI
    
    // 绘制扇形
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    
    // 使用不同颜色
    const hue = (index * 360 / filteredFoods.value.length) % 360
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // 绘制文字
    const textAngle = currentAngle + sliceAngle / 2
    const textX = centerX + Math.cos(textAngle) * (radius * 0.7)
    const textY = centerY + Math.sin(textAngle) * (radius * 0.7)
    
    ctx.save()
    ctx.translate(textX, textY)
    ctx.rotate(textAngle + Math.PI / 2)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(food.name, 0, 0)
    ctx.restore()

    currentAngle += sliceAngle
  })
}

const spinRoulette = () => {
  if (isSpinning.value || filteredFoods.value.length === 0) return

  isSpinning.value = true
  selectedFood.value = null

  // 根据权重随机选择
  const totalWeight = filteredFoods.value.reduce((sum, food) => sum + food.weight, 0)
  let random = Math.random() * totalWeight
  
  let selectedIndex = 0
  for (let i = 0; i < filteredFoods.value.length; i++) {
    random -= filteredFoods.value[i].weight
    if (random <= 0) {
      selectedIndex = i
      break
    }
  }

  // 模拟旋转动画
  setTimeout(() => {
    selectedFood.value = filteredFoods.value[selectedIndex]
    isSpinning.value = false
  }, 2000)
}

const generateRandomList = () => {
  const foods = [...filteredFoods.value]
  const weights = foods.map(f => f.weight)
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  
  const selected: FoodItem[] = []
  const count = Math.min(decisionCount.value, foods.length)
  
  for (let i = 0; i < count; i++) {
    let random = Math.random() * totalWeight
    let selectedIndex = 0
    
    for (let j = 0; j < foods.length; j++) {
      random -= foods[j].weight
      if (random <= 0) {
        selectedIndex = j
        break
      }
    }
    
    selected.push(foods[selectedIndex])
    foods.splice(selectedIndex, 1)
  }
  
  randomList.value = selected
}

const selectFromList = (food: FoodItem) => {
  selectedFood.value = food
}

const recordSelection = () => {
  if (!selectedFood.value) return
  
  foodStore.addDietRecord({
    foodName: selectedFood.value.name,
    foodId: selectedFood.value.id,
    mealType: selectedMealType.value === 'all' ? 'lunch' : selectedMealType.value as any,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    recommended: true
  })
  
  ElMessage.success('已记录到饮食日记！')
}

const addFood = () => {
  if (!newFood.value.name || !newFood.value.category) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  foodStore.addFood({
    name: newFood.value.name,
    category: newFood.value.category,
    mealType: newFood.value.mealType,
    weight: newFood.value.weight
  })
  
  newFood.value = { name: '', category: '', mealType: 'all', weight: 50 }
  showAddFoodDialog.value = false
  ElMessage.success('添加成功！')
}

const updateFoodWeight = (food: FoodItem) => {
  foodStore.updateFood(food.id, { weight: food.weight })
}

const deleteFood = (id: string) => {
  ElMessageBox.confirm('确定要删除这个食物吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    foodStore.deleteFood(id)
    ElMessage.success('删除成功！')
  })
}

const getMealTypeText = (mealType: string) => {
  const map = {
    'all': '全部',
    'breakfast': '早餐',
    'lunch': '午餐',
    'dinner': '晚餐'
  }
  return map[mealType as keyof typeof map] || mealType
}

const getMealTypeTag = (mealType: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map = {
    'all': 'info' as const,
    'breakfast': 'warning' as const,
    'lunch': 'success' as const,
    'dinner': 'danger' as const
  }
  return map[mealType as keyof typeof map] || 'info' as const
}

// 监听食物变化，重新绘制转盘
import { watch } from 'vue'
watch(filteredFoods, () => {
  nextTick(() => {
    drawRoulette()
  })
}, { deep: true })
</script>

<style scoped>
.decision-center {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-card, .roulette-card, .random-list-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.roulette-container {
  text-align: center;
}

.roulette-wheel {
  position: relative;
  display: inline-block;
  margin: 20px 0;
}

.roulette-wheel.spinning {
  animation: spin 2s ease-out;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.roulette-pointer {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 20px solid #ff4757;
  z-index: 10;
}

.roulette-result {
  margin: 20px 0;
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
}

.food-category {
  opacity: 0.9;
  margin: 5px 0;
}

.food-item-card {
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.food-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.food-item-card.selected-item {
  border: 2px solid #67c23a;
  background: #f0f9ff;
}

.food-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank {
  font-weight: bold;
  color: #667eea;
  min-width: 25px;
}

.name {
  flex: 1;
  font-weight: 500;
}

.category {
  color: #666;
  font-size: 12px;
}

.meal-tag {
  margin-left: 4px;
}

@media (max-width: 768px) {
  .el-row {
    margin: 0;
  }
  
  .el-col {
    padding: 0 !important;
  }
}
</style>