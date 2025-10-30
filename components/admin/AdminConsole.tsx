"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  Lock,
  LogOut,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sword
} from "lucide-react";
import { createLengthComment } from "@/lib/measurement";

interface Measurement {
  id: string;
  name: string;
  normalizedName: string;
  value: number;
  listed: boolean;
  listedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EasterEgg {
  id: string;
  trigger: string;
  normalizedTrigger: string;
  value: number;
  note?: string | null;
  createdAt: string;
}

interface BannedName {
  id: string;
  value: string;
  normalizedValue: string;
  reason?: string | null;
  createdAt: string;
}

const TOKEN_STORAGE_KEY = "check78-admin-token";

export function AdminConsole() {
  const [statusReady, setStatusReady] = useState<boolean | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [eggs, setEggs] = useState<EasterEgg[]>([]);
  const [banned, setBanned] = useState<BannedName[]>([]);

  const [search, setSearch] = useState("");
  const [newEgg, setNewEgg] = useState({ trigger: "", value: 9999, note: "" });
  const [newBan, setNewBan] = useState({ value: "", reason: "" });

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [setupForm, setSetupForm] = useState({
    username: "",
    password: "",
    confirm: ""
  });

  const isAuthenticated = Boolean(token);

  const filteredMeasurements = useMemo(() => {
    if (!search.trim()) return measurements;
    const keyword = search.trim().toLowerCase();
    return measurements.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.normalizedName.includes(keyword)
    );
  }, [measurements, search]);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/status", { cache: "no-store" });
      if (!response.ok) throw new Error("无法获取系统状态");
      const data = await response.json();
      setStatusReady(Boolean(data.ready));
    } catch (err) {
      console.error(err);
      setStatusReady(false);
      setError("无法连接管理服务，请稍后重试。");
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const query = search.trim()
        ? `?q=${encodeURIComponent(search.trim())}`
        : "";
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [measurementRes, eggRes, bannedRes] = await Promise.all([
        fetch(`/api/admin/measurements${query}`, {
          headers,
          cache: "no-store"
        }),
        fetch("/api/admin/easter-eggs", { headers, cache: "no-store" }),
        fetch("/api/admin/banned", { headers, cache: "no-store" })
      ]);

      if (
        measurementRes.status === 401 ||
        eggRes.status === 401 ||
        bannedRes.status === 401
      ) {
        throw new Error("AUTH_EXPIRED");
      }

      if (!measurementRes.ok || !eggRes.ok || !bannedRes.ok) {
        throw new Error("授权失败或数据获取失败");
      }

      const [measurementsJson, eggsJson, bannedJson] = await Promise.all([
        measurementRes.json(),
        eggRes.json(),
        bannedRes.json()
      ]);

      setMeasurements(measurementsJson);
      setEggs(eggsJson);
      setBanned(bannedJson);
    } catch (err) {
      if (err instanceof Error && err.message === "AUTH_EXPIRED") {
        setError("授权已失效，请重新登录。");
        setToken("");
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } else {
        setError(err instanceof Error ? err.message : "未知错误");
      }
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (token) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  }, [token]);

  useEffect(() => {
    if (statusReady && token) {
      fetchAdminData();
    }
  }, [statusReady, token, fetchAdminData]);

  const handleSetup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (setupForm.password !== setupForm.confirm) {
      setError("两次密码输入不一致");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: setupForm.username.trim(),
          password: setupForm.password
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "初始化失败");
      }
      const payload = await response.json();
      setToken(payload.token);
      setStatusReady(true);
      setSetupForm({ username: "", password: "", confirm: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "初始化失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginForm.username.trim(),
          password: loginForm.password
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "登录失败");
      }
      const payload = await response.json();
      setToken(payload.token);
      setLoginForm({ username: "", password: "" });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setMeasurements([]);
    setEggs([]);
    setBanned([]);
    setError(null);
  };

  const authHeaders = useMemo(() => {
    if (!token) return null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }, [token]);

  const handleUpdateLength = async (id: string, value: number) => {
    if (!authHeaders) return;
    try {
      const response = await fetch(`/api/admin/measurements/${id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ value })
      });
      if (response.status === 401) {
        throw new Error("AUTH_EXPIRED");
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "更新失败");
      }
      await fetchAdminData();
    } catch (err) {
      if (err instanceof Error && err.message === "AUTH_EXPIRED") {
        setError("授权已失效，请重新登录。");
        handleLogout();
      } else {
        setError(err instanceof Error ? err.message : "更新失败");
      }
    }
  };

  const handleCreateEgg = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authHeaders) return;
    try {
      const response = await fetch("/api/admin/easter-eggs", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          trigger: newEgg.trigger,
          value: Number(newEgg.value),
          note: newEgg.note || undefined
        })
      });
      if (response.status === 401) {
        throw new Error("AUTH_EXPIRED");
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "创建失败");
      }
      setNewEgg({ trigger: "", value: 9999, note: "" });
      await fetchAdminData();
    } catch (err) {
      if (err instanceof Error && err.message === "AUTH_EXPIRED") {
        setError("授权已失效，请重新登录。");
        handleLogout();
      } else {
        setError(err instanceof Error ? err.message : "创建失败");
      }
    }
  };

  const handleDeleteEgg = async (id: string) => {
    if (!authHeaders) return;
    try {
      const response = await fetch(`/api/admin/easter-eggs/${id}`, {
        method: "DELETE",
        headers: authHeaders
      });
      if (response.status === 401) {
        throw new Error("AUTH_EXPIRED");
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "删除失败");
      }
      await fetchAdminData();
    } catch (err) {
      if (err instanceof Error && err.message === "AUTH_EXPIRED") {
        setError("授权已失效，请重新登录。");
        handleLogout();
      } else {
        setError(err instanceof Error ? err.message : "删除失败");
      }
    }
  };

  const handleCreateBan = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authHeaders) return;
    try {
      const response = await fetch("/api/admin/banned", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          value: newBan.value,
          reason: newBan.reason || undefined
        })
      });
      if (response.status === 401) {
        throw new Error("AUTH_EXPIRED");
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "创建失败");
      }
      setNewBan({ value: "", reason: "" });
      await fetchAdminData();
    } catch (err) {
      if (err instanceof Error && err.message === "AUTH_EXPIRED") {
        setError("授权已失效，请重新登录。");
        handleLogout();
      } else {
        setError(err instanceof Error ? err.message : "创建失败");
      }
    }
  };

  const handleDeleteBan = async (id: string) => {
    if (!authHeaders) return;
    try {
      const response = await fetch(`/api/admin/banned/${id}`, {
        method: "DELETE",
        headers: authHeaders
      });
      if (response.status === 401) {
        throw new Error("AUTH_EXPIRED");
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "删除失败");
      }
      await fetchAdminData();
    } catch (err) {
      if (err instanceof Error && err.message === "AUTH_EXPIRED") {
        setError("授权已失效，请重新登录。");
        handleLogout();
      } else {
        setError(err instanceof Error ? err.message : "删除失败");
      }
    }
  };

  const renderSetupForm = () => (
    <form
      onSubmit={handleSetup}
      className="glow-card space-y-6 border border-neon-blue/40 p-8"
    >
      <div className="flex items-center gap-3 text-sm text-slate-300/80">
        <Lock className="size-4" />
        初始化管理员账户以开启控制台。
      </div>
      <div className="grid gap-4">
        <label className="space-y-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
            用户名
          </span>
          <input
            value={setupForm.username}
            onChange={(event) =>
              setSetupForm((prev) => ({ ...prev, username: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20"
            placeholder="仅限字母、数字、下划线、连字符"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
            密码
          </span>
          <input
            type="password"
            value={setupForm.password}
            onChange={(event) =>
              setSetupForm((prev) => ({ ...prev, password: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20"
            placeholder="至少 8 位"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
            确认密码
          </span>
          <input
            type="password"
            value={setupForm.confirm}
            onChange={(event) =>
              setSetupForm((prev) => ({ ...prev, confirm: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20"
            placeholder="请再次输入"
          />
        </label>
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 shadow-lg disabled:opacity-50"
        disabled={loading}
      >
        <Sword className="size-4" />
        初始化管理员
      </button>
    </form>
  );

  const renderLoginForm = () => (
    <form
      onSubmit={handleLogin}
      className="glow-card space-y-6 border border-neon-blue/40 p-8"
    >
      <div className="flex items-center gap-3 text-sm text-slate-300/80">
        <Lock className="size-4" />
        输入管理员账号密码以访问后台。
      </div>
      <div className="grid gap-4">
        <input
          value={loginForm.username}
          onChange={(event) =>
            setLoginForm((prev) => ({ ...prev, username: event.target.value }))
          }
          placeholder="用户名"
          className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-sm focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20"
        />
        <input
          type="password"
          value={loginForm.password}
          onChange={(event) =>
            setLoginForm((prev) => ({ ...prev, password: event.target.value }))
          }
          placeholder="密码"
          className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-sm focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20"
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 shadow-lg disabled:opacity-50"
        disabled={loading}
      >
        <Sword className="size-4" />
        登录后台
      </button>
    </form>
  );

  const renderDashboard = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-300/80">
          共 {measurements.length} 条量测记录，{banned.length} 条违禁字符串，{eggs.length} 个彩蛋。
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="检索记录..."
              className="bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </div>
          <button
            type="button"
            onClick={fetchAdminData}
            className="flex items-center gap-2 rounded-2xl border border-neon-blue/60 bg-slate-900/60 px-4 py-2 text-xs uppercase tracking-[0.28em] text-neon-blue transition hover:bg-neon-blue/10"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="size-4" />
            退出登录
          </button>
        </div>
      </div>

      <section className="glow-card space-y-6 border border-slate-700/60 p-8">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neon-blue">量测记录</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
            支持修改长度
          </span>
        </header>

        <div className="grid gap-4">
          {filteredMeasurements.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40 px-4 py-8 text-center text-sm text-slate-400">
              暂无记录或未命中搜索条件。
            </p>
          )}

          {filteredMeasurements.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 md:grid-cols-[2fr_1.2fr_auto]"
            >
              <div>
                <p className="font-medium text-slate-100">{item.name}</p>
                <p className="text-xs text-slate-500">
                  {item.normalizedName} ·{" "}
                  {new Date(item.updatedAt).toLocaleString("zh-CN", {
                    hour12: false
                  })}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {createLengthComment(item.value)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex w-full items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    长度
                  </span>
                  <input
                    type="number"
                    defaultValue={item.value}
                    onBlur={(event) =>
                      handleUpdateLength(item.id, Number(event.target.value))
                    }
                    className="w-full bg-transparent text-right text-base text-neon-amber outline-none"
                  />
                </label>
              </div>
              <div className="flex items-center justify-end">
                <span
                  className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em] ${
                    item.listed
                      ? "border border-neon-pink/70 text-neon-pink"
                      : "border border-slate-700 text-slate-500"
                  }`}
                >
                  {item.listed ? "榜单" : "未上传"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glow-card space-y-5 border border-neon-purple/40 p-8">
          <header className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neon-purple">彩蛋管理</h3>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
              -9999 / 9999 等
            </span>
          </header>

          <form
            onSubmit={handleCreateEgg}
            className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4"
          >
            <div className="grid gap-3 text-sm">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  触发字符串
                </span>
                <input
                  value={newEgg.trigger}
                  onChange={(event) =>
                    setNewEgg((prev) => ({
                      ...prev,
                      trigger: event.target.value
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-2 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20"
                  placeholder="如：宇宙管理员"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  自定义长度
                </span>
                <input
                  type="number"
                  value={newEgg.value}
                  onChange={(event) =>
                    setNewEgg((prev) => ({
                      ...prev,
                      value: Number(event.target.value)
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-2 focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  备注
                </span>
                <input
                  value={newEgg.note}
                  onChange={(event) =>
                    setNewEgg((prev) => ({ ...prev, note: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-2 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20"
                  placeholder="可选"
                />
              </label>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl border border-neon-purple/60 bg-slate-900/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-neon-purple hover:bg-neon-purple/10"
            >
              <PlusCircle className="size-4" />
              新增/更新彩蛋
            </button>
          </form>

          <div className="space-y-3">
            {eggs.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/50 px-4 py-6 text-center text-sm text-slate-400">
                暂无彩蛋，快来创造宇宙级惊喜。
              </p>
            )}
            {eggs.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-100">{item.trigger}</p>
                  <p className="text-xs text-slate-500">
                    {item.value} · {item.note ?? "无备注"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEgg(item.id)}
                  className="rounded-full border border-red-500/60 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glow-card space-y-5 border border-neon-blue/40 p-8">
          <header className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neon-blue">违禁字符串</h3>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
              防注入 / 防滥用
            </span>
          </header>

          <form
            onSubmit={handleCreateBan}
            className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4"
          >
            <div className="grid gap-3 text-sm">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  违禁词汇
                </span>
                <input
                  value={newBan.value}
                  onChange={(event) =>
                    setNewBan((prev) => ({ ...prev, value: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-2 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  封禁理由
                </span>
                <input
                  value={newBan.reason}
                  onChange={(event) =>
                    setNewBan((prev) => ({ ...prev, reason: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-2 focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20"
                  placeholder="可选"
                />
              </label>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl border border-neon-blue/60 bg-slate-900/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-neon-blue hover:bg-neon-blue/10"
            >
              <PlusCircle className="size-4" />
              新增/更新封禁
            </button>
          </form>

          <div className="space-y-3">
            {banned.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/50 px-4 py-6 text-center text-sm text-slate-400">
                暂无违禁词。保持宇宙秩序井然。
              </p>
            )}
            {banned.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-100">{item.value}</p>
                  <p className="text-xs text-slate-500">
                    {item.reason ?? "未填写原因"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteBan(item.id)}
                  className="rounded-full border border-red-500/60 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center gap-3 text-neon-purple"
      >
        <ShieldCheck className="size-6" />
        <h1 className="text-3xl font-semibold">78 长度测量仪 · 管理控制中心</h1>
      </motion.div>

      {statusReady === null && (
        <div className="glow-card mb-10 border border-slate-700/60 p-8 text-sm text-slate-300/80">
          正在同步银河指挥权限，请稍候...
        </div>
      )}
      {statusReady === false && !isAuthenticated ? renderSetupForm() : null}
      {statusReady && !isAuthenticated ? renderLoginForm() : null}
      {statusReady && isAuthenticated ? renderDashboard() : null}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-8 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {loading && (
        <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center bg-slate-950/70 backdrop-blur">
          <Loader2 className="size-10 animate-spin text-neon-blue" />
        </div>
      )}
    </div>
  );
}
