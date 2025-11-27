// https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa#unicode_strings
export function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

export function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}


export function encodeUnicode(uniStr) {
    const encoded = bytesToBase64(new TextEncoder().encode(uniStr));
    return encoded
}

export function decodeUnicode(aStr) {
    const decoded = new TextDecoder().decode(base64ToBytes(aStr));
    return decoded
}

