import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabaseClient'

type DocsInProgressResponse = {
  documents?: { readable_filename: string }[]
  error?: string
}

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

export default async function docsInProgress(
  req: NextApiRequest,
  res: NextApiResponse<DocsInProgressResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const course_name = req.query.course_name as string
  if (!course_name) {
    return res.status(400).json({ error: 'Course name is required' })
  }

  try {
    // Verify the token
    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization header format' })
    }
    const userInfo = await verifyKeycloakToken(token)
    
    if (!userInfo) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const { data, error } = await supabase
      .from('documents_in_progress')
      .select('readable_filename')
      .eq('course_name', course_name)

    if (error) {
      throw error
    }

    return res.status(200).json({ 
      documents: data || [] 
    })

  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return res.status(500).json({
      error: (error as Error).message
    })
  }
}