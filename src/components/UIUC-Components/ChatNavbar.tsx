import Link from 'next/link'
import GlobalHeader from '~/components/UIUC-Components/GlobalHeader'
import { Flex } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks';
import { GoToQueryAnalysis, ResumeToChat } from './NavbarButtons'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { createStyles, Header, Container, Anchor, Group, Burger, rem, Transition, Paper } from '@mantine/core';
import { MessageChatbot, Folder, ReportAnalytics, Settings } from 'tabler-icons-react';
import { useRouter } from 'next/router';
import { montserrat_heading, montserrat_paragraph } from 'fonts'



const styles: Record<string, React.CSSProperties> = {
  logoContainerBox: {
    // Control image-box size
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    height: '100%',
    maxWidth:
      typeof window !== 'undefined' && window.innerWidth > 600 ? '80%' : '100%',
    paddingRight:
      typeof window !== 'undefined' && window.innerWidth > 600 ? '4px' : '25px',
    paddingLeft: '25px',
  },
  thumbnailImage: {
    // Control picture layout INSIDE of the box
    objectFit: 'cover', // Cover to ensure image fills the box
    objectPosition: 'center', // Center to ensure image is centered
    height: '100%', // Set height to 100% to match navbar height
    width: 'auto',
  },
}

const HEADER = rem(60);
const HEADER_HEIGHT = parseFloat(HEADER) * 16;


const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  links: {
    padding: 'theme.spacing.lg, 1em, 1em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',

    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },
  link: {
    textTransform: 'uppercase',
    fontSize: rem(13),
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    margin: '0.35rem',
    fontWeight: 700,
    transition: 'border-color 100ms ease, color 100ms ease, background-color 100ms ease',
    borderRadius: theme.radius.sm,

    '&:hover': {
      color: 'hsl(280,100%,70%)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      textDecoration: 'none',
      borderRadius: '10px',
    },
    '&[data-active="true"]': {
      color: 'hsl(280,100%,70%)',
      borderBottom: '2px solid hsl(280,100%,70%)',
      textDecoration: 'none',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      textAlign: 'right',
    },
    [theme.fn.smallerThan('sm')]: {
      display: 'list-item',
      textAlign: 'center',
      borderRadius: 0,
      padding: theme.spacing.sm,
    },
  },
  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
  dropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: '50%',
    right: '10%',
    zIndex: 1,
    borderRadius: '10px',
    overflow: 'hidden',
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}));

const ChatNavbar = ({ course_name = '', bannerUrl = '', isgpt4 = true }) => {
  const { classes, theme } = useStyles();
  const router = useRouter();
  const [activeLink, setActiveLink] = useState(router.asPath);
  const [opened, { toggle }] = useDisclosure(false);
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setActiveLink(router.asPath);
  }, [router.asPath]);

  // useEffect(() => {
  //   window.addEventListener('scroll', controlNavbar);
  //   return () => {
  //     window.removeEventListener('scroll', controlNavbar);
  //   };
  // }, [lastScrollY]);

  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > lastScrollY) { // if scroll down hide the navbar
        setShow(false);
      } else { // if scroll up show the navbar
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  const handleLinkClick = (path: string) => {
    setActiveLink(path);
    toggle();
  };

  const getCurrentCourseName = () => {
    return router.asPath.split('/')[1];
  }

  const items = [
    { name: <span className={`${montserrat_heading.variable} font-montserratHeading`}>Chat</span>, icon: <MessageChatIcon />, link: `/${getCurrentCourseName()}/gpt4` },
    { name: <span className={`${montserrat_heading.variable} font-montserratHeading`}>Materials</span>, icon: <FolderIcon />, link: `/${getCurrentCourseName()}/materials` },
    { name: <span className={`${montserrat_heading.variable} font-montserratHeading`}>Analysis</span>, icon: <ReportIcon />, link: `/${getCurrentCourseName()}/query-analysis` },
    { name: <span className={`${montserrat_heading.variable} font-montserratHeading`}>Setting</span>, icon: <SettingIcon />, link: `/${getCurrentCourseName()}/setting` },]

  return (
    <div className={`${isgpt4 ? 'bg-[#15162c]' : 'bg-[#2e026d]'}`} style={{ display: show ? 'block' : 'none' }}>
      <Flex direction="row" align="center" justify="center">
        <div className="mt-4 w-full max-w-[95%]">
          <div className="navbar rounded-badge h-24 bg-[#15162c] shadow-lg shadow-purple-800">
            <div className="flex-1">
              <Link href="/">
                <h2 className="ms-8 cursor-pointer text-3xl font-extrabold tracking-tight text-white sm:text-[2rem] ">
                  UIUC.<span className="text-[hsl(280,100%,70%)]">chat</span>
                </h2>
              </Link>
            </div>

            <Transition transition="pop-top-right" duration={200} mounted={opened}>
              {(styles) => (
                <Paper className={classes.dropdown} withBorder style={styles}>
                  {items.map((item) => (
                    <Link href={item.link} onClick={() => handleLinkClick(item.link)} data-active={activeLink === item.link} className={classes.link}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {item.icon}
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </Paper>
              )}
            </Transition>
            <Container className={classes.inner}>
              <div className={classes.links}>
                {items.map((item) => (
                  <Link href={item.link} onClick={() => handleLinkClick(item.link)} data-active={activeLink === item.link} className={classes.link}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </Container>
            <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />

            <GlobalHeader isNavbar={true} />
          </div>
        </div>
      </Flex>
    </div>
  )
}

export default ChatNavbar


export function MessageChatIcon() {
  return <MessageChatbot
    size={20}
    strokeWidth={2}
    color={'white'}
    style={{ marginRight: '5px', marginLeft: '5px' }}
  />;
}

export function FolderIcon() {
  return <Folder
    size={20}
    strokeWidth={2}
    color={'white'}
    style={{ marginRight: '5px', marginLeft: '5px' }}
  />;
}

export function ReportIcon() {
  return <ReportAnalytics
    size={20}
    strokeWidth={2}
    color={'white'}
    style={{ marginRight: '5px', marginLeft: '5px' }}
  />;
}

export function SettingIcon() {
  return <Settings
    size={20}
    strokeWidth={2}
    color={'white'}
    style={{ marginRight: '5px', marginLeft: '5px' }}
  />;
}
