'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has already accepted the agreement
    const accepted = localStorage.getItem('userAgreementAccepted')
    if (accepted === 'true') {
      setAgreementAccepted(true)
      // Redirect to main app after a short delay
      setTimeout(() => {
        router.push('/measure')
      }, 1000)
    }
  }, [router])

  const handleAcceptAgreement = () => {
    localStorage.setItem('userAgreementAccepted', 'true')
    localStorage.setItem('agreementTimestamp', new Date().toISOString())
    setAgreementAccepted(true)
    router.push('/measure')
  }

  if (agreementAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-neon-blue animate-pulse">
            正在进入78长度测量仪...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/50 backdrop-blur-sm border border-neon-blue/30 rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold glow-text mb-4 font-orbitron">
              78长度测量仪
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 animate-pulse">
              探索维度的奥秘，测量存在的尺度
            </p>
          </div>

          <div className="bg-black/30 border border-neon-purple/20 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-neon-purple mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              用户协议
            </h2>
            
            <div className="space-y-4 text-gray-300 max-h-64 overflow-y-auto">
              <p className="leading-relaxed">
                欢迎使用78长度测量仪！这是一个基于科幻概念的趣味测量工具，旨在为用户提供娱乐体验。
              </p>
              
              <h3 className="text-lg font-semibold text-neon-blue mt-4">📋 使用条款</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本工具仅供娱乐用途，测量结果不具备任何科学或实际意义</li>
                <li>用户输入的字符串将被用于生成随机但固定的长度值</li>
                <li>我们承诺保护用户隐私，不会将个人信息用于其他用途</li>
                <li>排行榜功能为可选功能，用户可自主选择是否参与</li>
                <li>请文明使用，避免输入不当内容</li>
              </ul>

              <h3 className="text-lg font-semibold text-neon-blue mt-4">🔒 隐私保护</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>系统会记录IP地址用于安全防护，但不会与具体用户关联</li>
                <li>所有数据均采用加密存储，确保信息安全</li>
                <li>用户可随时要求删除个人相关数据</li>
              </ul>

              <h3 className="text-lg font-semibold text-neon-blue mt-4">⚡ 技术声明</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本系统采用量子哈希算法确保测量结果的一致性</li>
                <li>科幻风格的视觉效果旨在增强用户体验</li>
                <li>系统具备防注入保护，确保运行安全</li>
              </ul>
            </div>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={handleAcceptAgreement}
              className="cyber-button px-8 py-4 text-xl font-bold rounded-lg text-white transition-all duration-300 transform hover:scale-105"
            >
              我已阅读并同意协议
            </button>
            
            <p className="text-sm text-gray-400 animate-pulse">
              点击按钮即表示您同意上述所有条款
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}