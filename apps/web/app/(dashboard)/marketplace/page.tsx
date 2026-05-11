"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  difficulty: "easy" | "medium" | "advanced";
  tags: string[];
  stepsCount: number;
  exampleInput?: Record<string, unknown>;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400 bg-green-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  advanced: "text-red-400 bg-red-500/10",
};

export default function MarketplacePage() {
  const router = useRouter();
  const toast = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.templates
      .list()
      .then((res) => {
        setTemplates(res.data);
        setCategories(["All", ...(res.meta?.categories || [])]);
      })
      .catch(() => toast.error("Failed to load marketplace"))
      .finally(() => setLoading(false));
  }, []);

  const handleInstall = async (template: Template) => {
    setInstalling(template.id);
    try {
      const res = await api.templates.install(template.id);
      toast.success(
        "Workflow installed!",
        `${template.name} is ready to use`
      );
      // Navigate to the new workflow
      setTimeout(() => router.push(`/workflows/${res.data.id}`), 600);
    } catch (err: any) {
      toast.error("Install failed", err.message);
    } finally {
      setInstalling(null);
    }
  };

  const filtered = templates.filter((t) => {
    const matchesCategory =
      activeCategory === "All" || t.category === activeCategory;
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Marketplace</h1>
        <p className="mt-1 text-sm text-gray-400">
          Install pre-built workflows with one click
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-lg border border-gray-700 bg-gray-900 pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeCategory === cat
                ? "bg-brand-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-gray-900" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 px-5 py-16 text-center">
          <p className="text-sm text-gray-400">No templates match your search</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="group flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-2xl">
                  {template.icon}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                    DIFFICULTY_COLORS[template.difficulty] ||
                    DIFFICULTY_COLORS.easy
                  }`}
                >
                  {template.difficulty}
                </span>
              </div>

              <h3 className="mt-3 font-semibold text-white group-hover:text-brand-400">
                {template.name}
              </h3>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-400">
                {template.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{template.stepsCount} steps</span>
                <span>{template.category}</span>
              </div>

              <button
                onClick={() => handleInstall(template)}
                disabled={installing !== null}
                className="mt-4 rounded-lg bg-brand-600 py-2 text-xs font-medium text-white transition hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {installing === template.id
                  ? "Installing..."
                  : "Install Workflow"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
