"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"
import { getColorBgClass } from "@/utils/deck-analysis"

export interface DeckFilter {
  creator?: string
  mainColor?: string
}

interface SavedDeck {
  id: number
  deck_name: string
  deck_id: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
  raiki_cards?: Record<string, number>
  users?: {
    x_name: string
    x_username: string
    x_icon_url?: string
  }
}

interface DeckFiltersProps {
  decks: SavedDeck[]
  onFilterChange: (filters: DeckFilter) => void
  className?: string
}

export default function DeckFilters({ decks, onFilterChange, className = "" }: DeckFiltersProps) {
  const [filters, setFilters] = useState<DeckFilter>({})
  const [creators, setCreators] = useState<string[]>([])
  const [mainColors, setMainColors] = useState<Array<{ color: string; displayName: string; count: number }>>([])

  // デッキから作成者とメイン色のリストを抽出
  useEffect(() => {
    // 作成者のリストを抽出
    const uniqueCreators = Array.from(
      new Set(decks.map(deck => deck.users?.x_name).filter(Boolean))
    ).sort()
    setCreators(uniqueCreators)

    // メイン色のリストを抽出
    const colorCounts: Record<string, number> = {}
    const colorDisplayNames: Record<string, string> = {
      blue: '青',
      red: '赤', 
      yellow: '黄',
      green: '緑',
      purple: '紫'
    }

    decks.forEach(deck => {
      if (deck.raiki_cards) {
        // 最も多いレイキの色を判定
        let maxColor = 'blue'
        let maxCount = 0
        
        Object.entries(deck.raiki_cards).forEach(([color, count]) => {
          if (count > maxCount) {
            maxCount = count
            maxColor = color
          }
        })

        if (maxCount > 0) {
          colorCounts[maxColor] = (colorCounts[maxColor] || 0) + 1
        }
      }
    })

    const colorList = Object.entries(colorCounts)
      .map(([color, count]) => ({
        color,
        displayName: colorDisplayNames[color] || color,
        count
      }))
      .sort((a, b) => b.count - a.count)

    setMainColors(colorList)
  }, [decks])

  // フィルターの変更を通知
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const handleCreatorChange = (creator: string) => {
    setFilters(prev => ({
      ...prev,
      creator: creator === 'all' ? undefined : creator
    }))
  }

  const handleColorChange = (color: string) => {
    setFilters(prev => ({
      ...prev,
      mainColor: color === 'all' ? undefined : color
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="w-5 h-5" />
          フィルター
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}件適用中
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 作成者フィルター */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              作成者
            </label>
            <Select value={filters.creator || 'all'} onValueChange={handleCreatorChange}>
              <SelectTrigger>
                <SelectValue placeholder="すべての作成者" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての作成者</SelectItem>
                {creators.map(creator => (
                  <SelectItem key={creator} value={creator}>
                    {creator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* メイン色フィルター */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              メイン色
            </label>
            <Select value={filters.mainColor || 'all'} onValueChange={handleColorChange}>
              <SelectTrigger>
                <SelectValue placeholder="すべての色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての色</SelectItem>
                {mainColors.map(({ color, displayName, count }) => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full bg-current ${getColorBgClass(color).split(' ')[0]}`} />
                      {displayName} ({count})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* アクティブフィルターの表示 */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.creator && (
              <Badge variant="secondary" className="flex items-center gap-1">
                作成者: {filters.creator}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, creator: undefined }))}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.mainColor && (
              <Badge 
                variant="secondary" 
                className={`flex items-center gap-1 ${getColorBgClass(filters.mainColor)}`}
              >
                メイン色: {mainColors.find(c => c.color === filters.mainColor)?.displayName}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, mainColor: undefined }))}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
            >
              すべてクリア
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}