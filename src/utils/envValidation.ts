/**
 * 环境变量验证工具
 * 确保生产环境中的关键配置都已正确设置
 */

export function validateRequiredEnvVars() {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
  };

  const missingVars = Object.entries(requiredVars).filter(([key, value]) => !value);

  if (missingVars.length > 0) {
    const missingList = missingVars.map(([key]) => key).join(', ');
    console.warn(`⚠️ 警告：缺少以下环境变量：${missingList}`);
    
    // 在开发环境中提供默认值，生产环境中抛出错误
    if (process.env.NODE_ENV === 'development') {
      // 为开发环境设置默认密码（仅用于开发）
      if (!process.env.ADMIN_PASSWORD) {
        process.env.ADMIN_PASSWORD = 'admin123';
        console.warn('🔧 开发模式：已设置默认管理员密码 (admin123) - 仅用于本地开发');
      }
      return false;
    } else {
      throw new Error(`缺少必需的环境变量：${missingList}`);
    }
  }

  return true;
}

export function validateEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  
  console.log(`📊 当前运行环境：${nodeEnv}`);
  
  if (isProduction) {
    console.log('🔒 生产环境模式：所有安全检查已启用');
  } else {
    console.log('🛠️ 开发环境模式：使用安全检查和默认值');
  }
  
  return {
    isProduction,
    environment: nodeEnv
  };
}

/**
 * 获取安全的管理员密码
 * 自动验证环境变量并提供适当的错误处理
 */
export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  
  if (!password) {
    throw new Error('管理员密码未设置。请在环境变量中设置 ADMIN_PASSWORD');
  }
  
  // 密码长度检查
  if (password.length < 6) {
    throw new Error('管理员密码长度至少为6位字符');
  }
  
  return password;
}