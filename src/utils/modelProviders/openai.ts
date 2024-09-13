import { kv } from '@vercel/kv'
import { CourseMetadata } from '~/types/courseMetadata'
import { OpenAIProvider } from '~/types/LLMProvider'
import { OpenAI } from 'openai'
import { parseOpenaiKey } from '../crypto'

export const config = {
  runtime: 'edge',
}

export interface OpenAIModel {
  id: string
  name: string
  tokenLimit: number
  enabled: boolean
}

export enum OpenAIModelID {
  // GPT_o1 = 'o1-preview', // rolling model
  GPT_4o_mini = 'gpt-4o-mini', // rolling model - currently points to gpt-4o-2024-05-13
  GPT_4o = 'gpt-4o', // rolling model - currently points to gpt-4o-2024-05-13
  GPT_4 = 'gpt-4', // rolling model - currently points to gpt-4-0613
  GPT_4_Turbo = 'gpt-4-turbo', // rolling model - currently points to gpt-4-turbo-2024-04-09
  GPT_3_5 = 'gpt-3.5-turbo', // rolling model - currently points to gpt-3.5-turbo-0125

  // Azure -- ONLY GPT-4 supported for now... due to deployment param being env var...
  // This values are deployment names, not model names
  GPT_4_AZURE = 'gpt-4-128k',
  GPT_4_HACKATHON = 'gpt-4-hackathon',
  GPT_4_AZURE_04_09 = 'gpt-4-04-09',
}

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  // [OpenAIModelID.GPT_o1]: {
  //   id: OpenAIModelID.GPT_4o_mini,
  //   name: 'o1-preview',
  //   tokenLimit: 128000,
  //   enabled: false,
  // },
  [OpenAIModelID.GPT_4o_mini]: {
    id: OpenAIModelID.GPT_4o_mini,
    name: 'GPT-4o-mini',
    tokenLimit: 128000,
    enabled: false,
  },
  [OpenAIModelID.GPT_4o]: {
    id: OpenAIModelID.GPT_4o,
    name: 'GPT-4o',
    tokenLimit: 128000,
    enabled: false,
  },
  [OpenAIModelID.GPT_4_Turbo]: {
    id: OpenAIModelID.GPT_4_Turbo,
    name: 'GPT-4 Turbo',
    tokenLimit: 128000,
    enabled: false,
  },
  [OpenAIModelID.GPT_4]: {
    id: OpenAIModelID.GPT_4,
    name: 'GPT-4',
    tokenLimit: 8192,
    enabled: false,
  },
  [OpenAIModelID.GPT_3_5]: {
    id: OpenAIModelID.GPT_3_5,
    name: 'GPT-3.5',
    tokenLimit: 16385,
    enabled: false,
  },

  // ! Our hard-coded Azure implementation ONLY allows GPT-4, no other azure models on that deployment
  [OpenAIModelID.GPT_4_AZURE]: {
    id: OpenAIModelID.GPT_4_AZURE,
    name: 'GPT-4 Turbo',
    tokenLimit: 128000,
    enabled: false,
  },
  [OpenAIModelID.GPT_4_HACKATHON]: {
    id: OpenAIModelID.GPT_4_HACKATHON,
    name: 'GPT-4 Hackathon',
    tokenLimit: 128000,
    enabled: false,
  },
  [OpenAIModelID.GPT_4_AZURE_04_09]: {
    id: OpenAIModelID.GPT_4_AZURE_04_09,
    name: 'GPT-4 Turbo 0409',
    tokenLimit: 128000,
    enabled: false,
  },
}

export const getOpenAIModels = async (
  openAIProvider: OpenAIProvider,
  projectName: string,
): Promise<OpenAIProvider> => {
  try {
    delete openAIProvider.error // Remove the error property if it exists
    // Priority #1: use passed in key
    // Priority #2: use the key from the course metadata
    const { disabledModels, openaiAPIKey } = await getDisabledOpenAIModels({
      projectName,
    })

    if (!openAIProvider.apiKey) {
      // TODO: check this doesn't leak keys to client side on /chat page
      openAIProvider.apiKey = openaiAPIKey
    }

    if (!openAIProvider.apiKey || openAIProvider.apiKey === undefined) {
      openAIProvider.error = 'OpenAI API Key is not set.'
      openAIProvider.models = [] // clear any previous models.
      return openAIProvider
    }

    const client = new OpenAI({
      apiKey: openAIProvider.apiKey,
    })

    const response = await client.models.list()

    if (!response.data) {
      openAIProvider.error = `Error fetching models from OpenAI, unexpected response format. Response: ${response}`
    }

    // Iterate through the models
    const openAIModels = response.data
      .filter((model: any) => Object.values(OpenAIModelID).includes(model.id))
      .map((model: any) => {
        return {
          id: model.id,
          name: OpenAIModels[model.id as OpenAIModelID].name,
          tokenLimit: OpenAIModels[model.id as OpenAIModelID].tokenLimit,
          enabled: !disabledModels.includes(model.id),
        }
      })

    openAIProvider.models = openAIModels
    return openAIProvider
  } catch (error: any) {
    console.warn('Error fetching OpenAImodels:', error)
    openAIProvider.error = error.message
    openAIProvider.models = [] // clear any previous models.
    return openAIProvider
  }
}

type DisabledOpenAIModels = {
  disabledModels: string[]
  openaiAPIKey: string | undefined
}

const getDisabledOpenAIModels = async ({
  projectName,
}: {
  projectName: string
}): Promise<DisabledOpenAIModels> => {
  /* 
  returns just the model IDs.
  */

  const course_metadata = (await kv.hget(
    'course_metadatas',
    projectName,
  )) as CourseMetadata

  let apiKey: string | undefined = undefined
  if (course_metadata.openai_api_key) {
    apiKey = await parseOpenaiKey(course_metadata.openai_api_key)
  }

  if (course_metadata && course_metadata.disabled_models) {
    // returns just the model IDs
    return {
      disabledModels: course_metadata.disabled_models,
      openaiAPIKey: apiKey,
    }
  } else {
    // All models are enabled
    return { disabledModels: [], openaiAPIKey: apiKey }
  }
}
