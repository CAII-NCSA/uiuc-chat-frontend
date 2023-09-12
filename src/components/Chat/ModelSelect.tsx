import { IconExternalLink } from '@tabler/icons-react'
import { useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { type OpenAIModel } from '@/types/openai'
import HomeContext from '~/pages/api/home/home.context'
import { ModelParams } from './ModelParams'
import { montserrat_heading } from 'fonts'
import { Input, Title } from '@mantine/core'
import Link from 'next/link'
import React from 'react'

export const ModelSelect = React.forwardRef<HTMLDivElement, any>(
  (props, ref) => {
    const {
      state: {
        selectedConversation,
        models,
        defaultModelId,
        // showModelSettings,
        prompts,
      },
      handleUpdateConversation,
      // dispatch: homeDispatch,
    } = useContext(HomeContext)

    const { t } = useTranslation('chat')

    const handleModelClick = (modelId: string) => {
      selectedConversation &&
        handleUpdateConversation(selectedConversation, {
          key: 'model',
          value: models.find((model) => model.id === modelId) as OpenAIModel,
        })
    }

    return (
      <div className="z-20 flex flex-col md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="backdrop-filter-[blur(10px)] bg-#1f1f1f dark:bg-#1f1f1f flex h-full flex-col space-y-4 rounded-lg border border-2 border-b border-[rgba(42,42,120,1)] border-neutral-200 p-4 dark:border-[rgba(42,42,120,1)] dark:border-neutral-600 md:rounded-lg md:border">
          <div
            // THIS IS THE REFERENCE we use in TopBarChat.tsx to enable the "click away" behavior
            ref={ref as any}
          >
            <div className="flex flex-col">
              <Title
                className={`pb-0 pl-2 pt-4 ${montserrat_heading.variable} font-montserratHeading`}
                order={4}
              >
                Model
              </Title>
              <Input.Description className="p-2 text-left">
                <Link
                  href="https://platform.openai.com/docs/models"
                  target="_blank"
                  className="hover:underline"
                >
                  Read about each model{' '}
                  <IconExternalLink
                    size={13}
                    style={{ position: 'relative', top: '2px' }}
                    className={'mb-2 inline'}
                  />
                </Link>
              </Input.Description>
              <div tabIndex={0} className="relative w-full">
                <select
                  className="menu absolute z-[1] w-full rounded-sm bg-base-100 shadow "
                  value={selectedConversation?.model.id || defaultModelId}
                  onChange={(e) => handleModelClick(e.target.value)}
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ paddingTop: '47px' }}>
              <ModelParams
                selectedConversation={selectedConversation}
                prompts={prompts}
                handleUpdateConversation={handleUpdateConversation}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    )
  },
)

ModelSelect.displayName = 'ModelSelect'
