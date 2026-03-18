export function sanitizeFilename(name: string): string {
  let sanitized = name
    .replace(/[<>:"/\\|?*\x00-\x1f\s]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return sanitized || "untitled";
}

interface ArticleInfo {
  title: string;
  author?: string;
  sourceUrl: string;
  fetchDate: Date;
}

interface PdfMetadata {
  Title: string;
  Author: string;
  Keywords: string;
  CreationDate: Date;
}

export function buildPdfMetadata(info: ArticleInfo): PdfMetadata {
  return {
    Title: info.title,
    Author: info.author || "Unknown",
    Keywords: `source:${info.sourceUrl}`,
    CreationDate: info.fetchDate,
  };
}
