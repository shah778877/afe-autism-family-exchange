const BLOCKED_PATTERNS = [
  /\b(?:idiot|stupid|worthless|disgusting|scum)\b/i,
  /\b(?:kill|hurt|attack|threaten)\b/i,
  /\b(?:racist|homophobic|sexist)\b/i,
];

const CONTACT_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\+?44\s?\d|0\d{2,4})[\d\s()-]{6,}/,
  /\b(?:https?:\/\/|www\.)\S+/i,
];

function normalise(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[_.*-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkPublicText(values: string[]) {
  const text = normalise(values.join(" "));
  if (BLOCKED_PATTERNS.some((pattern) => pattern.test(text))) {
    return "Please remove harmful, threatening or degrading wording.";
  }
  if (CONTACT_PATTERNS.some((pattern) => pattern.test(text))) {
    return "Keep phone numbers, email addresses and website links out of public listings.";
  }
  return null;
}
