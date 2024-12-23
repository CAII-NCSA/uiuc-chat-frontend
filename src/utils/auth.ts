import { jwtVerify } from 'jose'

const KEYCLOAK_PUBLIC_KEY = process.env.KEYCLOAK_PUBLIC_KEY || ''
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'master'
const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'

export async function verifyToken(token: string) {
  try {
    const publicKey = await importPublicKey(KEYCLOAK_PUBLIC_KEY)
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
    })
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

async function importPublicKey(pemKey: string) {
  // Convert PEM key to format expected by jose
  const keyData = pemKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '')
  
  const binaryKey = Buffer.from(keyData, 'base64')
  return await crypto.subtle.importKey(
    'spki',
    binaryKey,
    { name: 'RS256', hash: 'SHA-256' },
    true,
    ['verify']
  )
}