'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('strings')
  const [strings, setStrings] = useState<any[]>([])
  const [forbiddenStrings, setForbiddenStrings] = useState<string[]>([])
  const [easterEggs, setEasterEggs] = useState<any[]>([])
  const [newString, setNewString] = useState('')
  const [newLength, setNewLength] = useState('')
  const [newForbiddenString, setNewForbiddenString] = useState('')
  const [newEggName, setNewEggName] = useState('')
  const [newEggLength, setNewEggLength] = useState('')
  const [newEggMessage, setNewEggMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const router = useRouter()

  // 获取管理员密码（从环境变量或开发默认值）
  const getAdminPassword = () => {
    // 在实际项目中，应该通过API或配置服务获取，而不是客户端
    // 这里只是演示，生产环境中应该在服务器端验证
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
    }
    return process.env.ADMIN_PASSWORD || 'admin123'
  }

  useEffect(() => {
    // Check if user has accepted agreement
    const accepted = localStorage.getItem('userAgreementAccepted')
    if (!accepted) {
      router.push('/')
      return
    }
  }, [router])

  const handleLogin = () => {
    const adminPassword = getAdminPassword()
    
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setPasswordError('')
      loadData()
    } else {
      setPasswordError('密码错误，请重新输入')
      // 清除密码字段
      setPassword('')
    }
  }

  const loadData = async () => {
    try {
      // Load strings data
      const stringsResponse = await fetch('/api/admin/strings')
      const stringsData = await stringsResponse.json()
      if (stringsData.success) {
        setStrings(stringsData.data)
      }

      // Load forbidden strings
      const forbiddenResponse = await fetch('/api/admin/forbidden')
      const forbiddenData = await forbiddenResponse.json()
      if (forbiddenData.success) {
        setForbiddenStrings(forbiddenData.data)
      }

      // Load easter eggs
      const eggsResponse = await fetch('/api/admin/easter-eggs')
      const eggsData = await eggsResponse.json()
      if (eggsData.success) {
        setEasterEggs(eggsData.data)
      }
    } catch (error) {
      console.error('加载数据错误:', error)
    }
  }

  const handleAddString = async () => {
    if (!newString || !newLength) {
      alert('请填写完整信息')
      return
    }

    try {
      const response = await fetch('/api/admin/strings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newString, length: parseInt(newLength) })
      })
      
      const data = await response.json()
      if (data.success) {
        setNewString('')
        setNewLength('')
        loadData()
        alert('添加成功')
      }
    } catch (error) {
      console.error('添加字符串错误:', error)
    }
  }

  const handleUpdateString = async (id: string, newLength: number) => {
    try {
      const response = await fetch(`/api/admin/strings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length: newLength })
      })
      
      const data = await response.json()
      if (data.success) {
        loadData()
        alert('更新成功')
      }
    } catch (error) {
      console.error('更新字符串错误:', error)
    }
  }

  const handleDeleteString = async (id: string) => {
    if (!confirm('确定要删除这个字符串吗？')) return

    try {
      const response = await fetch(`/api/admin/strings/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        loadData()
        alert('删除成功')
      }
    } catch (error) {
      console.error('删除字符串错误:', error)
    }
  }

  const handleAddForbiddenString = async () => {
    if (!newForbiddenString) {
      alert('请输入要禁止的字符串')
      return
    }

    try {
      const response = await fetch('/api/admin/forbidden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ string: newForbiddenString })
      })
      
      const data = await response.json()
      if (data.success) {
        setNewForbiddenString('')
        loadData()
        alert('添加成功')
      }
    } catch (error) {
      console.error('添加禁止字符串错误:', error)
    }
  }

  const handleDeleteForbiddenString = async (string: string) => {
    if (!confirm('确定要删除这个禁止字符串吗？')) return

    try {
      const response = await fetch(`/api/admin/forbidden/${encodeURIComponent(string)}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        loadData()
        alert('删除成功')
      }
    } catch (error) {
      console.error('删除禁止字符串错误:', error)
    }
  }

  const handleAddEasterEgg = async () => {
    if (!newEggName || !newEggLength || !newEggMessage) {
      alert('请填写完整的彩蛋信息')
      return
    }

    try {
      const response = await fetch('/api/admin/easter-eggs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEggName,
          length: parseInt(newEggLength),
          message: newEggMessage
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setNewEggName('')
        setNewEggLength('')
        setNewEggMessage('')
        loadData()
        alert('添加成功')
      }
    } catch (error) {
      console.error('添加彩蛋错误:', error)
    }
  }

  const handleDeleteEasterEgg = async (id: string) => {
    if (!confirm('确定要删除这个彩蛋吗？')) return

    try {
      const response = await fetch(`/api/admin/easter-eggs/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        loadData()
        alert('删除成功')
      }
    } catch (error) {
      console.error('删除彩蛋错误:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-black/50 backdrop-blur-sm border border-neon-purple/30 rounded-lg p-8 shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-neon-purple mb-2">🔐 管理员登录</h1>
            <p className="text-gray-400">请输入管理员密码</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError('') // 清除错误信息
              }}
              placeholder="管理员密码"
              className="cyber-input w-full px-4 py-3 rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            {passwordError && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded px-3 py-2">
                ⚠️ {passwordError}
              </div>
            )}
            <div className="text-xs text-gray-500 text-center">
              ⚠️ 生产环境中请设置 ADMIN_PASSWORD 环境变量
            </div>
            <button
              onClick={handleLogin}
              className="cyber-button w-full py-3 text-white font-bold rounded-lg"
            >
              🔐 登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neon-purple mb-2">🔧 管理员后台</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto mb-4"></div>
          <p className="text-gray-400">78长度测量仪系统管理</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/30 border border-neon-blue/30 rounded-lg p-1 flex">
            {[
              { id: 'strings', label: '字符串管理', icon: '📝' },
              { id: 'forbidden', label: '违禁词管理', icon: '🚫' },
              { id: 'easter-eggs', label: '彩蛋管理', icon: '🎁' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center ${
                  activeTab === tab.id
                    ? 'bg-neon-blue text-black font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-black/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-black/50 backdrop-blur-sm border border-neon-purple/30 rounded-lg p-6 shadow-2xl">
          {/* Strings Management */}
          {activeTab === 'strings' && (
            <div>
              <h2 className="text-2xl font-bold text-neon-blue mb-6">📝 字符串管理</h2>
              
              {/* Add new string */}
              <div className="bg-black/30 border border-neon-blue/20 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-neon-blue mb-4">添加新字符串</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={newString}
                    onChange={(e) => setNewString(e.target.value)}
                    placeholder="字符串名称"
                    className="cyber-input px-4 py-2 rounded-lg"
                  />
                  <input
                    type="number"
                    value={newLength}
                    onChange={(e) => setNewLength(e.target.value)}
                    placeholder="长度值 (1-25)"
                    min="1"
                    max="25"
                    className="cyber-input px-4 py-2 rounded-lg"
                  />
                  <button
                    onClick={handleAddString}
                    className="cyber-button py-2 text-white rounded-lg"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* Existing strings */}
              <div className="space-y-2">
                {strings.map((string) => (
                  <div key={string.id} className="bg-black/20 border border-gray-600/30 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-white font-medium">{string.name}</span>
                      <span className="text-neon-green font-bold">{string.length}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        defaultValue={string.length}
                        className="cyber-input px-3 py-1 rounded text-sm w-20"
                        onBlur={(e) => handleUpdateString(string.id, parseInt(e.target.value))}
                      />
                      <button
                        onClick={() => handleDeleteString(string.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forbidden Strings Management */}
          {activeTab === 'forbidden' && (
            <div>
              <h2 className="text-2xl font-bold text-neon-blue mb-6">🚫 违禁词管理</h2>
              
              {/* Add new forbidden string */}
              <div className="bg-black/30 border border-neon-blue/20 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-neon-blue mb-4">添加违禁词</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newForbiddenString}
                    onChange={(e) => setNewForbiddenString(e.target.value)}
                    placeholder="违禁词"
                    className="cyber-input flex-1 px-4 py-2 rounded-lg"
                  />
                  <button
                    onClick={handleAddForbiddenString}
                    className="cyber-button px-6 py-2 text-white rounded-lg"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* Existing forbidden strings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {forbiddenStrings.map((string, index) => (
                  <div key={index} className="bg-black/20 border border-red-500/30 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-red-400 font-medium">{string}</span>
                    <button
                      onClick={() => handleDeleteForbiddenString(string)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Easter Eggs Management */}
          {activeTab === 'easter-eggs' && (
            <div>
              <h2 className="text-2xl font-bold text-neon-blue mb-6">🎁 彩蛋管理</h2>
              
              {/* Add new easter egg */}
              <div className="bg-black/30 border border-neon-blue/20 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-neon-blue mb-4">添加新彩蛋</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newEggName}
                    onChange={(e) => setNewEggName(e.target.value)}
                    placeholder="彩蛋名称"
                    className="cyber-input px-4 py-2 rounded-lg"
                  />
                  <input
                    type="number"
                    value={newEggLength}
                    onChange={(e) => setNewEggLength(e.target.value)}
                    placeholder="长度值"
                    className="cyber-input px-4 py-2 rounded-lg"
                  />
                  <input
                    type="text"
                    value={newEggMessage}
                    onChange={(e) => setNewEggMessage(e.target.value)}
                    placeholder="显示消息"
                    className="cyber-input px-4 py-2 rounded-lg md:col-span-2"
                  />
                  <button
                    onClick={handleAddEasterEgg}
                    className="cyber-button py-2 text-white rounded-lg md:col-span-2"
                  >
                    添加彩蛋
                  </button>
                </div>
              </div>

              {/* Existing easter eggs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {easterEggs.map((egg) => (
                  <div key={egg.id} className="bg-black/20 border border-neon-green/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-neon-green font-bold">{egg.name}</h4>
                      <button
                        onClick={() => handleDeleteEasterEgg(egg.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">长度：</span><span className="text-white">{egg.length}</span></div>
                      <div><span className="text-gray-400">消息：</span><span className="text-white">{egg.message}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            退出管理后台
          </button>
        </div>
      </div>
    </div>
  )
}