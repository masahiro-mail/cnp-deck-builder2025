// デッキ分析ユーティリティ

export interface RaikiCards {
  blue: number
  red: number
  yellow: number
  green: number
  purple: number
}

export interface ColorInfo {
  color: string
  count: number
  percentage: number
  displayName: string
}

// メイン色を判定（最も多いレイキの色）
export function getMainColor(raikiCards: RaikiCards | null | undefined): ColorInfo {
  if (!raikiCards) {
    return {
      color: 'unknown',
      count: 0,
      percentage: 0,
      displayName: '不明'
    }
  }

  const colorMap = {
    blue: { name: '青', displayName: '青' },
    red: { name: 'red', displayName: '赤' },
    yellow: { name: 'yellow', displayName: '黄' },
    green: { name: 'green', displayName: '緑' },
    purple: { name: 'purple', displayName: '紫' }
  }

  let maxColor = 'blue'
  let maxCount = raikiCards.blue || 0

  Object.entries(raikiCards).forEach(([color, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxColor = color
    }
  })

  const total = Object.values(raikiCards).reduce((sum, count) => sum + (count || 0), 0)
  const percentage = total > 0 ? Math.round((maxCount / total) * 100) : 0

  return {
    color: maxColor,
    count: maxCount,
    percentage,
    displayName: colorMap[maxColor as keyof typeof colorMap]?.displayName || '不明'
  }
}

// 色の分布を取得
export function getColorDistribution(raikiCards: RaikiCards | null | undefined): ColorInfo[] {
  if (!raikiCards) return []

  const colorMap = {
    blue: '青',
    red: '赤',
    yellow: '黄',
    green: '緑',
    purple: '紫'
  }

  const total = Object.values(raikiCards).reduce((sum, count) => sum + (count || 0), 0)

  return Object.entries(raikiCards)
    .map(([color, count]) => ({
      color,
      count: count || 0,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      displayName: colorMap[color as keyof typeof colorMap] || color
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
}

// 色のCSS クラス名を取得
export function getColorClass(color: string): string {
  const colorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    purple: 'text-purple-600'
  }
  
  return colorClasses[color as keyof typeof colorClasses] || 'text-gray-600'
}

// 色の背景クラス名を取得
export function getColorBgClass(color: string): string {
  const colorBgClasses = {
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800'
  }
  
  return colorBgClasses[color as keyof typeof colorBgClasses] || 'bg-gray-100 text-gray-800'
}