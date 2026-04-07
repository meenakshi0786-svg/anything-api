"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [apiKeys] = useState([
    {
      id: "1",
      name: "Production Key",
      prefix: "afa_sk_live_7x2k",
      createdAt: "2026-04-01",
      lastUsed: "2026-04-07",
    },
    {
      id: "2",
      name: "Development Key",
      prefix: "afa_sk_test_m9p4",
      createdAt: "2026-04-01",
      lastUsed: "2026-04-06",
    },
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* API Keys */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">API Keys</h2>
            <p className="text-sm text-gray-400">
              Manage your API keys for programmatic access
            </p>
          </div>
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500">
            Create Key
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-5 py-4"
            >
              <div>
                <div className="text-sm font-medium text-white">{key.name}</div>
                <div className="mt-0.5 font-mono text-xs text-gray-400">
                  {key.prefix}...
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-gray-500">
                  <div>Created {key.createdAt}</div>
                  <div>Last used {key.lastUsed}</div>
                </div>
                <button className="text-xs text-red-400 hover:text-red-300">
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-lg font-semibold text-white">Usage This Month</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="text-xs text-gray-500">API Runs</div>
            <div className="mt-1 text-2xl font-bold text-white">25</div>
            <div className="mt-1 text-xs text-gray-500">of 100 free</div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-800">
              <div className="h-full w-1/4 rounded-full bg-brand-500" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="text-xs text-gray-500">Browser Time</div>
            <div className="mt-1 text-2xl font-bold text-white">1.2h</div>
            <div className="mt-1 text-xs text-gray-500">of 5h free</div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-800">
              <div className="h-full w-[24%] rounded-full bg-green-500" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="text-xs text-gray-500">Proxy Data</div>
            <div className="mt-1 text-2xl font-bold text-white">0 MB</div>
            <div className="mt-1 text-xs text-gray-500">datacenter included</div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-800">
              <div className="h-full w-0 rounded-full bg-purple-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Plan */}
      <section>
        <h2 className="text-lg font-semibold text-white">Plan</h2>
        <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Free Plan</div>
              <div className="mt-0.5 text-xs text-gray-400">
                100 runs/mo, 5 browser hours, 2 concurrent sessions
              </div>
            </div>
            <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500">
              Upgrade to Pro — $49/mo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
