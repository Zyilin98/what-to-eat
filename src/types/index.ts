// 食物类型定义
export interface FoodItem {
  id: string
  name: string
  category: string
  weight: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'all'
  image?: string
  description?: string
  tags?: string[]
}

// 饮食记录类型定义
export interface DietRecord {
  id: string
  foodName: string
  foodId?: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string
  time: string
  calories?: number
  notes?: string
  recommended?: boolean
}

// 统计数据类型定义
export interface FoodStats {
  foodName: string
  count: number
  percentage: number
  category: string
}

export interface WeeklyStats {
  week: string
  foods: FoodStats[]
  totalRecords: number
}

export interface MonthlyStats {
  month: string
  foods: FoodStats[]
  totalRecords: number
}

// 转盘配置
export interface RouletteConfig {
  duration: number
  spinCount: number
  showAnimation: boolean
}

// 应用状态
export interface AppState {
  foods: FoodItem[]
  dietRecords: DietRecord[]
  selectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'all'
  rouletteConfig: RouletteConfig
}