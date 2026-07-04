import { Product } from "./types";

export const products: Product[] = [
  {
    id: "netflix",
    name: "Netflix",
    slug: "netflix",
    description: "Stream movies, TV shows, documentaries & more",
    longDescription:
      "Get access to Netflix premium subscription with unlimited streaming of movies, TV series, documentaries and more on any device. Enjoy HD and 4K content with no ads.",
    icon: "🎬",
    gradient: "from-red-500 to-red-700",
    category: "Streaming",
    plans: [
      {
        id: "netflix-basic",
        name: "Basic",
        duration: "1 Month",
        price: 5,
        currency: "USD",
      },
      {
        id: "netflix-standard",
        name: "Standard",
        duration: "1 Month",
        price: 10,
        currency: "USD",
      },
      {
        id: "netflix-premium",
        name: "Premium",
        duration: "1 Month",
        price: 15,
        currency: "USD",
      },
    ],
    features: [
      "HD & 4K streaming",
      "Watch on multiple screens",
      "Download & watch offline",
      "Ad-free experience",
    ],
  },
  {
    id: "spotify",
    name: "Spotify Premium",
    slug: "spotify",
    description: "Ad-free music streaming with offline downloads",
    longDescription:
      "Enjoy Spotify Premium with ad-free music, offline downloads, and unlimited skips. Listen to millions of songs and podcasts anywhere.",
    icon: "🎵",
    gradient: "from-green-500 to-green-700",
    category: "Music",
    plans: [
      {
        id: "spotify-individual",
        name: "Individual",
        duration: "1 Month",
        price: 5,
        currency: "USD",
      },
      {
        id: "spotify-duo",
        name: "Duo",
        duration: "1 Month",
        price: 8,
        currency: "USD",
      },
      {
        id: "spotify-family",
        name: "Family",
        duration: "1 Month",
        price: 12,
        currency: "USD",
      },
    ],
    features: [
      "Ad-free listening",
      "Offline downloads",
      "Unlimited skips",
      "High quality audio",
    ],
  },
  {
    id: "apple-music",
    name: "Apple Music",
    slug: "apple-music",
    description: "Stream 100M+ songs with spatial audio",
    longDescription:
      "Access Apple Music with over 100 million songs, curated playlists, and spatial audio with Dolby Atmos. Listen across all your devices.",
    icon: "🎧",
    gradient: "from-pink-500 to-rose-600",
    category: "Music",
    plans: [
      {
        id: "apple-music-individual",
        name: "Individual",
        duration: "1 Month",
        price: 5,
        currency: "USD",
      },
      {
        id: "apple-music-family",
        name: "Family",
        duration: "1 Month",
        price: 9,
        currency: "USD",
      },
    ],
    features: [
      "100M+ songs",
      "Spatial Audio with Dolby Atmos",
      "Offline listening",
      "Music videos",
    ],
  },
  {
    id: "snapchat-plus",
    name: "Snapchat+",
    slug: "snapchat-plus",
    description: "Exclusive Snapchat features & early access",
    longDescription:
      "Get Snapchat+ for exclusive features, custom app icons, story rewatch indicators, priority support, and early access to new features.",
    icon: "👻",
    gradient: "from-yellow-400 to-yellow-600",
    category: "Social Media",
    plans: [
      {
        id: "snapchat-monthly",
        name: "Monthly",
        duration: "1 Month",
        price: 4,
        currency: "USD",
      },
      {
        id: "snapchat-yearly",
        name: "Annual",
        duration: "1 Year",
        price: 40,
        currency: "USD",
      },
    ],
    features: [
      "Custom app icons",
      "Story rewatch indicator",
      "Best Friends Forever pin",
      "Priority support",
    ],
  },
  {
    id: "amazon-prime",
    name: "Amazon Prime",
    slug: "amazon-prime",
    description: "Video streaming, free shipping & more",
    longDescription:
      "Amazon Prime gives you access to Prime Video, free shipping, Prime Music, Prime Reading, and exclusive deals. Entertainment and shopping in one subscription.",
    icon: "📦",
    gradient: "from-blue-500 to-blue-700",
    category: "Streaming",
    plans: [
      {
        id: "prime-monthly",
        name: "Monthly",
        duration: "1 Month",
        price: 8,
        currency: "USD",
      },
      {
        id: "prime-yearly",
        name: "Annual",
        duration: "1 Year",
        price: 80,
        currency: "USD",
      },
    ],
    features: [
      "Prime Video streaming",
      "Free & fast shipping",
      "Prime Music",
      "Exclusive deals",
    ],
  },
  {
    id: "icloud",
    name: "iCloud Storage",
    slug: "icloud",
    description: "Secure cloud storage for all your Apple devices",
    longDescription:
      "Expand your iCloud storage to keep all your photos, files, and backups safe. Share storage with your family and access everything across all Apple devices.",
    icon: "☁️",
    gradient: "from-sky-400 to-blue-600",
    category: "Storage",
    plans: [
      {
        id: "icloud-50gb",
        name: "50 GB",
        duration: "1 Month",
        price: 1,
        currency: "USD",
      },
      {
        id: "icloud-200gb",
        name: "200 GB",
        duration: "1 Month",
        price: 3,
        currency: "USD",
      },
      {
        id: "icloud-2tb",
        name: "2 TB",
        duration: "1 Month",
        price: 10,
        currency: "USD",
      },
    ],
    features: [
      "Secure cloud storage",
      "Automatic backups",
      "Family sharing",
      "Access on all devices",
    ],
  },
  {
    id: "vpn",
    name: "VPN Premium",
    slug: "vpn",
    description: "Secure & private internet browsing worldwide",
    longDescription:
      "Stay safe online with a premium VPN subscription. Browse privately, access geo-restricted content, and protect your data on public WiFi networks.",
    icon: "🔒",
    gradient: "from-purple-500 to-indigo-700",
    category: "Security",
    plans: [
      {
        id: "vpn-monthly",
        name: "Monthly",
        duration: "1 Month",
        price: 5,
        currency: "USD",
      },
      {
        id: "vpn-6month",
        name: "6 Months",
        duration: "6 Months",
        price: 25,
        currency: "USD",
      },
      {
        id: "vpn-yearly",
        name: "Annual",
        duration: "1 Year",
        price: 40,
        currency: "USD",
      },
    ],
    features: [
      "Military-grade encryption",
      "5000+ servers worldwide",
      "No-logs policy",
      "Connect up to 6 devices",
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategories(): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}
