import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabaseClient'

// This is for "Documents in Progress" table, docs that are still being ingested.

type DocsInProgressResponse = {
  documents?: { readable_filename: string }[]
  apiKey?: null
  error?: string
}

export default async function docsInProgress(
  req: NextApiRequest,
  res: NextApiResponse<DocsInProgressResponse>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const course_name = req.query.course_name as string

  try {
    const { data, error } = await supabase
      .from('documents_in_progress')
      .select('readable_filename, base_url, url')
      .eq('course_name', course_name)

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ documents: [] })
    }

    if (data && data.length > 0) {
      return res.status(200).json({ documents: data })
    }
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return res.status(500).json({
      error: (error as Error).message,
    })
  }
}
