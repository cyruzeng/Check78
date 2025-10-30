export function sanitizeInput(input: string): string {
  // Remove any HTML tags and special characters that could be used for injection
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[&<>"']/g, '') // Remove special characters
    .replace(/[{}()\\[\\]]/g, '') // Remove brackets and parentheses
    .replace(/[;|&$]/g, '') // Remove command injection characters
    .trim()
    .slice(0, 50); // Limit length to prevent overflow
}

export function isForbiddenString(input: string, forbiddenList: string[]): boolean {
  const sanitizedInput = input.toLowerCase().trim();
  return forbiddenList.some(forbidden => 
    sanitizedInput.includes(forbidden.toLowerCase())
  );
}

export function validateName(input: string): { valid: boolean; error?: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: '名称不能为空' };
  }
  
  if (input.length > 50) {
    return { valid: false, error: '名称过长（最大50字符）' };
  }
  
  if (input.length < 1) {
    return { valid: false, error: '名称过短（至少1字符）' };
  }
  
  return { valid: true };
}

export function generateHash(name: string): number {
  // Generate a consistent hash for name-to-length mapping
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getClientIP(request: Request): string {
  // Extract client IP from request headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}