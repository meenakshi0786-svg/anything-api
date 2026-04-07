"use client";

const categories = [
  "All",
  "E-commerce",
  "Social Media",
  "Job Boards",
  "Real Estate",
  "Finance",
  "Travel",
  "News",
];

const featured = [
  {
    title: "Amazon Product Scraper",
    description: "Extract price, title, reviews, and ratings from any Amazon product URL",
    author: "AnythingAPI Team",
    installs: 12400,
    rating: 4.8,
    category: "E-commerce",
    verified: true,
  },
  {
    title: "LinkedIn Job Search",
    description: "Search and extract job listings with title, company, salary, and link",
    author: "community",
    installs: 8200,
    rating: 4.6,
    category: "Job Boards",
    verified: true,
  },
  {
    title: "Google Maps Reviews",
    description: "Extract reviews, ratings, and business info from any Google Maps listing",
    author: "community",
    installs: 5100,
    rating: 4.5,
    category: "Social Media",
    verified: false,
  },
  {
    title: "Zillow Property Monitor",
    description: "Track property prices and details across Zillow listings",
    author: "community",
    installs: 3400,
    rating: 4.4,
    category: "Real Estate",
    verified: false,
  },
  {
    title: "Shopify Store Monitor",
    description: "Monitor competitor prices, stock status, and new products on Shopify stores",
    author: "AnythingAPI Team",
    installs: 6800,
    rating: 4.7,
    category: "E-commerce",
    verified: true,
  },
  {
    title: "HackerNews Top Stories",
    description: "Get the top stories from HackerNews with title, score, comments, and URL",
    author: "community",
    installs: 2100,
    rating: 4.3,
    category: "News",
    verified: false,
  },
];

export default function MarketplacePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Marketplace</h1>
        <p className="mt-1 text-sm text-gray-400">
          Browse and install community-built workflows
        </p>
      </div>

      {/* Categories */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              cat === "All"
                ? "bg-brand-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((item) => (
          <div
            key={item.title}
            className="group cursor-pointer rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 text-lg">
                {item.category === "E-commerce"
                  ? "🛒"
                  : item.category === "Job Boards"
                  ? "💼"
                  : item.category === "Social Media"
                  ? "📱"
                  : item.category === "Real Estate"
                  ? "🏠"
                  : item.category === "News"
                  ? "📰"
                  : "⚡"}
              </div>
              {item.verified && (
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                  Verified
                </span>
              )}
            </div>

            <h3 className="mt-3 font-semibold text-white group-hover:text-brand-400">
              {item.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-400">
              {item.description}
            </p>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>{item.installs.toLocaleString()} installs</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span>{item.rating}</span>
              </div>
            </div>

            <button className="mt-3 w-full rounded-lg border border-gray-700 py-2 text-xs font-medium text-gray-300 transition hover:border-brand-500 hover:text-brand-400">
              Install Workflow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
