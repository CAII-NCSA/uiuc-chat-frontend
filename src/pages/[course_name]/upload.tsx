import { type NextPage } from 'next'
import MakeNomicVisualizationPage from '~/components/UIUC-Components/MakeQueryAnalysisPage'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { CannotEditGPT4Page } from '~/components/UIUC-Components/CannotEditGPT4'
import { LoadingSpinner } from '~/components/UIUC-Components/LoadingSpinner'
import {
  LoadingPlaceholderForAdminPages,
  MainPageBackground,
} from '~/components/UIUC-Components/MainPageBackground'
import { AuthComponent } from '~/components/UIUC-Components/AuthToEditCourse'
import { fetchCourseMetadata } from '~/utils/apiUtils'
import { CourseMetadata } from '~/types/courseMetadata'
import LargeDropzone from '~/components/UIUC-Components/LargeDropzone'
import Navbar from '~/components/UIUC-Components/navbars/Navbar'
import Head from 'next/head'
import { Card, Flex, SimpleGrid, Title } from '@mantine/core'
import { montserrat_heading, montserrat_paragraph } from 'fonts'
import GlobalFooter from '~/components/UIUC-Components/GlobalFooter'
import CanvasIngestForm from '~/components/UIUC-Components/CanvasIngestForm'
import WebsiteIngestForm from '~/components/UIUC-Components/WebsiteIngestForm'
import GitHubIngestForm from '~/components/UIUC-Components/GitHubIngestForm'
import UploadNotification from '~/components/UIUC-Components/UploadNotification'
import MITIngestForm from '~/components/UIUC-Components/MITIngestForm'
import CourseraIngestForm from '~/components/UIUC-Components/CourseraIngestForm'
import SupportedFileUploadTypes from '~/components/UIUC-Components/SupportedFileUploadTypes'
import { CannotEditCourse } from '~/components/UIUC-Components/CannotEditCourse'
import { useAuth } from "react-oidc-context";

const CourseMain: NextPage = () => {
  const router = useRouter()
  const auth = useAuth()
  const [projectName, setProjectName] = useState<string | null>(null)
  const [isFetchingCourseMetadata, setIsFetchingCourseMetadata] = useState(true)
  const [metadata, setProjectMetadata] = useState<CourseMetadata | null>()

  const getCurrentPageName = () => {
    return router.query.course_name as string
  }

  useEffect(() => {
    if (!router.isReady) return
    const fetchCourseData = async () => {
      const local_course_name = getCurrentPageName()

      const metadata = await fetchCourseMetadata(local_course_name)
      if (metadata === null) {
        await router.push('/new?course_name=' + local_course_name)
        return
      }
      setProjectName(local_course_name)
      setIsFetchingCourseMetadata(false)
      setProjectMetadata(metadata)
    }
    fetchCourseData()
  }, [router.isReady])

  // Check if user has permission to edit course
  if (
    metadata?.course_owner !== auth.user?.profile.email &&
    !metadata?.course_admins.includes(getCurrentPageName())
  ) {
    router.replace(`/${getCurrentPageName()}/not_authorized`)
    return <CannotEditCourse course_name={getCurrentPageName() as string} />
  }

  // Loading state
  if (!auth.isLoading || isFetchingCourseMetadata || projectName == null) {
    return <LoadingPlaceholderForAdminPages />
  }

  // Check authentication
  if (!auth.isAuthenticated) {
    auth.signinRedirect() // Redirect to Keycloak login
    return <LoadingPlaceholderForAdminPages />
  }

  // Don't edit certain special pages
  if (
    projectName.toLowerCase() === 'gpt4' ||
    projectName.toLowerCase() === 'global' ||
    projectName.toLowerCase() === 'extreme'
  ) {
    return <CannotEditGPT4Page course_name={projectName as string} />
  }

  return (
    <>
      {' '}
      <Navbar course_name={projectName} />
      <Head>
        <title>{projectName}/upload</title>
        <meta
          name="UIUC.chat"
          content="The AI teaching assistant built for students at UIUC."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="course-page-main min-w-screen flex min-h-screen flex-col items-center">
        <div className="items-left flex w-full flex-col justify-center py-0">
          <Flex
            direction="column"
            align="center"
            w="100%"
            className="mt-8 lg:mt-4"
          ></Flex>
        </div>
        <GlobalFooter />
      </main>
    </>
  )
}

export default CourseMain
