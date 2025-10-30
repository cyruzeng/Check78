import { generateHash } from './security';

export function generateLength(name: string): number {
  // Special Easter eggs
  const specialNames = {
    'admin': 9999,
    'root': 9999,
    'system': 9999,
    'debug': -9999,
    'test': -9999,
    'error': -9999,
  };
  
  const lowerName = name.toLowerCase().trim();
  
  // Check for special Easter egg names
  if (specialNames[lowerName as keyof typeof specialNames] !== undefined) {
    return specialNames[lowerName as keyof typeof specialNames];
  }
  
  // Generate consistent length based on name hash
  const hash = generateHash(name);
  
  // Map hash to 1-25 range
  const length = (hash % 25) + 1;
  
  return length;
}

export function getLengthEvaluation(length: number): string {
  const evaluations = {
    '1-5': [
      '量子级别的存在，需要用显微镜才能观察到',
      '宇宙中最基础的长度单位，连细菌都嫌小',
      '时空维度的极限挑战，挑战物理定律',
      '亚原子级别的精密测量，需要超级对撞机',
      '超越人类认知的微观世界，量子纠缠都嫌大'
    ],
    '6-10': [
      '纳米科技的标准尺寸，适合量子计算',
      '微生物世界的VIP通行证',
      '分子级别的精致工艺，DNA都羡慕',
      '细胞级别的完美比例，生物进化的奇迹',
      '原子级别的和谐共振，化学键的理想长度'
    ],
    '11-15': [
      '标准模型的黄金比例，宇宙常数的体现',
      '相对论效应开始显现的临界值',
      '量子力学与经典物理的完美结合',
      '时空弯曲的优雅弧度，引力波的完美载体',
      '多维宇宙的标准接口，弦理论的理想长度'
    ],
    '16-20': [
      '宏观世界的入场券，牛顿力学的适用范围',
      '经典物理学的完美诠释，欧几里得几何的标准',
      '日常维度的舒适区间，人类感知的甜蜜点',
      '工程学的黄金标准，建筑学的理想比例',
      '自然选择的优化结果，进化论的生动体现'
    ],
    '21-25': [
      '超越常规的非凡存在，统计学中的异常值',
      '宇宙常数的异常波动，需要新的物理理论',
      '多维空间的投影长度，超出三维认知',
      '黑洞事件视界的边缘值，时空奇点的预兆',
      '宇宙大爆炸的初始参数，创世记的标准配置'
    ],
    '-9999': [
      '系统错误：检测到负维度空间，宇宙法则崩溃中...',
      'ERROR 404：长度未找到，可能存在于平行宇宙',
      '量子涨落异常：长度处于叠加态，观察者效应生效',
      '时空悖论：长度违反因果律，祖父祖父悖论触发',
      '数学危机：长度超出实数范围，需要新的数系定义'
    ],
    '9999': [
      '系统管理员权限：长度维度已解锁，宇宙编辑器模式激活',
      'ROOT访问：长度参数已覆盖，现实修改权限获取',
      '开发者模式：长度限制已移除，上帝视角已开启',
      '控制台命令：长度设置为最大值，宇宙尺度已调整',
      '超级用户：长度定义已重写，物理定律已更新'
    ]
  };
  
  // Determine which category the length falls into
  let category: keyof typeof evaluations;
  
  if (length === 9999) {
    category = '9999';
  } else if (length === -9999) {
    category = '-9999';
  } else if (length >= 1 && length <= 5) {
    category = '1-5';
  } else if (length <= 10) {
    category = '6-10';
  } else if (length <= 15) {
    category = '11-15';
  } else if (length <= 20) {
    category = '16-20';
  } else {
    category = '21-25';
  }
  
  // Randomly select an evaluation from the category
  const categoryEvaluations = evaluations[category];
  return categoryEvaluations[Math.floor(Math.random() * categoryEvaluations.length)];
}