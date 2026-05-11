/**
 * Pre-built workflow templates that users can install with one click.
 * Each template is a fully-formed workflow ready to deploy.
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  difficulty: "easy" | "medium" | "advanced";
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  steps: Array<{
    id: string;
    type: string;
    config: Record<string, unknown>;
    dependsOn?: string[];
    timeoutMs?: number;
  }>;
  tags: string[];
  exampleInput?: Record<string, unknown>;
}

export const TEMPLATES: WorkflowTemplate[] = [
  {
    id: "amazon-product",
    name: "Amazon Product Scraper",
    description: "Extract title, price, rating, and availability from any Amazon product URL",
    category: "E-commerce",
    icon: "🛒",
    difficulty: "easy",
    tags: ["amazon", "ecommerce", "product", "price"],
    exampleInput: { url: "https://www.amazon.com/dp/B09V3KXJPB" },
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string",
          format: "uri",
          description: "Full Amazon product URL",
        },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Product title" },
        price: { type: "string", description: "Current price with currency" },
        rating: { type: "number", description: "Star rating (1-5)" },
        review_count: { type: "integer", description: "Total reviews" },
        availability: { type: "string", description: "Stock status" },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "{{input.url}}", waitUntil: "domcontentloaded" },
      },
      {
        id: "wait_for_title",
        type: "wait_for",
        config: { selector: "#productTitle, h1", timeout: 15000 },
        dependsOn: ["navigate"],
      },
      {
        id: "extract",
        type: "extract",
        config: {
          strategy: "hybrid",
          selectors: {
            title: "#productTitle",
            price: ".a-price.aok-align-center .a-offscreen, .a-price .a-offscreen",
            availability: "#availability span",
          },
          aiPrompt: "Extract product title, price (with currency), star rating, total review count, and availability status.",
          fields: ["title", "price", "rating", "review_count", "availability"],
          aiFallback: true,
        },
        dependsOn: ["wait_for_title"],
      },
    ],
  },
  {
    id: "shopify-product",
    name: "Shopify Product Monitor",
    description: "Track price, stock, and variants for any Shopify store product",
    category: "E-commerce",
    icon: "🛍️",
    difficulty: "easy",
    tags: ["shopify", "ecommerce", "monitor"],
    exampleInput: { url: "https://allbirds.com/products/mens-tree-runners" },
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string", format: "uri", description: "Shopify product URL" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        price: { type: "string" },
        compare_at_price: { type: "string" },
        in_stock: { type: "boolean" },
        variants: { type: "array" },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "{{input.url}}", waitUntil: "domcontentloaded" },
      },
      {
        id: "extract",
        type: "extract",
        config: {
          strategy: "ai",
          aiPrompt: "Extract Shopify product details: title, current price, compare-at price (if any), whether it's in stock, and available variants (sizes/colors).",
          fields: ["title", "price", "compare_at_price", "in_stock", "variants"],
        },
        dependsOn: ["navigate"],
      },
    ],
  },
  {
    id: "hackernews-top",
    name: "Hacker News Top Stories",
    description: "Get the top 30 stories from Hacker News with title, points, and URL",
    category: "News",
    icon: "📰",
    difficulty: "easy",
    tags: ["news", "hackernews", "tech"],
    exampleInput: {},
    inputSchema: {
      type: "object",
      properties: {},
    },
    outputSchema: {
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              url: { type: "string" },
              points: { type: "integer" },
              comments: { type: "integer" },
            },
          },
        },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "https://news.ycombinator.com", waitUntil: "domcontentloaded" },
      },
      {
        id: "extract_stories",
        type: "extract",
        config: {
          strategy: "ai",
          aiPrompt: "Extract all 30 stories from this Hacker News front page. For each: title, URL (the linked article URL, not the HN comments link), points, and comment count.",
          fields: ["stories"],
        },
        dependsOn: ["navigate"],
      },
    ],
  },
  {
    id: "google-news",
    name: "Google News Search",
    description: "Search Google News for any topic and get top headlines with sources",
    category: "News",
    icon: "🗞️",
    difficulty: "medium",
    tags: ["news", "google", "search"],
    exampleInput: { query: "AI startup" },
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", description: "Search query" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        articles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              source: { type: "string" },
              url: { type: "string" },
              published_at: { type: "string" },
            },
          },
        },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "https://news.google.com/search?q={{input.query}}", waitUntil: "domcontentloaded" },
      },
      {
        id: "scroll",
        type: "scroll",
        config: { distance: 1500, direction: "down" },
        dependsOn: ["navigate"],
      },
      {
        id: "extract_articles",
        type: "extract",
        config: {
          strategy: "ai",
          aiPrompt: "Extract the top 20 news articles from this Google News page. For each: title, source name, URL, and published time/date.",
          fields: ["articles"],
        },
        dependsOn: ["scroll"],
      },
    ],
  },
  {
    id: "yelp-business",
    name: "Yelp Business Info",
    description: "Get business details, rating, hours, and reviews from any Yelp listing",
    category: "Local Business",
    icon: "🍽️",
    difficulty: "medium",
    tags: ["yelp", "business", "reviews", "local"],
    exampleInput: { url: "https://www.yelp.com/biz/blue-bottle-coffee-san-francisco-13" },
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string", format: "uri", description: "Yelp business URL" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        rating: { type: "number" },
        review_count: { type: "integer" },
        price_range: { type: "string" },
        categories: { type: "array", items: { type: "string" } },
        address: { type: "string" },
        phone: { type: "string" },
        hours: { type: "object" },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "{{input.url}}", waitUntil: "domcontentloaded" },
      },
      {
        id: "wait",
        type: "wait_for",
        config: { selector: "h1", timeout: 15000 },
        dependsOn: ["navigate"],
      },
      {
        id: "extract",
        type: "extract",
        config: {
          strategy: "ai",
          aiPrompt: "Extract Yelp business info: name, star rating, total review count, price range ($/$$/$$$), categories, address, phone number, and business hours by day of week.",
          fields: ["name", "rating", "review_count", "price_range", "categories", "address", "phone", "hours"],
        },
        dependsOn: ["wait"],
      },
    ],
  },
  {
    id: "github-repo-info",
    name: "GitHub Repository Stats",
    description: "Get stars, forks, issues, language, and recent activity from a GitHub repo",
    category: "Developer Tools",
    icon: "🐙",
    difficulty: "easy",
    tags: ["github", "developer", "stats"],
    exampleInput: { url: "https://github.com/microsoft/playwright" },
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string", format: "uri", description: "GitHub repository URL" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        owner: { type: "string" },
        description: { type: "string" },
        stars: { type: "integer" },
        forks: { type: "integer" },
        open_issues: { type: "integer" },
        language: { type: "string" },
        last_commit_at: { type: "string" },
        topics: { type: "array", items: { type: "string" } },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "{{input.url}}", waitUntil: "domcontentloaded" },
      },
      {
        id: "extract",
        type: "extract",
        config: {
          strategy: "ai",
          aiPrompt: "Extract GitHub repo stats: name, owner, description, star count, fork count, open issue count, primary language, last commit relative time, and topic tags.",
          fields: ["name", "owner", "description", "stars", "forks", "open_issues", "language", "last_commit_at", "topics"],
        },
        dependsOn: ["navigate"],
      },
    ],
  },
  {
    id: "producthunt-trending",
    name: "Product Hunt Trending",
    description: "Get today's top products from Product Hunt with votes and tagline",
    category: "Tech",
    icon: "🦄",
    difficulty: "easy",
    tags: ["producthunt", "trending", "startup"],
    exampleInput: {},
    inputSchema: { type: "object", properties: {} },
    outputSchema: {
      type: "object",
      properties: {
        products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              tagline: { type: "string" },
              votes: { type: "integer" },
              url: { type: "string" },
            },
          },
        },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "https://www.producthunt.com", waitUntil: "domcontentloaded" },
      },
      {
        id: "scroll",
        type: "scroll",
        config: { distance: 2000, direction: "down" },
        dependsOn: ["navigate"],
      },
      {
        id: "extract",
        type: "extract",
        config: {
          strategy: "ai",
          aiPrompt: "Extract today's top products from Product Hunt. For each: name, tagline, vote count, and link.",
          fields: ["products"],
        },
        dependsOn: ["scroll"],
      },
    ],
  },
  {
    id: "indeed-jobs",
    name: "Indeed Job Search",
    description: "Search Indeed for jobs by keyword and location, returning title/company/salary",
    category: "Jobs",
    icon: "💼",
    difficulty: "medium",
    tags: ["jobs", "indeed", "career"],
    exampleInput: { query: "software engineer", location: "remote" },
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", description: "Job title / keywords" },
        location: { type: "string", description: "City, state, or 'remote'" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        jobs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              company: { type: "string" },
              location: { type: "string" },
              salary: { type: "string" },
              snippet: { type: "string" },
              url: { type: "string" },
            },
          },
        },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "https://www.indeed.com/jobs?q={{input.query}}&l={{input.location}}", waitUntil: "domcontentloaded" },
      },
      {
        id: "extract",
        type: "extract",
        config: {
          strategy: "ai",
          aiPrompt: "Extract the top 15 job listings from this Indeed search page. For each: title, company name, location, salary range (if shown), short snippet/summary, and link.",
          fields: ["jobs"],
        },
        dependsOn: ["navigate"],
      },
    ],
  },
  {
    id: "weather-forecast",
    name: "Weather Forecast",
    description: "Get current weather and 5-day forecast for any city via weather.com",
    category: "Utilities",
    icon: "☀️",
    difficulty: "easy",
    tags: ["weather", "forecast"],
    exampleInput: { city: "San Francisco" },
    inputSchema: {
      type: "object",
      required: ["city"],
      properties: {
        city: { type: "string", description: "City name" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        location: { type: "string" },
        current_temp: { type: "string" },
        condition: { type: "string" },
        feels_like: { type: "string" },
        humidity: { type: "string" },
        forecast: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "string" },
              high: { type: "string" },
              low: { type: "string" },
              condition: { type: "string" },
            },
          },
        },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "https://weather.com/weather/today/?q={{input.city}}", waitUntil: "domcontentloaded" },
      },
      {
        id: "extract",
        type: "extract",
        config: {
          strategy: "ai",
          aiPrompt: "Extract current weather: location name, temperature, condition (sunny/cloudy/etc), feels-like temp, humidity. Also extract 5-day forecast with day name, high, low, and condition for each.",
          fields: ["location", "current_temp", "condition", "feels_like", "humidity", "forecast"],
        },
        dependsOn: ["navigate"],
      },
    ],
  },
  {
    id: "twitter-profile",
    name: "Twitter/X Profile Stats",
    description: "Get follower count, bio, and recent tweets from a public Twitter profile",
    category: "Social Media",
    icon: "🐦",
    difficulty: "advanced",
    tags: ["twitter", "x", "social", "profile"],
    exampleInput: { handle: "elonmusk" },
    inputSchema: {
      type: "object",
      required: ["handle"],
      properties: {
        handle: { type: "string", description: "Twitter handle without @" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        handle: { type: "string" },
        bio: { type: "string" },
        followers: { type: "string" },
        following: { type: "string" },
        verified: { type: "boolean" },
        recent_tweets: {
          type: "array",
          items: { type: "object" },
        },
      },
    },
    steps: [
      {
        id: "navigate",
        type: "navigate",
        config: { url: "https://x.com/{{input.handle}}", waitUntil: "domcontentloaded" },
      },
      {
        id: "wait",
        type: "wait_for",
        config: { selector: "[data-testid=primaryColumn], main", timeout: 15000 },
        dependsOn: ["navigate"],
      },
      {
        id: "extract",
        type: "extract",
        config: {
          strategy: "ai",
          aiPrompt: "Extract Twitter profile info: display name, handle, bio, follower count, following count, verified status, and the 5 most recent tweets with their text and timestamp.",
          fields: ["name", "handle", "bio", "followers", "following", "verified", "recent_tweets"],
        },
        dependsOn: ["wait"],
      },
    ],
  },
];

export function getTemplate(id: string): WorkflowTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return TEMPLATES.filter((t) => t.category === category);
}

export function getCategories(): string[] {
  return [...new Set(TEMPLATES.map((t) => t.category))];
}
