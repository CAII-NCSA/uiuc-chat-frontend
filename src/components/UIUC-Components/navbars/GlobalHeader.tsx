import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import {
  IconCirclePlus,
  IconClipboardText,
  IconFile,
  IconNews,
  IconPlus,
  IconSquareRoundedPlus,
} from '@tabler/icons-react'
import { Menu2 } from 'tabler-icons-react'

// import MagicBell, {
//   FloatingNotificationInbox,
// } from '@magicbell/magicbell-react'

export default function Header({ isNavbar = false }: { isNavbar?: boolean }) {
  const headerStyle = isNavbar
    ? {
        // backgroundColor: 'var(--background)', //illinois-blue -- this caused horrible white background on clerk icon
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '0.2em 0.2em',
      }
    : {
        // backgroundColor: 'var(--background)', //illinois-blue -- this caused horrible white background on clerk icon
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '0.5em',
      }

  const clerk_obj = useUser()
  const posthog = usePostHog()
  const [userEmail, setUserEmail] = useState('no_email')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (clerk_obj.isLoaded) {
      if (clerk_obj.isSignedIn) {
        const emails = extractEmailsFromClerk(clerk_obj.user)
        setUserEmail(emails[0] || 'no_email')

        // Posthog identify
        posthog?.identify(clerk_obj.user.id, {
          email: emails[0] || 'no_email',
        })
      }
      setIsLoaded(true)
    } else {
      // console.debug('NOT LOADED OR SIGNED IN')
    }
  }, [clerk_obj.isLoaded])

  if (!isLoaded) {
    return (
      <header style={headerStyle} className="py-16">
        {/* Skeleton placeholders for two icons */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div
            className="skeleton-box"
            style={{ width: '35px', height: '35px', borderRadius: '50%' }}
          ></div>
          <div style={{ paddingLeft: '0px', paddingRight: '10px' }} />
          <div
            className="skeleton-box"
            style={{ width: '35px', height: '35px', borderRadius: '50%' }}
          ></div>
        </div>
      </header>
    )
  }

  return (
    <header style={headerStyle} className="py-16">
      <SignedIn>
        <div style={{ paddingLeft: '0px', paddingRight: '10px' }}></div>
        {/* Mount the UserButton component */}
        <UserButton />
      </SignedIn>
      <SignedOut>
        {/* Signed out users get sign in button */}
        <SignInButton />
      </SignedOut>
    </header>
  )
}

import Link from 'next/link'
import { montserrat_heading } from 'fonts'
import { createStyles, Group, rem } from '@mantine/core'
import { extractEmailsFromClerk } from '../clerkHelpers'
import { useEffect, useState, useCallback, useRef } from 'react'
import { usePostHog } from 'posthog-js/react'
import { IconFilePlus } from '@tabler/icons-react'

export function LandingPageHeader({
  forGeneralPurposeNotLandingpage = false,
}: {
  forGeneralPurposeNotLandingpage?: boolean
}) {
  const { classes, theme } = useStyles()
  const headerStyle = forGeneralPurposeNotLandingpage
    ? {
        backgroundColor: 'var(--background)', //illinois-blue
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '0.2em 0.2em',
        //      paddingRight: '0.3em', //why?
      }
    : {
        backgroundColor: 'var(--background)', //illinois-blue
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '0.5em',
      }

  const headerRef = useRef<HTMLElement>(null)
  const clerk_obj = useUser()
  const [userEmail, setUserEmail] = useState('no_email')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(60)
  const posthog = usePostHog()
  const [menuVisible, setMenuVisible] = useState(false)
  const menuButtonRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState({ right: '20px' })

  // Determine which elements should be visible based on screen width
  const showDocsInNav = windowWidth >= 768
  const showNewsInNav = windowWidth >= 900
  const showNewProjectInNav = windowWidth >= 1024

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Initial width
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (clerk_obj.isLoaded) {
      if (clerk_obj.isSignedIn) {
        const emails = extractEmailsFromClerk(clerk_obj.user)
        setUserEmail(emails[0] || 'no_email')

        // Posthog identify
        posthog?.identify(clerk_obj.user.id, {
          email: emails[0] || 'no_email',
        })
      }
      setIsLoaded(true)
    } else {
      // console.debug('NOT LOADED OR SIGNED IN')
    }
  }, [clerk_obj.isLoaded])

  // Update header height on mount and window resize
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight)
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [isLoaded])

  // Toggle menu with animation
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling

    if (isMenuOpen) {
      // First set menuVisible to false (which will trigger fade out animation)
      setMenuVisible(false)
      // Then after animation completes, actually close the menu
      setTimeout(() => {
        setIsMenuOpen(false)
      }, 300) // Match animation duration
    } else {
      setIsMenuOpen(true)
      // Small delay to ensure DOM is updated before animation starts
      setTimeout(() => {
        setMenuVisible(true)
      }, 10)
    }
  }

  // Update menuVisible when isMenuOpen changes directly (edge case handling)
  useEffect(() => {
    if (isMenuOpen) {
      const timer = setTimeout(() => {
        setMenuVisible(true)
      }, 10)
      return () => clearTimeout(timer)
    }
  }, [isMenuOpen])

  // Modify this effect to only reset the menu when ALL nav items are visible
  useEffect(() => {
    if (showDocsInNav && showNewsInNav && showNewProjectInNav) {
      setIsMenuOpen(false)
      setMenuVisible(false)
    }
  }, [windowWidth, showDocsInNav, showNewsInNav, showNewProjectInNav])

  // Handle link click to close menu
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling

    // First set menuVisible to false (which will trigger fade out animation)
    setMenuVisible(false)
    // Then after animation completes, actually close the menu
    setTimeout(() => {
      setIsMenuOpen(false)
    }, 300) // Match animation duration
  }

  // Update menu position based on hamburger button position
  useEffect(() => {
    const updateMenuPosition = () => {
      if (menuButtonRef.current) {
        const rect = menuButtonRef.current.getBoundingClientRect()
        // Set the right position to align with the right edge of the viewport
        const rightPosition = window.innerWidth - rect.right
        setMenuPosition({ right: `${rightPosition}px` })
      }
    }

    // Update initially and whenever the menu is opened
    if (isMenuOpen) {
      updateMenuPosition()
    }

    window.addEventListener('resize', updateMenuPosition)
    return () => window.removeEventListener('resize', updateMenuPosition)
  }, [isMenuOpen])

  if (!isLoaded) {
    return (
      <header style={headerStyle} className="py-16">
        {/* Skeleton placeholders for two icons */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {forGeneralPurposeNotLandingpage === false && (
            <>
              <Link href="/new" className={classes.link}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <IconFilePlus
                    size={20}
                    strokeWidth={2}
                    style={{ marginRight: '5px' }}
                  />
                  <span
                    className={`${montserrat_heading.variable} font-montserratHeading`}
                  >
                    New project
                  </span>
                </span>
              </Link>
              <Link
                href="https://docs.uiuc.chat/"
                className={classes.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <IconClipboardTexts />
                  <span
                    className={`${montserrat_heading.variable} font-montserratHeading`}
                  >
                    Docs
                  </span>
                </span>
              </Link>
            </>
          )}
          <div
            className="skeleton-box"
            style={{ width: '35px', height: '35px', borderRadius: '50%' }}
          ></div>
          <div style={{ paddingLeft: '0px', paddingRight: '10px' }} />
          <div
            className="skeleton-box"
            style={{ width: '35px', height: '35px', borderRadius: '50%' }}
          ></div>
        </div>
      </header>
    )
  }

  return (
    <header style={headerStyle} ref={headerRef}>
      <div className="flex-end m-auto flex w-full max-w-5xl flex-wrap items-center gap-2 sm:flex-nowrap">
        <div
          className={`relative flex grow items-center gap-1 font-bold ${montserrat_heading.variable} font-montserratHeading`}
        >
          <div style={{ width: '1.95rem', height: '1.95rem' }}>
            <img
              src="/media/logo_illinois.png"
              width="auto"
              height="100%"
            ></img>
          </div>
          <div className="text-[var(--illinois-orange)] sm:ml-4">Illinois</div>
          <div className="text-[var(--illinois-blue)]">Chat</div>
        </div>

        {/* Navigation links on desktop */}
        <div className="hidden sm:flex sm:flex-row sm:items-center sm:gap-3">
          {forGeneralPurposeNotLandingpage === false && (
            <>
              {showDocsInNav && (
                <Link
                  href="https://docs.uiuc.chat/"
                  className={classes.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex items-center">
                    <IconClipboardText
                      size={18}
                      strokeWidth={2}
                      style={{
                        marginRight: '8px',
                        color: 'var(--illinois-orange)',
                      }}
                    />
                    <span
                      className={`${montserrat_heading.variable} font-montserratHeading`}
                      style={{ color: 'var(--illinois-orange)' }}
                    >
                      Docs
                    </span>
                  </span>
                </Link>
              )}

              {showNewsInNav && (
                <Link
                  href="http://news.uiuc.chat/"
                  target="_blank"
                  className={classes.link}
                >
                  <span className="flex items-center">
                    <IconNews
                      size={18}
                      strokeWidth={2}
                      style={{
                        marginRight: '8px',
                        color: 'var(--illinois-orange)',
                      }}
                    />
                    <span
                      className={`${montserrat_heading.variable} font-montserratHeading`}
                      style={{ color: 'var(--illinois-orange)' }}
                    >
                      News
                    </span>
                  </span>
                </Link>
              )}

              {showNewProjectInNav && (
                <Link href="/new" className={classes.link}>
                  <span className="flex items-center">
                    <IconPlus
                      size={18}
                      strokeWidth={2}
                      style={{
                        marginRight: '8px',
                        color: 'var(--illinois-orange)',
                      }}
                    />
                    <span
                      className={`${montserrat_heading.variable} font-montserratHeading`}
                      style={{ color: 'var(--illinois-orange)' }}
                    >
                      New Project
                    </span>
                  </span>
                </Link>
              )}
            </>
          )}
        </div>

        {/* Login/User button and hamburger menu on mobile */}
        <div className="flex items-center gap-3">
          {/* Login/User button - always visible */}
          <div className="order-1">
            <SignedIn>
              <div className="pl-1 pr-2">
                <UserButton />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className={classes.link}>
                  <span
                    className={`${montserrat_heading.variable} font-montserratHeading`}
                  >
                    Login / Signup
                  </span>
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Hamburger menu for small screens */}
          {(!showDocsInNav || !showNewsInNav || !showNewProjectInNav) &&
            forGeneralPurposeNotLandingpage === false && (
              <div
                className={`${classes.menuIcon} order-2`}
                onClick={(e) => toggleMenu(e)}
                ref={menuButtonRef}
              >
                <Menu2
                  size={24}
                  strokeWidth={2}
                  color="var(--illinois-orange)"
                />
              </div>
            )}
        </div>

        {/* Mobile dropdown menu with animation */}
        {isMenuOpen && (
          <div
            className="fixed z-50"
            style={{
              top: `${headerHeight + 30}px`,
              right: menuPosition.right,
            }}
          >
            <div
              className={`dropdown-menu ${menuVisible ? 'menu-visible' : 'menu-hidden'}`}
            >
              {/* Menu pointer triangle */}
              <div className="menu-pointer"></div>

              {forGeneralPurposeNotLandingpage === false && (
                <div className="flex flex-col p-1">
                  {!showDocsInNav && (
                    <Link
                      href="https://docs.uiuc.chat/"
                      className="menu-item"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleLinkClick(e)}
                    >
                      <div className="menu-item-content flex items-center">
                        <IconClipboardText
                          size={18}
                          strokeWidth={2}
                          style={{
                            marginRight: '8px',
                            color: 'var(--illinois-orange)',
                          }}
                        />
                        <span
                          className={`${montserrat_heading.variable} font-montserratHeading`}
                          style={{ color: 'var(--illinois-orange)' }}
                        >
                          Docs
                        </span>
                      </div>
                    </Link>
                  )}

                  {!showNewsInNav && (
                    <Link
                      href="http://news.uiuc.chat/"
                      className="menu-item"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleLinkClick(e)}
                    >
                      <div className="menu-item-content flex items-center">
                        <IconNews
                          size={18}
                          strokeWidth={2}
                          style={{
                            marginRight: '8px',
                            color: 'var(--illinois-orange)',
                          }}
                        />
                        <span
                          className={`${montserrat_heading.variable} font-montserratHeading`}
                          style={{ color: 'var(--illinois-orange)' }}
                        >
                          News
                        </span>
                      </div>
                    </Link>
                  )}

                  {!showNewProjectInNav && (
                    <Link
                      href="/new"
                      className="menu-item"
                      onClick={(e) => handleLinkClick(e)}
                    >
                      <div className="menu-item-content flex items-center">
                        <IconPlus
                          size={18}
                          strokeWidth={2}
                          style={{
                            marginRight: '8px',
                            color: 'var(--illinois-orange)',
                          }}
                        />
                        <span
                          className={`${montserrat_heading.variable} font-montserratHeading`}
                          style={{ color: 'var(--illinois-orange)' }}
                        >
                          New Project
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Click outside to close menu */}
            <div
              className="fixed inset-0 z-[-1]"
              onClick={(e) => {
                e.stopPropagation()
                handleLinkClick(e)
              }}
            />
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes menuSlideDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes menuSlideUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-10px);
            opacity: 0;
          }
        }

        .dropdown-menu {
          transform-origin: top center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-radius: 0.375rem;
          background-color: white;
          border: 1px solid var(--illinois-orange);
          min-width: 160px;
          overflow: hidden;
          margin-top: 10px;
          position: relative;
        }

        .menu-pointer {
          position: absolute;
          top: -8px;
          right: 10px;
          width: 16px;
          height: 8px;
          overflow: hidden;
        }

        .menu-pointer:after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          background: white;
          transform: translateY(50%) rotate(45deg);
          border-top: 1px solid var(--illinois-orange);
          border-left: 1px solid var(--illinois-orange);
          left: 3px;
        }

        .menu-visible {
          animation: menuSlideDown 0.25s ease forwards;
        }

        .menu-hidden {
          animation: menuSlideUp 0.25s ease forwards;
        }

        /* Revised menu item styles for better hover effects */
        .menu-item {
          display: block;
          text-decoration: none;
          padding: 0.5rem 0.375rem;
          margin: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 150ms ease;
          cursor: pointer;
          border: 1px solid transparent;
        }

        .menu-item-content {
          display: flex;
          align-items: center;
        }

        .menu-item:hover {
          background-color: rgba(255, 95, 5, 0.12);
          border-color: rgba(255, 95, 5, 0.2);
          box-shadow: 0 1px 3px rgba(255, 95, 5, 0.1);
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .menu-item svg {
          display: inline-flex;
          vertical-align: middle;
          color: var(--illinois-orange) !important;
        }

        .menu-item span {
          display: inline-flex;
          vertical-align: middle;
          color: var(--illinois-orange) !important;
        }

        /* Optional: add a subtle transition effect for smoother hover */
        .menu-item span,
        .menu-item svg {
          transition: transform 150ms ease;
        }

        .menu-item:hover span,
        .menu-item:hover svg {
          transform: translateX(1px);
        }
      `}</style>
    </header>
  )
}

export function IconClipboardTexts() {
  return (
    <IconClipboardText
      size={20}
      strokeWidth={2}
      style={{ marginRight: '5px' }}
    />
  )
}

const HEADER_HEIGHT = rem(84)

const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  links: {
    padding: '.2em, 1em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',

    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  menuIcon: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '2.2rem',
    width: '2.2rem',
    padding: '0.25rem',
    backgroundColor: 'white',
    border: `1px solid var(--illinois-orange)`,
    borderRadius: '0.375rem',
    transition: 'background-color 100ms ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 95, 5, 0.05)',
    },
  },

  link: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    height: '2.2rem',
    minWidth: '100px',
    width: 'auto',
    padding: '0 0.75rem',

    color: 'var(--illinois-orange)',
    backgroundColor: 'white',

    fontSize: rem(14),
    fontWeight: 500,

    border: `1px solid var(--illinois-orange)`,
    borderRadius: '0.375rem',

    transition: 'background-color 100ms ease',

    '&:hover': {
      backgroundColor: 'rgba(255, 95, 5, 0.05)',
    },
  },
}))
