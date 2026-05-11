"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadKeys = async () => {
    try {
      const res = await api.apiKeys.list();
      setKeys(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load API keys");
    }
  };

  const loadUser = async () => {
    try {
      const res = await api.auth.getMe();
      setUser(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    Promise.all([loadKeys(), loadUser()]).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await api.apiKeys.create({ name: newKeyName.trim() });
      setNewKey(res.data.key);
      setNewKeyName("");
      await loadKeys();
    } catch (err: any) {
      setError(err.message || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? Any application using it will stop working.")) return;
    try {
      await api.apiKeys.revoke(id);
      await loadKeys();
    } catch (err: any) {
      setError(err.message || "Failed to revoke key");
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setNewKey(null);
    setNewKeyName("");
    setError("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Profile */}
      <section>
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
          {user ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white">
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-12 animate-pulse rounded bg-gray-800" />
          )}
        </div>
      </section>

      {/* API Keys */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">API Keys</h2>
            <p className="text-sm text-gray-400">
              Manage your API keys for programmatic access
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
          >
            Create Key
          </button>
        </div>

        {error && !showCreateModal && (
          <div className="mt-3 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {loading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-900" />
            ))
          ) : keys.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 px-5 py-10 text-center">
              <p className="text-sm text-gray-400">No API keys yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Create one to call your APIs from external apps
              </p>
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-5 py-4"
              >
                <div>
                  <div className="text-sm font-medium text-white">{key.name}</div>
                  <div className="mt-0.5 font-mono text-xs text-gray-400">
                    {key.keyPrefix}...
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-gray-500">
                    <div>Created {new Date(key.createdAt).toLocaleDateString()}</div>
                    <div>
                      {key.lastUsedAt
                        ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                        : "Never used"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Plan info */}
      <section>
        <h2 className="text-lg font-semibold text-white">Plan</h2>
        <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white capitalize">
                {user?.plan || "Free"} Plan
              </div>
              <div className="mt-0.5 text-xs text-gray-400">
                {user?.plan === "free" || !user?.plan
                  ? "100 runs/mo, 5 browser hours, 2 concurrent sessions"
                  : "Custom limits — contact support"}
              </div>
            </div>
            {(!user?.plan || user.plan === "free") && (
              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500">
                Upgrade to Pro — $49/mo
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {newKey ? (
              <>
                <h3 className="text-lg font-semibold text-white">
                  API Key Created
                </h3>
                <p className="mt-1 text-sm text-yellow-300">
                  Copy this key now — you won&apos;t be able to see it again.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
                  <code className="flex-1 truncate font-mono text-xs text-green-400">
                    {newKey}
                  </code>
                  <button
                    onClick={() => navigator.clipboard?.writeText(newKey)}
                    className="rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-800"
                  >
                    Copy
                  </button>
                </div>
                <button
                  onClick={closeModal}
                  className="mt-6 w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-500"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white">
                  Create API Key
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Give it a name to remember what it&apos;s used for
                </p>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs text-gray-300">
                    Key name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production server"
                    autoFocus
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                {error && (
                  <div className="mt-3 rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-xs text-red-300">
                    {error}
                  </div>
                )}
                <div className="mt-6 flex gap-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newKeyName.trim() || creating}
                    className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
