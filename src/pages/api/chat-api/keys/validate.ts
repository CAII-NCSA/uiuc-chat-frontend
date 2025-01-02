// src/pages/api/chat-api/keys/validate.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '~/utils/supabaseClient'
import posthog from 'posthog-js'
import { NextRequest, NextResponse } from 'next/server'

async function verifyKeycloakToken(token: string) {
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM
  
  try {
    const response = await fetch(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Validates the provided API key and retrieves the associated user data.
 *
 * @param {string} apiKey - The API key to validate.
 * @param {string} course_name - The name of the course (currently unused).
 * @returns An object containing a boolean indicating if the API key is valid,
 *          and the user object if the key is valid.
 */
export async function validateApiKeyAndRetrieveData(
  apiKey: string,
  course_name: string,
) {
  const { data, error } = (await supabase
    .from('api_keys')
    .select('user_id')
    .eq('key', apiKey)
    .eq('is_active', true)
    .single()) as { data: { user_id: string } | null; error: Error | null }

  const isValidApiKey = !error && data !== null
  let userObject = null

  if (isValidApiKey) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info from Keycloak')
      }
      
      userObject = await response.json()

      const { error: updateError } = await supabase.rpc('increment', {
        usage: 1,
        apikey: apiKey,
      })

      if (updateError) {
        console.error('Error updating API call count:', updateError)
        throw updateError
      }

      posthog.capture('api_key_validated', {
        userId: userObject.sub, // Keycloak uses 'sub' for user ID
        apiKey: apiKey,
      })
    } catch (userError) {
      console.error('Error retrieving user object:', userError)
      posthog.capture('api_key_validation_failed', {
        userId: userObject?.sub,
        error: (userError as Error).message,
      })
      throw userError
    }
  }

  return { isValidApiKey, userObject }
}

/**
 * API route handler to validate an API key and return the associated user object.
 *
 * @param {NextApiRequest} req - The incoming HTTP request.
 * @param {NextApiResponse} res - The outgoing HTTP response.
 */
export default async function handler(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Invalid authorization header format' }, { status: 401 })
    }

    const userInfo = await verifyKeycloakToken(token)
    if (!userInfo) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const { api_key, course_name } = await req.json()

    const { isValidApiKey, userObject } = await validateApiKeyAndRetrieveData(
      api_key,
      course_name,
    )

    if (!isValidApiKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 403 })
    }

    return NextResponse.json({ userObject }, { status: 200 })
  } catch (error) {
    console.error('Error in handler:', error)
    return NextResponse.json(
      { error: 'An error occurred while validating the API key' },
      { status: 500 },
    )
  }
}
