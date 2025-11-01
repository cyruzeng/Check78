import { NextRequest, NextResponse } from 'next/server'
import { generateLength } from '@/utils/lengthGenerator'
import { getLengthEvaluation } from '@/utils/lengthGenerator'
import { sanitizeInput, validateName, isForbiddenString, getClientIP } from '@/utils/security'
import { MeasurementResult, ApiResponse } from '@/types'
import { validateRequiredEnvVars } from '@/utils/envValidation'

// 验证环境变量
try {
  validateRequiredEnvVars()
} catch (error) {
  console.error('环境变量验证失败:', error)
}

// In-memory storage with size limits to prevent memory exhaustion
const nameLengthMap = new Map<string, number>()
const MAP_SIZE_LIMIT = 10000 // 限制缓存大小

// Forbidden strings (扩展安全列表)
const FORBIDDEN_STRINGS = [
  'admin', 'root', 'system', 'hack', 'inject', 'script',
  'drop', 'select', 'insert', 'update', 'delete', 'union',
  '<script>', 'javascript:', 'vbscript:', 'onload', 'onclick',
  'eval', 'settimeout', 'setinterval', 'fetch', 'xmlhttprequest',
  'window', 'document', 'cookie', 'localstorage', 'sessionstorage',
  'import', 'export', 'require', 'module', 'global'
]

// 请求频率限制 (简单实现)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT_REQUESTS = 10 // 每分钟最多10次请求
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分钟窗口

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
    const { name } = body

    // 验证输入类型和大小
    if (!name || typeof name !== 'string') {
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

    // Sanitize input
    const sanitizedName = sanitizeInput(name)
    
    // Validate name
    const validation = validateName(sanitizedName)
    if (!validation.valid) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: validation.error
      }, { status: 400 })
    }

    // Check forbidden strings
    if (isForbiddenString(sanitizedName, FORBIDDEN_STRINGS)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '输入包含不允许的字符串'
      }, { status: 400 })
    }

    // 优化的缓存检查和内存管理
    let length: number
    if (nameLengthMap.has(sanitizedName)) {
      length = nameLengthMap.get(sanitizedName)!
    } else {
      // 生成新的长度值
      length = generateLength(sanitizedName)
      
      // 防止内存溢出 - 限制缓存大小
      if (nameLengthMap.size >= MAP_SIZE_LIMIT) {
        // 清理最旧的条目（FIFO）
        const firstKey = nameLengthMap.keys().next().value
        nameLengthMap.delete(firstKey)
      }
      
      nameLengthMap.set(sanitizedName, length)
    }

    // Get evaluation
    const evaluation = getLengthEvaluation(length)

    // Create result
    const result: MeasurementResult = {
      name: sanitizedName,
      length,
      evaluation,
      ip_address: getClientIP(request)
    }

    return NextResponse.json<ApiResponse<MeasurementResult>>({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('测量API错误:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      clientIP: getClientIP(request),
      timestamp: new Date().toISOString()
    })
    
    // 返回适当的错误状态码
    const statusCode = error instanceof Error && error.message.includes('频率') ? 429 : 500
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: statusCode === 429 ? '请求过于频繁，请稍后再试' : '服务器内部错误'
    }, { status: statusCode })
  }
}