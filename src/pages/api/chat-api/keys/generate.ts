// src/pages/api/chat-api/keys/generate.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import posthog from 'posthog-js'

interface KeycloakTokenPayload {
  sub: string;
  // add other expected token fields
}

type ApiResponse = {
  message?: string
  apiKey?: string
  error?: string
}

/**
 * API endpoint to generate a unique API key for a user.
 * The endpoint checks if the user is authenticated and if a key already exists for the user.
 * If not, it generates a new API key, stores it, and returns it to the user.
 *
 * @param {NextApiRequest} req - The incoming API request.
 * @param {NextApiResponse} res - The outgoing API response.
 * @returns {Promise<void>} The response with the API key or an error message.
 */
export default async function generateKey(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Ensure the request is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get and validate token
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }
    
    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' })
    }

    // Validate token with Keycloak
    const userInfo = await validateToken(token, {
      url: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID
    })
    
    const userId = userInfo.sub

    // Check for existing key
    const { data: keys, error: existingKeyError } = await supabase
      .from('api_keys')
      .select('key, is_active')
      .eq('user_id', userId)

    if (existingKeyError) throw existingKeyError
    if (keys.length > 0 && keys[0]?.is_active) {
      return res.status(409).json({ error: 'User already has an API key' })
    }

    // Generate new key
    const apiKey = `uc_${uuidv4().replace(/-/g, '')}`

    // Insert or update key
    const { error } = keys.length === 0
      ? await supabase
          .from('api_keys')
          .insert([{ user_id: userId, key: apiKey, is_active: true }])
      : await supabase
          .from('api_keys')
          .update({ key: apiKey, is_active: true })
          .match({ user_id: userId })

    if (error) throw error

    return res.status(200).json({
      message: 'API key generated successfully',
      apiKey,
    })

  } catch (error) {
    console.error('Error generating API key:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function validateToken(token: string, config: any): Promise<KeycloakTokenPayload> {
  // Implement token validation with Keycloak
  throw new Error('Token validation not implemented')
}