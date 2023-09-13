
import Link from 'next/link'
import GlobalHeader from '~/components/UIUC-Components/GlobalHeader'
import { Flex } from '@mantine/core'
import ResumeToChat from './ResumeToChat'
import { useEffect, useState } from 'react';
import { createStyles, Header, Container, Anchor, Group, Burger, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { GoToQueryAnalysis } from './NavbarButtons';
import { File, Login } from 'tabler-icons-react';
import { useRouter } from 'next/router';



// a navbar the is inspired by github horizontal bar
const HEADER_HEIGHT = rem(84);

const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  links: {
    paddingTop: theme.spacing.lg,
    // paddingTop: rem(100),
    height: HEADER_HEIGHT,
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
    padding: `1rem ${theme.spacing.lg}`,
    fontWeight: 700,
    transition: 'border-color 100ms ease, color 100ms ease, background-color 100ms ease',
    borderRadius: theme.radius.sm, // added to make the square edges round
    textAlign: 'center', // center the text

    '&:hover': {
      color: 'hsl(280,100%,70%)', // make the hovered color lighter
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // change the hovered background color to semi-transparent white
      textDecoration: 'none',
      borderRadius: '10px', // added to make the square edges round when hovered
    },

    '&[data-active="true"]': {
      color: 'hsl(280,100%,70%)', // change the color to same as "AI" when it's on the link's page
      borderBottom: '3px solid hsl(280,100%,100%)', // make the bottom border of the square thicker and same color as "AI"
      textDecoration: 'none', // remove underline
      borderRadius: '10px', // added to make the square edges round when hovered
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // add a background color when the link is active
    },
  }
}));

const NewNavbar = () => {
  const classes = useStyles();
  const router = useRouter(); // import useRouter from next/router
  const [activeLink, setActiveLink] = useState(router.pathname); // useState to track the active link

  useEffect(() => {
    setActiveLink(router.pathname); // update the active link when the component mounts
  }, [router.pathname]);

  const handleLinkClick = (path: string) => {
    setActiveLink(path); // update the active link when a link is clicked
  };

  return (
    <>
      <div className="flex flex-col items-center bg-[#2e026d]">
        <div className="mt-4 w-full max-w-[95%]">
          <div className="navbar rounded-badge h-24 min-h-fit bg-[#15162c] shadow-lg shadow-purple-800">
            <div className="flex-1">
              <Link href="/">
                <h2 className="ms-8 cursor-pointer text-3xl font-extrabold tracking-tight text-white sm:text-[2rem] ">
                  UIUC Course <span className="text-[hsl(280,100%,70%)]">AI</span>
                </h2>
              </Link>
            </div>

            <Container className={classes.classes.inner}>
              <div className={classes.classes.links}>
                <Link href={`/new`} onClick={() => handleLinkClick(`/new`)} data-active={activeLink === `/new`} className={classes.classes.link}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FileIcon />
                    New Project
                  </span>
                </Link>
                <Link href={`/login`} onClick={() => handleLinkClick(`/login`)} data-active={activeLink === `/login`} className={classes.classes.link}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <LoginIcon />
                    Login
                  </span></Link>

              </div>
            </Container>

            <GlobalHeader isNavbar={true} />
          </div >
        </div >
      </div >
    </>
  )
}

export default NewNavbar

export function FileIcon() {
  return <File
    size={20}
    strokeWidth={2}
    color={'white'}
    style={{ marginRight: '5px' }}
  />;
}

export function LoginIcon() {
  return <Login
    size={20}
    strokeWidth={2}
    color={'white'}
    style={{ marginRight: '5px' }}
  />;
}