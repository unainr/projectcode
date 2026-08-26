// apps/api/src/lib/imagekit-auth.ts

async function hmacSha1Hex(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(message)
  );

  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getImageKitUploadAuth({
  privateKey,
  publicKey,
  expireInSeconds = 30 * 60,
}: {
  privateKey: string;
  publicKey: string;
  expireInSeconds?: number;
}) {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + expireInSeconds;
  const signature = await hmacSha1Hex(privateKey, token + expire);

  return { token, expire, signature, publicKey };
}




// apps/api/src/lib/imagekit-auth.ts
// ...keep your existing getImageKitUploadAuth function, add this:

export async function deleteImageKitFile({
  fileId,
  privateKey,
}: {
  fileId: string;
  privateKey: string;
}) {
  const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${btoa(`${privateKey}:`)}`,
    },
  });

  // ImageKit returns 204 on success, 404 if already deleted
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`ImageKit delete failed: ${res.status} ${body}`);
  }
}