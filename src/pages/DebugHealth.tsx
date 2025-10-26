import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Check = {
  name: string;
  status: "success" | "error";
  statusCode: number;
  message: string;
};

async function getToken(): Promise<string | null> {
  try {
    // @ts-ignore - supabase attachée globalement dans Lovable
    const session = await window?.supabase?.auth?.getSession?.();
    return session?.data?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function kfetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const fullPath = path.startsWith('http') ? path : `${baseUrl}/functions/v1${path}`;
  
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(fullPath, { ...init, headers });
  return res;
}

export default function DebugHealth() {
  const [rows, setRows] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);
      const list: Check[] = [];

      // 1) /profile (profil courant)
      try {
        const r = await kfetch("/profile");
        const msg = r.ok ? "OK" : await r.text().catch(() => "");
        list.push({
          name: "GET /profile",
          status: r.ok ? "success" : "error",
          statusCode: r.status,
          message: msg || r.statusText,
        });
      } catch (e: any) {
        list.push({
          name: "GET /profile",
          status: "error",
          statusCode: 0,
          message: String(e?.message || e),
        });
      }

      // 2) /dog?owner=:me (ou fallback /dog simple)
      try {
        const r = await kfetch("/dog?owner=me");
        let info = "";
        if (r.ok) {
          const js = await r.json().catch(() => null);
          const count = Array.isArray(js) ? js.length : Array.isArray(js?.data) ? js.data.length : 0;
          info = `${count} dog(s)`;
        } else {
          info = await r.text().catch(() => "");
        }
        list.push({
          name: "GET /dog?owner=me",
          status: r.ok ? "success" : "error",
          statusCode: r.status,
          message: info || r.statusText,
        });
      } catch (e: any) {
        list.push({
          name: "GET /dog?owner=me",
          status: "error",
          statusCode: 0,
          message: String(e?.message || e),
        });
      }

      // 3) /check-subscription
      try {
        const r = await kfetch("/check-subscription");
        let msg = r.statusText;
        if (r.ok) {
          const data = await r.json().catch(() => ({} as any));
          msg = `isPremium: ${Boolean(data?.isPremium)}; proPlan: ${data?.proPlan ?? "none"}`;
        } else {
          msg = await r.text().catch(() => r.statusText);
        }
        list.push({
          name: "GET /check-subscription",
          status: r.ok ? "success" : "error",
          statusCode: r.status,
          message: msg,
        });
      } catch (e: any) {
        list.push({
          name: "GET /check-subscription",
          status: "error",
          statusCode: 0,
          message: String(e?.message || e),
        });
      }

      if (mounted) {
        setRows(list);
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="font-display text-2xl mb-4">Debug Health</h1>

      <div className="text-sm mb-4 text-gray-600">
        <Link to="/profile/me" className="underline">Aller à mon profil</Link>
      </div>

      {loading && <div className="p-4 rounded-xl bg-white shadow">Vérification en cours…</div>}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.name}
              className={`p-4 rounded-xl shadow-soft border ${
                r.status === "success" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="font-medium">{r.name}</div>
              <div className="text-sm mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-full mr-2 text-xs font-semibold ${
                  r.status === "success" ? "bg-green-600/10 text-green-800" : "bg-amber-600/10 text-amber-800"
                }`}>
                  {r.status} • {r.statusCode}
                </span>
                {r.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
