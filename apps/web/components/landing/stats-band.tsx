"use client";

const STATS = [
  { value: "10+", label: "Templates" },
  { value: "3", label: "LLM providers" },
  { value: "<60s", label: "Time to API" },
  { value: "MIT", label: "Licensed" },
  { value: "0", label: "Vendor lock-in" },
];

export function StatsBand() {
  return (
    <section className="relative z-10 border-y border-gray-800/50 bg-gray-950/40 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-3xl font-bold text-white sm:text-4xl">
                <span className="bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
