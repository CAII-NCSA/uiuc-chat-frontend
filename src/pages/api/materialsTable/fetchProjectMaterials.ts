import { supabase } from '@/utils/supabaseClient'
import { NextApiRequest, NextApiResponse } from 'next'
import { PostgrestError } from '@supabase/supabase-js'
import { CourseDocument } from '~/types/courseMaterials'

type FetchDocumentsResponse = {
  final_docs?: CourseDocument[]
  total_count?: number
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

export default async function fetchDocuments(
  req: NextApiRequest,
  res: NextApiResponse<FetchDocumentsResponse>
) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  try {
    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Missing token' })
    }
    const userInfo = await verifyKeycloakToken(token)
    
    if (!userInfo) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Now we can use userInfo.sub as the user ID
    const { data: documents, error, count } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      // Add any filters based on user permissions
      .eq('user_id', userInfo.sub)

    if (error) throw error

    return res.status(200).json({
      final_docs: documents,
      total_count: count ?? undefined
    })

  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return res.status(500).json({ error: (error as PostgrestError).message })
  }
}