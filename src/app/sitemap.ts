import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://autonexabrasil.com.br";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/cadastro`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/precos`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/termos`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
