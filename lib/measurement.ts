export const LENGTH_COMMENTS: Record<string, string> = {
  "1-5": "来自另一个量子维度的微型奇迹，谨慎使用显微镜。",
  "6-10": "看起来像是星舰工程师正在施工，成果正在缓慢浮现。",
  "11-15": "此等长度刚好可作为星际酒吧的谈资，值得小小炫耀。",
  "16-20": "强烈的引力波正在附近震荡，堪称银河联盟的标准配置。",
  "21-25": "叠加态下的传奇存在，宇宙都为之侧目，致敬吧旅人。",
  negative:
    "被黑洞吞噬的长度，连时间都倒流了，建议立即提交星际报修单。",
  colossal:
    "突破物理定律的庞然大物，宇宙評議会已派出考察舰队前往围观。"
};

export function normalizeInput(value: string) {
  return value.trim().toLowerCase();
}

export function createLengthComment(value: number): string {
  if (value <= 0) {
    return LENGTH_COMMENTS.negative;
  }
  if (value >= 1000) {
    return LENGTH_COMMENTS.colossal;
  }
  if (value <= 5) return LENGTH_COMMENTS["1-5"];
  if (value <= 10) return LENGTH_COMMENTS["6-10"];
  if (value <= 15) return LENGTH_COMMENTS["11-15"];
  if (value <= 20) return LENGTH_COMMENTS["16-20"];
  return LENGTH_COMMENTS["21-25"];
}

export function randomLength(): number {
  const cryptoApi = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    const buffer = new Uint32Array(1);
    cryptoApi.getRandomValues(buffer);
    return (buffer[0] % 25) + 1;
  }

  return Math.floor(Math.random() * 25) + 1;
}
