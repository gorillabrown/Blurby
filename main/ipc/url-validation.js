function validateHttpHttpsUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { error: "Only http/https URLs are allowed." };
    }
    return { parsed };
  } catch {
    return { error: "Only http/https URLs are allowed." };
  }
}

module.exports = { validateHttpHttpsUrl };
