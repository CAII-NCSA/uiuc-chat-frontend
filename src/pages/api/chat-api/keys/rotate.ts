import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

type ApiResponse = {
  message?: string
  newApiKey?: string
  error?: string
}

/**
 * API handler to rotate an API key for a user.
 * Uses Keycloak authentication via React OIDC Context.
 */
export default async function rotateKey(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the bearer token from authorization header
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }
    const token = authHeader.split(' ')[1]

    // Verify token with Keycloak
    const keycloakConfig = {
      url: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID
    }
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' })
    }
    // Validate token and get user info
    const userInfo = await validateToken(token, keycloakConfig)
    const userId = userInfo.sub // Keycloak user ID

    // Retrieve existing API key
    const { data: existingKey, error: existingKeyError } = await supabase
      .from('api_keys')
      .select('key')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (existingKeyError) {
      console.error('Error retrieving existing API key:', existingKeyError)
      return res.status(500).json({ error: existingKeyError.message })
    }

    if (!existingKey || existingKey.length === 0) {
      return res.status(404).json({
        error: 'API key not found for user, please generate one!'
      })
    }

    // Generate new API key
    const rawApiKey = uuidv4()
    const newApiKey = `uc_${rawApiKey.replace(/-/g, '')}`

    // Update API key in database
    const { error } = await supabase
      .from('api_keys')
      .update({ key: newApiKey, is_active: true, modified_at: new Date() })
      .match({ user_id: userId })

    if (error) {
      console.error('Error updating API key:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      message: 'API key rotated successfully',
      newApiKey
    })

  } catch (error) {
    console.error('Error rotating API key:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

interface KeycloakTokenPayload {
  sub: string;
  // add other expected token fields as needed
}

// Update the function signature
async function validateToken(token: string, config: any): Promise<KeycloakTokenPayload> {
  // Implementation here
  throw new Error('Token validation not implemented')
}