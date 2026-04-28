const { canonicalizeIngredient } = require("./ingredientCatalog");

const RECEIPT_NOISE_PATTERNS = [
  /\bsubtotal\b/i,
  /\btotal\b/i,
  /\btax\b/i,
  /\bbalance\b/i,
  /\bchange\b/i,
  /\bcash\b/i,
  /\bcredit\b/i,
  /\bdebit\b/i,
  /\bvisa\b/i,
  /\bmastercard\b/i,
  /\bamex\b/i,
  /\bdiscover\b/i,
  /\bcard\b/i,
  /\bauth\b/i,
  /\bapproval\b/i,
  /\btransaction\b/i,
  /\bterminal\b/i,
  /\bregister\b/i,
  /\breceipt\b/i,
  /\binvoice\b/i,
  /\bstore\b/i,
  /\bmarket\b/i,
  /\bgrocery\b/i,
  /\bthank\b/i,
  /\bcashier\b/i,
  /\bmember\b/i,
  /\brewards\b/i,
  /\bphone\b/i,
  /\bwww\b/i,
  /\bhttp\b/i,
  /\bdate\b/i,
  /\btime\b/i,
  /\bitem\b/i,
  /\bprice\b/i
];

const FILLER_WORDS = new Set([
  "a",
  "and",
  "bag",
  "btl",
  "can",
  "ct",
  "each",
  "ea",
  "fresh",
  "gal",
  "gallon",
  "grocery",
  "large",
  "lb",
  "lbs",
  "medium",
  "oz",
  "organic",
  "org",
  "pack",
  "pkg",
  "small",
  "the",
  "whole"
]);

function titleCase(value) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function looksLikeNoise(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 2) {
    return true;
  }

  if (/^\d+$/.test(trimmed)) {
    return true;
  }

  if (/\b\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?\b/.test(trimmed)) {
    return true;
  }

  if (/\b\d{1,2}:\d{2}\b/.test(trimmed)) {
    return true;
  }

  return RECEIPT_NOISE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function stripReceiptSyntax(line) {
  return line
    .replace(/\$?\d+\.\d{2}\b/g, " ")
    .replace(/\b\d+\s*[x@]\s*/gi, " ")
    .replace(/\bqty\b/gi, " ")
    .replace(/\bsku\b/gi, " ")
    .replace(/\bupc\b/gi, " ")
    .replace(/\b\d{5,}\b/g, " ")
    .replace(/\b\d+(?:\.\d+)?\b/g, " ")
    .replace(/[#*_=+~^]/g, " ")
    .replace(/[|;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCandidate(value) {
  const cleaned = stripReceiptSyntax(value)
    .toLowerCase()
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || looksLikeNoise(cleaned)) {
    return "";
  }

  const words = cleaned
    .split(" ")
    .filter((word) => word.length > 1 && !FILLER_WORDS.has(word));

  if (words.length === 0) {
    return "";
  }

  return canonicalizeIngredient(words.join(" "));
}

function splitReceiptLine(line) {
  if (line.includes(",") || line.includes("\t")) {
    return line
      .split(/[,\t]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [line];
}

function parseReceiptText(receiptText = "") {
  if (typeof receiptText !== "string" || receiptText.trim().length === 0) {
    return [];
  }

  const candidates = [];
  const seen = new Set();

  receiptText
    .split(/\r?\n/)
    .flatMap(splitReceiptLine)
    .forEach((line) => {
      if (looksLikeNoise(line)) {
        return;
      }

      const candidate = normalizeCandidate(line);
      if (!candidate || seen.has(candidate)) {
        return;
      }

      seen.add(candidate);
      candidates.push(candidate);
    });

  return candidates;
}

function parseReceiptResponse(receiptText) {
  const ingredients = parseReceiptText(receiptText);
  return {
    ingredients,
    displayIngredients: ingredients.map(titleCase)
  };
}

module.exports = {
  normalizeCandidate,
  parseReceiptResponse,
  parseReceiptText
};
