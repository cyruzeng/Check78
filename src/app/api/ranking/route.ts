import { NextRequest, NextResponse } from 'next/server'
import { MeasurementResult, ApiResponse, RankingItem } from '@/types'
import { sanitizeInput, validateName, getClientIP } from '@/utils/security'
import { validateRequiredEnvVars } from '@/utils/envValidation'

// 验证环境变量
try {
  validateRequiredEnvVars()
} catch (error) {
  console.error('环境变量验证失败:', error)
}

// 带安全限制的内存存储
let rankings: Array<MeasurementResult & { id: string; created_at: string }> = []
const RANKINGS_SIZE_LIMIT = 1000 // 限制排行榜大小

// 请求频率限制 (简单实现)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT_REQUESTS = 30 // 每分钟最多30次请求
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分钟窗口

// 初始化示例数据（生产环境中应该从数据库加载）
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
    // 频率限制检查
    const clientIP = getClientIP(request)
    const now = Date.now()
    
    // 清理过期的限制记录
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip)
      }
    }
    
    // 检查当前IP的请求频率
    const currentLimit = rateLimitMap.get(clientIP)
    if (currentLimit) {
      if (currentLimit.count >= RATE_LIMIT_REQUESTS) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: '请求过于频繁，请稍后再试'
        }, { status: 429 })
      }
      currentLimit.count++
    } else {
      rateLimitMap.set(clientIP, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      })
    }

    // 排序并返回排行榜（防止数据过大）
    const sortedRankings = [...rankings]
      .sort((a, b) => b.length - a.length)
      .slice(0, 50) // 最多返回50条记录
      .map((item, index) => ({
        id: item.id,
        name: item.name,
        length: item.length,
        rank: index + 1,
        created_at: item.created_at
      }))

    return NextResponse.json<ApiResponse<RankingItem[]>>({
      success: true,
      data: sortedRankings
    }, {
      // 添加缓存头，减少重复请求
      headers: {
        'Cache-Control': 'public, max-age=300', // 5分钟缓存
        'ETag': `"ranking-${Date.now()}"`
      }
    })

  } catch (error) {
    console.error('获取排行榜API错误:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      clientIP: getClientIP(request),
      timestamp: new Date().toISOString()
    })
    
    const statusCode = error instanceof Error && error.message.includes('频率') ? 429 : 500
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: statusCode === 429 ? '请求过于频繁，请稍后再试' : '服务器内部错误'
    }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 频率限制检查
    const clientIP = getClientIP(request)
    const now = Date.now()
    
    // 清理过期的限制记录
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip)
      }
    }
    
    // 检查当前IP的请求频率
    const currentLimit = rateLimitMap.get(clientIP)
    if (currentLimit) {
      if (currentLimit.count >= RATE_LIMIT_REQUESTS) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: '请求过于频繁，请稍后再试'
        }, { status: 429 })
      }
      currentLimit.count++
    } else {
      rateLimitMap.set(clientIP, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      })
    }

    const body = await request.json()
    const { name, length } = body

    // 验证输入类型和大小
    if (!name || typeof name !== 'string' || typeof length !== 'number') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的输入数据'
      }, { status: 400 })
    }

    // 输入长度检查
    if (name.length > 100) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '输入数据过长（最大100字符）'
      }, { status: 400 })
    }

    // 清理和验证名称
    const sanitizedName = sanitizeInput(name)
    const validation = validateName(sanitizedName)
    if (!validation.valid) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: validation.error
      }, { status: 400 })
    }

    // 验证长度值范围
    if (length < -9999 || length > 9999) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '长度值超出允许范围（-9999 到 9999）'
      }, { status: 400 })
    }

    // 检查是否已存在相同名称
    const existingIndex = rankings.findIndex(item => item.name === sanitizedName)
    
    if (existingIndex !== -1) {
      // 只有新长度更高时才更新现有条目
      if (length > rankings[existingIndex].length) {
        rankings[existingIndex] = {
          ...rankings[existingIndex],
          length,
          created_at: new Date().toISOString()
        }
      }
    } else {
      // 添加新条目，防止内存溢出
      const newEntry: MeasurementResult & { id: string; created_at: string } = {
        id: Date.now().toString(),
        name: sanitizedName,
        length,
        evaluation: '', // 将由测量API填充
        created_at: new Date().toISOString(),
        ip_address: clientIP
      }
      
      rankings.push(newEntry)
      
      // 限制排行榜大小，防止内存溢出
      if (rankings.length > RANKINGS_SIZE_LIMIT) {
        // 按长度排序后只保留前N条记录
        rankings = rankings
          .sort((a, b) => b.length - a.length)
          .slice(0, RANKINGS_SIZE_LIMIT)
      }
    }

    // 排序并限制返回条目数量
    rankings = rankings
      .sort((a, b) => b.length - a.length)
      .slice(0, 100)

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null
    }, {
      status: 201,
      headers: {
        'Location': `/api/ranking/${encodeURIComponent(sanitizedName)}`
      }
    })

  } catch (error) {
    console.error('提交排行榜API错误:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      clientIP: getClientIP(request),
      timestamp: new Date().toISOString()
    })
    
    const statusCode = error instanceof Error && error.message.includes('频率') ? 429 : 500
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: statusCode === 429 ? '请求过于频繁，请稍后再试' : '服务器内部错误'
    }, { status: statusCode })
  }
}