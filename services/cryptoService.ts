// Utility functions for ArrayBuffer and Base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

// Imports a private key from JWK format
async function importPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey']
    );
}

// Imports a public key from JWK format
async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
    );
}

// Derives a shared AES-GCM key for encryption/decryption
export async function deriveSharedKey(privateKeyJwk: JsonWebKey, publicKeyJwk: JsonWebKey): Promise<CryptoKey> {
    const privateKey = await importPrivateKey(privateKeyJwk);
    const publicKey = await importPublicKey(publicKeyJwk);

    return await crypto.subtle.deriveKey(
        {
            name: 'ECDH',
            public: publicKey,
        },
        privateKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypts a message with the shared key
export async function encryptMessage(text: string, key: CryptoKey): Promise<string> {
    const encodedText = new TextEncoder().encode(text);
    // IV must be unique for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedText
    );

    // Prepend IV to ciphertext for use in decryption
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return arrayBufferToBase64(combined.buffer);
}

// Decrypts a message with the shared key
export async function decryptMessage(encryptedBase64: string, key: CryptoKey): Promise<string> {
    const combined = base64ToArrayBuffer(encryptedBase64);

    // Extract IV from the beginning of the combined buffer
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        ciphertext
    );

    return new TextDecoder().decode(decrypted);
}