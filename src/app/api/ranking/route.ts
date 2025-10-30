import { NextRequest, NextResponse } from 'next/server'
import { MeasurementResult, ApiResponse, RankingItem } from '@/types'
import { sanitizeInput, validateName, getClientIP } from '@/utils/security'

// In-memory storage for rankings (in production, use database)
let rankings: Array<MeasurementResult & { id: string; created_at: string }> = []

// Initialize with some sample data
if (rankings.length === 0) {
  rankings = [
    {
      id: '1',
      name: '量子物理学家',
      length: 23,
      evaluation: '超越常规的非凡存在，统计学中的异常值',
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      ip_address: '127.0.0.1'
    },
    {
      id: '2',
      name: '弦理论专家',
      length: 21,
      evaluation: '多维空间的投影长度，超出三维认知',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      ip_address: '127.0.0.1'
    },
    {
      id: '3',
      name: '宇宙学家',
      length: 19,
      evaluation: '经典物理学的完美诠释，欧几里得几何的标准',
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      ip_address: '127.0.0.1'
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    // Sort rankings by length (descending)
    const sortedRankings = [...rankings]
      .sort((a, b) => b.length - a.length)
      .slice(0, 50) // Top 50
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }))

    return NextResponse.json<ApiResponse<RankingItem[]>>({
      success: true,
      data: sortedRankings
    })

  } catch (error) {
    console.error('获取排行榜API错误:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, length } = body

    // Validate input
    if (!name || typeof name !== 'string' || typeof length !== 'number') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的输入数据'
      }, { status: 400 })
    }

    // Sanitize and validate name
    const sanitizedName = sanitizeInput(name)
    const validation = validateName(sanitizedName)
    if (!validation.valid) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: validation.error
      }, { status: 400 })
    }

    // Validate length
    if (length < -9999 || length > 9999) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的长度值'
      }, { status: 400 })
    }

    // Check if this name already exists in rankings
    const existingIndex = rankings.findIndex(item => item.name === sanitizedName)
    
    if (existingIndex !== -1) {
      // Update existing entry if new length is higher
      if (length > rankings[existingIndex].length) {
        rankings[existingIndex] = {
          ...rankings[existingIndex],
          length,
          created_at: new Date().toISOString()
        }
      }
    } else {
      // Add new entry
      const newEntry: MeasurementResult & { id: string; created_at: string } = {
        id: Date.now().toString(),
        name: sanitizedName,
        length,
        evaluation: '', // Will be populated by the measurement API
        created_at: new Date().toISOString(),
        ip_address: getClientIP(request)
      }
      
      rankings.push(newEntry)
    }

    // Keep only top 100 entries
    rankings = rankings
      .sort((a, b) => b.length - a.length)
      .slice(0, 100)

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null
    })

  } catch (error) {
    console.error('提交排行榜API错误:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}