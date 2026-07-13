import type { CalculatorInput } from "./vram";

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeConfig(config: CalculatorInput) {
  return toBase64(JSON.stringify(config))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function decodeConfig(
  payload: string | null,
): Partial<CalculatorInput> | null {
  if (!payload || payload.length > 8192) return null;
  try {
    const padded =
      payload.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded: unknown = JSON.parse(fromBase64(padded));
    return decoded && typeof decoded === "object" && !Array.isArray(decoded)
      ? (decoded as Partial<CalculatorInput>)
      : null;
  } catch {
    return null;
  }
}

export function configFromHash(hash: string) {
  return decodeConfig(new URLSearchParams(hash.replace(/^#/, "")).get("c"));
}

export function shareUrl(config: CalculatorInput) {
  const url = new URL(window.location.href);
  url.hash = new URLSearchParams({ c: encodeConfig(config) }).toString();
  return url.toString();
}
