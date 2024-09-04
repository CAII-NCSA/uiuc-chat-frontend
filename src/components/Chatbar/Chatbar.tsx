import { useState, useCallback, useContext, useEffect, Suspense } from 'react'
import { useTranslation } from 'next-i18next'
import { useCreateReducer } from '@/hooks/useCreateReducer'
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const'
import { exportData } from '@/utils/app/importExport'
import { Conversation } from '@/types/chat'
import { OpenAIModels } from '~/utils/modelProviders/openai'
import HomeContext from '~/pages/api/home/home.context'
import { ChatFolders } from './components/ChatFolders'
import { ChatbarSettings } from './components/ChatbarSettings'
import { Conversations } from './components/Conversations'
import Sidebar from '../Sidebar'
import ChatbarContext from './Chatbar.context'
import { ChatbarInitialState, initialState } from './Chatbar.state'
import { v4 as uuidv4 } from 'uuid'
import router from 'next/router'
import { useQueryClient } from '@tanstack/react-query'
import {
  useDeleteConversation,
  useFetchConversationHistory,
  useUpdateConversation,
} from '~/hooks/conversationQueries'
import { AnimatePresence, motion } from 'framer-motion'
import { LoadingSpinner } from '../UIUC-Components/LoadingSpinner'

export const Chatbar = ({
  current_email,
  courseName,
}: {
  current_email: string
  courseName: string
}) => {
  const { t } = useTranslation('sidebar')
  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  })

  const {
    state: { conversations, showChatbar, defaultModelId, folders },
    dispatch: homeDispatch,
    handleCreateFolder,
    handleNewConversation,
    handleUpdateConversation,
  } = useContext(HomeContext)

  const {
    state: { searchTerm, filteredConversations },
    dispatch: chatDispatch,
  } = chatBarContextValue

  const queryClient = useQueryClient()
  const deleteConversationMutation = useDeleteConversation(
    current_email,
    queryClient,
    courseName,
    searchTerm,
  )

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      homeDispatch({ field: 'apiKey', value: apiKey })
      localStorage.setItem('apiKey', apiKey)
    },
    [homeDispatch],
  )

  const {
    data: conversationHistory,
    error: conversationHistoryError,
    isLoading: isConversationHistoryLoading,
    isFetched: isConversationHistoryFetched,
    fetchNextPage: fetchNextPageConversationHistory,
    hasNextPage: hasNextPageConversationHistory,
    isFetchingNextPage: isFetchingNextPageConversationHistory,
  } = useFetchConversationHistory(current_email, searchTerm, courseName)

  const updateConversationMutation = useUpdateConversation(
    current_email as string,
    queryClient,
    courseName,
  )

  useEffect(() => {
    if (
      isConversationHistoryFetched &&
      !isConversationHistoryLoading &&
      conversationHistory
    ) {
      const allConversations = conversationHistory.pages
        .flatMap((page) => (Array.isArray(page) ? page : []))
        .filter((conversation) => conversation !== undefined)
      homeDispatch({ field: 'conversations', value: allConversations })
      console.log('Dispatching conversations: ', allConversations)
    }
  }, [
    conversationHistory,
    isConversationHistoryFetched,
    isConversationHistoryLoading,
    homeDispatch,
  ])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      e.currentTarget.clientHeight + 100
    if (
      bottom &&
      hasNextPageConversationHistory &&
      !isFetchingNextPageConversationHistory
    ) {
      fetchNextPageConversationHistory()
    }
  }

  const handleExportData = () => {
    exportData()
  }

  const handleClearConversations = () => {
    defaultModelId &&
      homeDispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: DEFAULT_TEMPERATURE,
          folderId: null,
        },
      })

    homeDispatch({ field: 'conversations', value: [] })
    localStorage.removeItem('conversationHistory')
    localStorage.removeItem('selectedConversation')

    const updatedFolders = folders.filter((f) => f.type !== 'chat')
    homeDispatch({ field: 'folders', value: updatedFolders })
  }

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id,
    )
    homeDispatch({ field: 'conversations', value: updatedConversations })
    chatDispatch({ field: 'searchTerm', value: '' })

    if (updatedConversations.length > 0) {
      const lastConversation = updatedConversations[0]
      if (lastConversation) {
        homeDispatch({ field: 'selectedConversation', value: lastConversation })
        deleteConversationMutation.mutate(conversation)
      }
    } else {
      defaultModelId &&
        homeDispatch({
          field: 'selectedConversation',
          value: {
            id: uuidv4(),
            name: t('New Conversation'),
            messages: [],
            model: OpenAIModels[defaultModelId],
            prompt: DEFAULT_SYSTEM_PROMPT,
            temperature: DEFAULT_TEMPERATURE,
            folderId: null,
          },
        })
      localStorage.removeItem('selectedConversation')
    }
  }

  const handleToggleChatbar = () => {
    homeDispatch({ field: 'showChatbar', value: !showChatbar })
    localStorage.setItem('showChatbar', JSON.stringify(!showChatbar))
  }

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'))
      handleUpdateConversation(conversation, { key: 'folderId', value: null })
      chatDispatch({ field: 'searchTerm', value: '' })
      e.target.style.background = 'none'
    }
  }

  return (
    <ChatbarContext.Provider
      value={{
        ...chatBarContextValue,
        handleDeleteConversation,
        handleClearConversations,
        handleExportData,
        handleApiKeyChange,
      }}
    >
      <Sidebar<Conversation>
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        itemComponent={
          <Suspense
            fallback={
              <div>
                Loading... <LoadingSpinner size="sm" />
              </div>
            }
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Conversations conversations={conversations} />
              <AnimatePresence>
                {isFetchingNextPageConversationHistory && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center py-4"
                  >
                    <LoadingSpinner size="sm" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Suspense>
        }
        folderComponent={<ChatFolders searchTerm={searchTerm} />}
        folders={folders}
        items={conversations}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          chatDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewConversation}
        handleCreateFolder={() => handleCreateFolder(t('New folder'), 'chat')}
        handleDrop={handleDrop}
        footerComponent={<ChatbarSettings />}
        onScroll={handleScroll}
      />
    </ChatbarContext.Provider>
  )
}
