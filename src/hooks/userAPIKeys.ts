import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { kv } from '@vercel/kv'
import { CourseMetadata } from '~/types/courseMetadata'
import { AllLLMProviders, LLMProvider } from '~/types/LLMProvider'

export function useGetProjectLLMProviders(course_name: string) {
  // USAGE:
  // const {
  //   data: projectLLMProviders,
  //   isLoading: isLoadingprojectLLMProviders,
  //   isError: isErrorprojectLLMProviders,
  //   refetch: refetchprojectLLMProviders,
  // } = useGetProjectLLMProviders(course_name)

  return useQuery({
    queryKey: ['projectLLMProviders'],
    queryFn: async () => {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: course_name,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch LLM providers')
      }

      const data = await response.json()
      return data as AllLLMProviders
    },
  })
}

export function useSetProjectLLMProviders(
  course_name: string,
  queryClient: QueryClient,
  llmProviders: AllLLMProviders,
) {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/llmProviders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'setLLMProviders',
          courseName: course_name,
          llmProviders: llmProviders,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to set LLM providers')
      }
      return response.json()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['projectLLMProviders'],
      })
      const previousLLMProviders = queryClient.getQueryData([
        'projectLLMProviders',
      ])
      queryClient.setQueryData(['projectLLMProviders'], llmProviders)
      return { previousLLMProviders }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['projectLLMProviders'],
        context?.previousLLMProviders,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['projectLLMProviders'],
      })
    },
  })
}
