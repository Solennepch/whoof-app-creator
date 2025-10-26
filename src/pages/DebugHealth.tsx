import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

type Check = {
  name: string;
  status: "success" | "error";
  statusCode: number;
  message: string;
  data?: any;
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
          data: response.data,
        });
      } catch (e: any) {
        list.push({
          name: "GET /profile",
          status: "error",
          statusCode: e.response?.status || 0,
          message: e.response?.statusText || e.message || "Network error",
          data: e.response?.data || { error: String(e) },
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
          message: `${count} dog(s)`,
          data: data,
        });
      } catch (e: any) {
        list.push({
          name: "GET /dog?owner=me",
          status: "error",
          statusCode: e.response?.status || 0,
          message: e.response?.statusText || e.message || "Network error",
          data: e.response?.data || { error: String(e) },
        });
      }

      // 2b) /dog avec params ownerId=me (variante)
      try {
        const response = await api.get("/dog", { params: { ownerId: "me" } });
        const data = response.data;
        const count = Array.isArray(data) ? data.length : Array.isArray(data?.data) ? data.data.length : 0;
        list.push({
          name: "GET /dog?ownerId=me",
          status: "success",
          statusCode: response.status,
          message: `${count} dog(s)`,
          data: data,
        });
      } catch (e: any) {
        list.push({
          name: "GET /dog?ownerId=me",
          status: "error",
          statusCode: e.response?.status || 0,
          message: e.response?.statusText || e.message || "Network error",
          data: e.response?.data || { error: String(e) },
        });
      }

      // 2c) /dogs (pluriel) avec params owner=me (variante)
      try {
        const response = await api.get("/dogs", { params: { owner: "me" } });
        const data = response.data;
        const count = Array.isArray(data) ? data.length : Array.isArray(data?.data) ? data.data.length : 0;
        list.push({
          name: "GET /dogs?owner=me",
          status: "success",
          statusCode: response.status,
          message: `${count} dog(s)`,
          data: data,
        });
      } catch (e: any) {
        list.push({
          name: "GET /dogs?owner=me",
          status: "error",
          statusCode: e.response?.status || 0,
          message: e.response?.statusText || e.message || "Network error",
          data: e.response?.data || { error: String(e) },
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
          data: data,
        });
      } catch (e: any) {
        list.push({
          name: "GET /check-subscription",
          status: "error",
          statusCode: e.response?.status || 0,
          message: e.response?.statusText || e.message || "Network error",
          data: e.response?.data || { error: String(e) },
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
              {r.data && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-900">
                    Voir la réponse complète
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(r.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
