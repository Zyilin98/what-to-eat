import { defineStore } from 'pinia'
import type { FoodItem, DietRecord } from '@/types'

interface FoodStoreState {
  foods: FoodItem[]
  dietRecords: DietRecord[]
}

export const useFoodStore = defineStore('food', {
  state: (): FoodStoreState => ({
    foods: [],
    dietRecords: []
  }),

  getters: {
    getFoodsByMealType: (state) => (mealType: string) => {
      if (mealType === 'all') return state.foods
      return state.foods.filter(food => food.mealType === mealType || food.mealType === 'all')
    },

    getFoodById: (state) => (id: string) => {
      return state.foods.find(food => food.id === id)
    },

    getDietRecordsByDate: (state) => (date: string) => {
      return state.dietRecords.filter(record => record.date === date)
    },

    getDietRecordsByWeek: (state) => (weekStart: string, weekEnd: string) => {
      return state.dietRecords.filter(record => {
        const recordDate = new Date(record.date)
        const start = new Date(weekStart)
        const end = new Date(weekEnd)
        return recordDate >= start && recordDate <= end
      })
    },

    getDietRecordsByMonth: (state) => (year: number, month: number) => {
      return state.dietRecords.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate.getFullYear() === year && recordDate.getMonth() === month
      })
    },

    getFoodStats: (state) => {
      const stats = new Map<string, { count: number; category: string }>()
      
      state.dietRecords.forEach(record => {
        const existing = stats.get(record.foodName)
        if (existing) {
          existing.count++
        } else {
          const food = state.foods.find(f => f.name === record.foodName)
          stats.set(record.foodName, { 
            count: 1, 
            category: food?.category || '未知' 
          })
        }
      })

      const total = state.dietRecords.length
      return Array.from(stats.entries()).map(([foodName, data]) => ({
        foodName,
        count: data.count,
        percentage: total > 0 ? (data.count / total) * 100 : 0,
        category: data.category
      })).sort((a, b) => b.count - a.count)
    }
  },

  actions: {
    addFood(food: Omit<FoodItem, 'id'>) {
      const newFood: FoodItem = {
        ...food,
        id: Date.now().toString()
      }
      this.foods.push(newFood)
      this.saveToLocalStorage()
    },

    updateFood(id: string, updates: Partial<FoodItem>) {
      const index = this.foods.findIndex(food => food.id === id)
      if (index !== -1) {
        this.foods[index] = { ...this.foods[index], ...updates }
        this.saveToLocalStorage()
      }
    },

    deleteFood(id: string) {
      const index = this.foods.findIndex(food => food.id === id)
      if (index !== -1) {
        this.foods.splice(index, 1)
        this.saveToLocalStorage()
      }
    },

    addDietRecord(record: Omit<DietRecord, 'id'>) {
      const newRecord: DietRecord = {
        ...record,
        id: Date.now().toString()
      }
      this.dietRecords.push(newRecord)
      this.saveToLocalStorage()
    },

    deleteDietRecord(id: string) {
      const index = this.dietRecords.findIndex(record => record.id === id)
      if (index !== -1) {
        this.dietRecords.splice(index, 1)
        this.saveToLocalStorage()
      }
    },

    loadFromLocalStorage() {
      const foods = localStorage.getItem('what-to-eat-foods')
      const records = localStorage.getItem('what-to-eat-records')
      
      if (foods) {
        this.foods = JSON.parse(foods)
      }
      if (records) {
        this.dietRecords = JSON.parse(records)
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('what-to-eat-foods', JSON.stringify(this.foods))
      localStorage.setItem('what-to-eat-records', JSON.stringify(this.dietRecords))
    },

    exportData() {
      const data = {
        foods: this.foods,
        dietRecords: this.dietRecords,
        exportDate: new Date().toISOString()
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `what-to-eat-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    importData(file: File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            if (data.foods && Array.isArray(data.foods)) {
              this.foods = data.foods
            }
            if (data.dietRecords && Array.isArray(data.dietRecords)) {
              this.dietRecords = data.dietRecords
            }
            this.saveToLocalStorage()
            resolve(true)
          } catch (error) {
            reject(error)
          }
        }
        reader.readAsText(file)
      })
    },

    clearAllData() {
      this.foods = []
      this.dietRecords = []
      this.saveToLocalStorage()
    }
  }
})