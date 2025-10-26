import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

type Check = {
  name: string;
  status: "success" | "error";
  statusCode: number;
  message: string;
};

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
        const response = await api.get("/profile");
        list.push({
          name: "GET /profile",
          status: "success",
          statusCode: response.status,
          message: "OK - Profile récupéré",
        });
      } catch (e: any) {
        list.push({
          name: "GET /profile",
          status: "error",
          statusCode: e.response?.status || 0,
          message: e.response?.data?.message || e.message || String(e),
        });
      }

      // 2) /dog avec params owner=me
      try {
        const response = await api.get("/dog", { params: { owner: "me" } });
        const data = response.data;
        const count = Array.isArray(data) ? data.length : Array.isArray(data?.data) ? data.data.length : 0;
        list.push({
          name: "GET /dog?owner=me",
          status: "success",
          statusCode: response.status,
          message: `${count} dog(s) - ${JSON.stringify(data).substring(0, 100)}...`,
        });
      } catch (e: any) {
        list.push({
          name: "GET /dog?owner=me",
          status: "error",
          statusCode: e.response?.status || 0,
          message: e.response?.data?.message || e.message || String(e),
        });
      }

      // 3) /check-subscription
      try {
        const response = await api.get("/check-subscription");
        const data = response.data;
        const msg = `isPremium: ${Boolean(data?.isPremium)}; proPlan: ${data?.proPlan ?? "none"}`;
        list.push({
          name: "GET /check-subscription",
          status: "success",
          statusCode: response.status,
          message: msg,
        });
      } catch (e: any) {
        list.push({
          name: "GET /check-subscription",
          status: "error",
          statusCode: e.response?.status || 0,
          message: e.response?.data?.message || e.message || String(e),
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
