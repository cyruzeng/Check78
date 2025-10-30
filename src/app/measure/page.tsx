'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MeasurementResult } from '@/types'

export default function MeasurePage() {
  const [inputName, setInputName] = useState('')
  const [result, setResult] = useState<MeasurementResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showRanking, setShowRanking] = useState(false)
  const [rankings, setRankings] = useState<any[]>([])
  const [showSubmitOption, setShowSubmitOption] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has accepted agreement
    const accepted = localStorage.getItem('userAgreementAccepted')
    if (!accepted) {
      router.push('/')
    }
  }, [router])

  const handleMeasure = async () => {
    if (!inputName.trim()) {
      alert('请输入名称')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/measure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: inputName }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
        setShowSubmitOption(true)
      } else {
        alert(data.error || '测量失败，请重试')
      }
    } catch (error) {
      console.error('测量错误:', error)
      alert('测量过程中发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitToRanking = async () => {
    if (!result) return

    try {
      const response = await fetch('/api/ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.name,
          length: result.length,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert('已成功提交到排行榜！')
        setShowSubmitOption(false)
        loadRankings()
      } else {
        alert(data.error || '提交失败')
      }
    } catch (error) {
      console.error('提交错误:', error)
      alert('提交过程中发生错误')
    }
  }

  const loadRankings = async () => {
    try {
      const response = await fetch('/api/ranking')
      const data = await response.json()
      
      if (data.success) {
        setRankings(data.data)
        setShowRanking(true)
      }
    } catch (error) {
      console.error('加载排行榜错误:', error)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold glow-text mb-4 font-orbitron">
            78长度测量仪
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">
            输入任意字符串，测量其神秘的78维度长度
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Measurement Section */}
          <div className="bg-black/50 backdrop-blur-sm border border-neon-blue/30 rounded-lg p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-neon-blue mb-6 flex items-center">
              <span className="mr-2">🔬</span>
              测量区域
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  输入要测量的字符串：
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="例如：张三、hello、任何字符..."
                  className="cyber-input w-full px-4 py-3 rounded-lg text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleMeasure()}
                />
              </div>

              <button
                onClick={handleMeasure}
                disabled={loading || !inputName.trim()}
                className="cyber-button w-full py-4 text-xl font-bold rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                    测量中...
                  </div>
                ) : (
                  '🚀 开始测量'
                )}
              </button>

              {/* Result Display */}
              {result && (
                <div className="bg-black/30 border border-neon-green/30 rounded-lg p-6 mt-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-neon-green mb-4">📊 测量结果</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">测量对象：</span>
                      <span className="text-neon-blue font-bold text-lg">{result.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">78维长度：</span>
                      <span className="text-neon-green font-bold text-2xl">{result.length}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <p className="text-gray-300 text-sm mb-2">系统评价：</p>
                      <p className="text-cyber-green italic">"{result.evaluation}"</p>
                    </div>
                  </div>

                  {/* Submit to ranking option */}
                  {showSubmitOption && (
                    <div className="mt-6 p-4 bg-black/20 border border-neon-purple/30 rounded-lg">
                      <p className="text-gray-300 mb-4">是否将此结果提交到排行榜？</p>
                      <div className="flex gap-4">
                        <button
                          onClick={handleSubmitToRanking}
                          className="cyber-button px-6 py-2 rounded-lg text-white text-sm"
                        >
                          ✅ 提交
                        </button>
                        <button
                          onClick={() => setShowSubmitOption(false)}
                          className="px-6 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
                        >
                          ❌ 取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ranking Section */}
          <div className="bg-black/50 backdrop-blur-sm border border-neon-purple/30 rounded-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neon-purple flex items-center">
                <span className="mr-2">🏆</span>
                排行榜
              </h2>
              <button
                onClick={loadRankings}
                className="cyber-button px-4 py-2 rounded-lg text-white text-sm"
              >
                🔄 刷新
              </button>
            </div>

            {!showRanking ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400 mb-4">点击刷新按钮查看排行榜</p>
                <button
                  onClick={loadRankings}
                  className="cyber-button px-6 py-3 rounded-lg text-white"
                >
                  查看排行榜
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rankings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">暂无排行榜数据</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rankings.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                          index === 0 ? 'bg-yellow-500/20 border-yellow-500/50' :
                          index === 1 ? 'bg-gray-400/20 border-gray-400/50' :
                          index === 2 ? 'bg-orange-600/20 border-orange-600/50' :
                          'bg-black/20 border-gray-600/30'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-neon-blue text-black'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-white font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-neon-green font-bold text-lg">{item.length}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            © 2024 78长度测量仪 | 科幻风格趣味测量工具
          </p>
        </div>
      </div>
    </div>
  )
}