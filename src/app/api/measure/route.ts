import { NextRequest, NextResponse } from 'next/server'
import { generateLength } from '@/utils/lengthGenerator'
import { getLengthEvaluation } from '@/utils/lengthGenerator'
import { sanitizeInput, validateName, isForbiddenString, getClientIP } from '@/utils/security'
import { MeasurementResult, ApiResponse } from '@/types'

// In-memory storage for name-to-length mapping (in production, use Redis or database)
const nameLengthMap = new Map<string, number>()

// Forbidden strings (in production, load from database)
const FORBIDDEN_STRINGS = [
  'admin', 'root', 'system', 'hack', 'inject', 'script',
  'drop', 'select', 'insert', 'update', 'delete', 'union',
  '<script>', 'javascript:', 'vbscript:', 'onload', 'onclick'
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的输入数据'
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

    // Check if we already have a length for this name
    let length: number
    if (nameLengthMap.has(sanitizedName)) {
      length = nameLengthMap.get(sanitizedName)!
    } else {
      // Generate new length
      length = generateLength(sanitizedName)
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
    console.error('测量API错误:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}