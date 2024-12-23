import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAuth } from 'react-oidc-context'; 
import { CanViewOnlyCourse } from '~/components/UIUC-Components/CanViewOnlyCourse'
import { CannotViewCourse } from '~/components/UIUC-Components/CannotViewCourse'
import { LoadingSpinner } from '~/components/UIUC-Components/LoadingSpinner'
import { MainPageBackground } from '~/components/UIUC-Components/MainPageBackground'
import { get_user_permission } from '~/components/UIUC-Components/runAuthCheck'
import { CourseMetadata } from '~/types/courseMetadata'

const NotAuthorizedPage: NextPage = () => {
  const router = useRouter()
  // Replace Clerk with OIDC auth
  const { user, isLoading, isAuthenticated } = useAuth()
  const [componentToRender, setComponentToRender] = useState<React.ReactNode | null>(null)

  const getCurrentPageName = () => {
    return router.asPath.slice(1).split('/')[0] as string
  }

  useEffect(() => {
    // Update loading check
    if (isLoading || !router.isReady) {
      return
    }
    const course_name = getCurrentPageName()

    async function fetchCourseMetadata(course_name: string) {
      try {
        const response = await fetch(
          `/api/UIUC-api/getCourseMetadata?course_name=${course_name}`,
          {
            headers: {
              // Add authorization header if needed
              ...(user?.access_token && {
                Authorization: `Bearer ${user.access_token}`
              })
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.success === false) {
            console.error('An error occurred while fetching course metadata')
            return null
          }
          return data.course_metadata
        } else {
          console.error(`Error fetching course metadata: ${response.status}`)
          return null
        }
      } catch (error) {
        console.error('Error fetching course metadata:', error)
        return null
      }
    }

    fetchCourseMetadata(course_name).then((courseMetadata) => {
      if (courseMetadata == null) {
        console.log('Course does not exist, redirecting to materials page')
        router.replace(`/${course_name}/dashboard`)
        return
      }

      // Update authentication check
      if (courseMetadata.is_private && !isAuthenticated) {
        console.log('User not logged in')
        router.replace(`/login?redirect=${course_name}`)
        return
      }

      // Update user loaded check
      if (!isLoading) {
        if (courseMetadata != null) {
          const permission_str = get_user_permission(
            courseMetadata,
            user, // You'll need to update the get_user_permission function to work with OIDC user
            router,
          )

          if (permission_str == 'edit') {
            router.push(`/${course_name}/dashboard`)
          } else if (permission_str == 'view') {
            setComponentToRender(
              <CanViewOnlyCourse
                course_name={course_name}
                course_metadata={courseMetadata as CourseMetadata}
              />,
            )
          } else {
            setComponentToRender(<CannotViewCourse course_name={course_name} />)
          }
        } else {
          router.push(`/${course_name}/dashboard`)
        }
      }
    })
  }, [isLoading, router.isReady, user, isAuthenticated])

  // Update loading check
  if (isLoading || !componentToRender) {
    return (
      <MainPageBackground>
        <LoadingSpinner />
      </MainPageBackground>
    )
  }

  return <>{componentToRender}</>
}

export default NotAuthorizedPage