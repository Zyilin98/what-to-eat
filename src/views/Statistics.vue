<template>
  <div class="statistics">
    <el-row :gutter="20">
      <!-- 统计筛选 -->
      <el-col :span="24">
        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <span>📊 统计筛选</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-select v-model="timeRange" placeholder="选择时间范围" style="width: 100%">
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
                <el-option label="全部" value="all" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-col>
            <el-col :span="8" v-if="timeRange === 'custom'">
              <el-date-picker
                v-model="customDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="8">
              <el-select v-model="viewType" placeholder="视图类型" style="width: 100%">
                <el-option label="食物频率" value="frequency" />
                <el-option label="分类占比" value="category" />
                <el-option label="餐次分布" value="mealtime" />
                <el-option label="趋势分析" value="trend" />
              </el-select>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计概览卡片 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="12" :sm="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-number">{{ totalRecords }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">🍽️</div>
            <div class="stat-info">
              <div class="stat-number">{{ uniqueFoods }}</div>
              <div class="stat-label">不同食物</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">🔥</div>
            <div class="stat-info">
              <div class="stat-number">{{ totalCalories || '-' }}</div>
              <div class="stat-label">总卡路里</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <div class="stat-number">{{ activeDays }}</div>
              <div class="stat-label">活跃天数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 食物频率排行 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>🏆 食物频率排行</span>
            </div>
          </template>
          <div ref="frequencyChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 分类占比 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>🥗 食物分类占比</span>
            </div>
          </template>
          <div ref="categoryChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 餐次分布 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>⏰ 餐次分布</span>
            </div>
          </template>
          <div ref="mealtimeChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 趋势分析 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>📈 饮食趋势</span>
            </div>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>📋 详细数据</span>
              <el-button type="primary" @click="exportData">
                📤 导出数据
              </el-button>
            </div>
          </template>

          <el-table :data="detailedStats" style="width: 100%" max-height="400">
            <el-table-column prop="rank" label="排名" width="60" />
            <el-table-column prop="foodName" label="食物名称" />
            <el-table-column prop="category" label="分类" />
            <el-table-column prop="count" label="出现次数" sortable />
            <el-table-column prop="percentage" label="占比">
              <template #default="{ row }">
                {{ row.percentage.toFixed(1) }}%
              </template>
            </el-table-column>
            <el-table-column prop="lastEaten" label="最近食用">
              <template #default="{ row }">
                {{ formatDate(row.lastEaten) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useFoodStore } from '@/stores/food'
import type { FoodStats } from '@/types'

const foodStore = useFoodStore()

const timeRange = ref('month')
const viewType = ref('frequency')
const customDateRange = ref<[Date, Date] | null>(null)

const frequencyChart = ref<HTMLElement>()
const categoryChart = ref<HTMLElement>()
const mealtimeChart = ref<HTMLElement>()
const trendChart = ref<HTMLElement>()

let frequencyChartInstance: echarts.ECharts | null = null
let categoryChartInstance: echarts.ECharts | null = null
let mealtimeChartInstance: echarts.ECharts | null = null
let trendChartInstance: echarts.ECharts | null = null

// 计算统计数据
const filteredRecords = computed(() => {
  try {
    let records = [...foodStore.dietRecords]
    
    if (timeRange.value === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      records = records.filter(r => r.date >= weekAgoStr)
    } else if (timeRange.value === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      const monthAgoStr = monthAgo.toISOString().split('T')[0]
      records = records.filter(r => r.date >= monthAgoStr)
    } else if (timeRange.value === 'custom' && customDateRange.value) {
      const [start, end] = customDateRange.value
      const startStr = start.toISOString().split('T')[0]
      const endStr = end.toISOString().split('T')[0]
      records = records.filter(r => r.date >= startStr && r.date <= endStr)
    }
    
    return records
  } catch (error) {
    console.error('Error filtering records:', error)
    return []
  }
})

const totalRecords = computed(() => filteredRecords.value.length)

const uniqueFoods = computed(() => {
  const foods = new Set(filteredRecords.value.map(r => r.foodName))
  return foods.size
})

const totalCalories = computed(() => {
  return filteredRecords.value.reduce((sum, r) => sum + (r.calories || 0), 0)
})

const activeDays = computed(() => {
  const dates = new Set(filteredRecords.value.map(r => r.date))
  return dates.size
})

const detailedStats = computed(() => {
  const stats = new Map<string, {
    count: number
    category: string
    lastEaten: string
  }>()
  
  filteredRecords.value.forEach(record => {
    const existing = stats.get(record.foodName)
    if (existing) {
      existing.count++
      if (record.date > existing.lastEaten) {
        existing.lastEaten = record.date
      }
    } else {
      const food = foodStore.foods.find(f => f.name === record.foodName)
      stats.set(record.foodName, {
        count: 1,
        category: food?.category || '未知',
        lastEaten: record.date
      })
    }
  })
  
  const total = filteredRecords.value.length
  return Array.from(stats.entries())
    .map(([foodName, data], index) => ({
      rank: index + 1,
      foodName,
      category: data.category,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      lastEaten: data.lastEaten
    }))
    .sort((a, b) => b.count - a.count)
})

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    try {
      if (frequencyChart.value) {
        initFrequencyChart()
      }
      if (categoryChart.value) {
        initCategoryChart()
      }
      if (mealtimeChart.value) {
        initMealtimeChart()
      }
      if (trendChart.value) {
        initTrendChart()
      }
    } catch (error) {
      console.error('Error initializing charts:', error)
    }
  })
}

const initFrequencyChart = () => {
  if (!frequencyChart.value) return
  
  try {
    frequencyChartInstance = echarts.init(frequencyChart.value)
    const topFoods = detailedStats.value.slice(0, 10)
    
    if (topFoods.length === 0) {
      frequencyChartInstance.setOption({
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center'
        }
      })
      return
    }
    
    const option = {
      title: {
        text: 'Top 10 食物频率',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: topFoods.map(item => item.foodName).reverse(),
        axisLabel: {
          interval: 0,
          rotate: 0
        }
      },
      series: [
        {
          name: '出现次数',
          type: 'bar',
          data: topFoods.map(item => item.count).reverse(),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ])
          }
        }
      ]
    }
    
    frequencyChartInstance.setOption(option)
  } catch (error) {
    console.error('Error initializing frequency chart:', error)
  }
}

const initCategoryChart = () => {
  if (!categoryChart.value) return
  
  try {
    categoryChartInstance = echarts.init(categoryChart.value)
    
    const categoryStats = new Map<string, number>()
    detailedStats.value.forEach(item => {
      const current = categoryStats.get(item.category) || 0
      categoryStats.set(item.category, current + item.count)
    })
    
    const data = Array.from(categoryStats.entries()).map(([name, value]) => ({
      name,
      value
    }))
    
    if (data.length === 0) {
      categoryChartInstance.setOption({
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center'
        }
      })
      return
    }
    
    const option = {
      title: {
        text: '食物分类分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '分类占比',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ]
    }
    
    categoryChartInstance.setOption(option)
  } catch (error) {
    console.error('Error initializing category chart:', error)
  }
}

const initMealtimeChart = () => {
  if (!mealtimeChart.value) return
  
  try {
    mealtimeChartInstance = echarts.init(mealtimeChart.value)
    
    const mealtimeStats = new Map<string, number>()
    filteredRecords.value.forEach(record => {
      const current = mealtimeStats.get(record.mealType) || 0
      mealtimeStats.set(record.mealType, current + 1)
    })
    
    const mealTypeMap = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐'
    }
    
    const data = Array.from(mealtimeStats.entries()).map(([type, count]) => ({
      name: mealTypeMap[type as keyof typeof mealTypeMap] || type,
      value: count
    }))
    
    if (data.length === 0) {
      mealtimeChartInstance.setOption({
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center'
        }
      })
      return
    }
    
    const option = {
      title: {
        text: '餐次分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '餐次',
          type: 'pie',
          radius: '50%',
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    
    mealtimeChartInstance.setOption(option)
  } catch (error) {
    console.error('Error initializing mealtime chart:', error)
  }
}

const initTrendChart = () => {
  if (!trendChart.value) return
  
  try {
    trendChartInstance = echarts.init(trendChart.value)
    
    const dailyStats = new Map<string, number>()
    filteredRecords.value.forEach(record => {
      const current = dailyStats.get(record.date) || 0
      dailyStats.set(record.date, current + 1)
    })
    
    const dates = Array.from(dailyStats.keys()).sort()
    const counts = dates.map(date => dailyStats.get(date) || 0)
    
    if (dates.length === 0) {
      trendChartInstance.setOption({
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center'
        }
      })
      return
    }
    
    const option = {
      title: {
        text: '每日饮食记录趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates.map(date => formatDate(date)),
        axisLabel: {
          interval: Math.floor(dates.length / 7),
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '记录数'
      },
      series: [
        {
          name: '每日记录',
          type: 'line',
          data: counts,
          smooth: true,
          itemStyle: {
            color: '#667eea'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
            ])
          }
        }
      ]
    }
    
    trendChartInstance.setOption(option)
  } catch (error) {
    console.error('Error initializing trend chart:', error)
  }
}

const exportData = () => {
  const data = {
    summary: {
      totalRecords: totalRecords.value,
      uniqueFoods: uniqueFoods.value,
      totalCalories: totalCalories.value,
      activeDays: activeDays.value
    },
    detailedStats: detailedStats.value,
    rawData: filteredRecords.value,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `statistics-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const formatDate = (date: string) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 响应式处理
const handleResize = () => {
  frequencyChartInstance?.resize()
  categoryChartInstance?.resize()
  mealtimeChartInstance?.resize()
  trendChartInstance?.resize()
}

onMounted(() => {
  try {
    foodStore.loadFromLocalStorage()
    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('Error initializing statistics:', error)
  }
  window.addEventListener('resize', handleResize)
})

watch([timeRange, customDateRange, filteredRecords], () => {
  initCharts()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  frequencyChartInstance?.dispose()
  categoryChartInstance?.dispose()
  mealtimeChartInstance?.dispose()
  trendChartInstance?.dispose()
})
</script>

<style scoped>
.statistics {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.filter-card, .chart-card, .detail-card, .stat-card {
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

.stat-card {
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.stat-icon {
  font-size: 36px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.chart-container {
  height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .statistics {
    max-width: 100%;
    padding: 0 5px;
  }
  
  .stat-content {
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-icon {
    font-size: 28px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .filter-card .el-row {
    margin: 0 -5px;
  }
  
  .filter-card .el-col {
    padding: 0 5px !important;
    margin-bottom: 10px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .el-table {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .statistics {
    padding: 0 5px;
  }
  
  .stat-card {
    padding: 15px 10px;
  }
  
  .stat-content {
    gap: 8px;
  }
  
  .stat-icon {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 18px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .card-header span {
    text-align: center;
  }
}
</style>