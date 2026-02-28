import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://devtoolbox-nu.vercel.app";
  const tools = [
    "linkedin-formatter",
    "jwt-decoder",
    "xml-formatter",
    "cert-decoder",
    "csv-viewer",
    "yaml-validator",
    "yaml-formatter",
    "tone-generator",
    "wifi-qr-generator",
    "invoice-generator",
  ];

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...tools.map((tool) => ({
      url: `${baseUrl}/tools/${tool}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
