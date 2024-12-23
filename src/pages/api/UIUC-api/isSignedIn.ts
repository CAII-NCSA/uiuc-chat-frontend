import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization token provided' })
    }

    // Extract the token
    const token = authHeader.split(' ')[1]

    // Verify token with Keycloak
    const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'master'
    
    const response = await fetch(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const userInfo = await response.json()

    return res.status(200).json({
      userId: userInfo.sub,
      authenticated: true,
      userInfo
    })

  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}