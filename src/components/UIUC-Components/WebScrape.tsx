import {Button, Input, Title} from "@mantine/core";
import {IconQuestionMark} from "@tabler/icons-react";
import React, {useEffect, useState} from "react";
import {Montserrat} from "next/font/google";
import axios from "axios";
import {useRouter} from "next/router";
import {useMediaQuery} from "@mantine/hooks";

interface WebScrapeProps {
    is_new_course: boolean,
    courseName: string
}

const montserrat = Montserrat({
    weight: '700',
    subsets: ['latin'],
})

const validateUrl = (url:string) => {
    const courseraRegex = /^https?:\/\/(www\.)?coursera\.org\/learn\/.+/;
    const mitRegex = /^https?:\/\/ocw\.mit\.edu\/.+/;
    const webScrapingRegex = /^https?:\/\/.+/;

    return courseraRegex.test(url) || mitRegex.test(url) || webScrapingRegex.test(url);
};

export const WebScrape = ({ is_new_course, courseName }: WebScrapeProps) => {
    const [isUrlUpdated, setIsUrlUpdated] = useState(false);
    const [url, setUrl] = useState('');
    const [icon, setIcon] = useState(<IconQuestionMark size={'50%'}/>);
    const [loadinSpinner, setLoadinSpinner] = useState(false);
    const API_URL = 'https://flask-production-751b.up.railway.app';
    const router = useRouter()
    const isSmallScreen = useMediaQuery('(max-width: 960px)')
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        console.log("newUrl: ", newUrl)
        setUrl(newUrl);
        if (newUrl.length > 0 && validateUrl(newUrl)) {
            setIsUrlUpdated(true);
        } else {
            setIsUrlUpdated(false);
        }
        // Change icon based on URL
        if (newUrl.includes('coursera.org')) {
            setIcon(<img src={'/media/coursera_logo_cutout.png'} alt="Coursera Logo" style={{height: '50%', width: '50%'}}/>);
        } else if (newUrl.includes('ocw.mit.edu')) {
            setIcon(<img src={'/media/mitocw_logo.jpg'} alt="MIT OCW Logo" style={{height: '50%', width: '50%'}} />);
        } else {
            setIcon(<IconQuestionMark />);
        }

    };

    const handleSubmit = async () => {
        if (validateUrl(url)) {
            setLoadinSpinner(true);
            let data = null;
            // Make API call based on URL
            if (url.includes('coursera.org')) {
                // Coursera API call
            } else if (url.includes('ocw.mit.edu')) {
                // MIT API call
                data = await downloadMITCourse(url, courseName, 'local_dir');
                console.log(data);

            } else {
                // Other API call
                // Move hardcoded values to KV database - any global data structure available?
                data = await scrapeWeb(url, courseName, 5, 1, 200);
            }
            console.log(data);
            if (data?.success) {
                alert('Successfully scraped course!');
                await router.push(`/${courseName}/gpt4`);
            }
        } else {
            alert('Invalid URL');
        }
        setLoadinSpinner(false);
    };

    const scrapeWeb = async (url: string | null, courseName: string | null, maxUrls: number, maxDepth: number, timeout: number) => {
        try {
            if (!url || !courseName) return null;
            const response = await axios.get(`${API_URL}/web-scrape`, {
                params: {
                    url: encodeURIComponent(url),
                    course_name: courseName,
                    max_urls: maxUrls,
                    max_depth: maxDepth,
                    timeout: timeout,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error during web scraping:', error);
            return null;
        }
    };

    const downloadMITCourse = async (url: string | null, courseName: string | null, localDir: string | null) => {
        try {
            if (!url || !courseName || !localDir) return null;
            console.log("calling downloadMITCourse")
            const response = await axios.get(`${API_URL}/mit-download`, {
                params: {
                    url: encodeURIComponent(url),
                    course_name: courseName,
                    local_dir: localDir,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error during MIT course download:', error);
            return null;
        }
    };

    useEffect(() => {
        if (url && url.length > 0 && validateUrl(url)) {
            console.log("url updated : ", url)
            setIsUrlUpdated(true);
        } else {
            console.log("url empty")
            setIsUrlUpdated(false);
        }
    }, [url]);

    return (
        <>
            {is_new_course && (<Title
                    order={3}
                    className={`w-full text-center ${montserrat.className} mt-6`}
                >
                    OR
                </Title>
            )}
            {is_new_course && (<Title
                    order={4}
                    className={`w-full text-center ${montserrat.className} mt-4`}
                >
                    Enter the URL of any <a className={'text-purple-600'} href="https://ocw.mit.edu/" target="_blank"
                                            rel="noopener noreferrer"
                                            style={{textDecoration: 'underline', paddingRight: '5px'}}>OCW
                    MIT</a> course or any website you want to ingest
                </Title>
            )}
            {is_new_course && (
                <Input
                    icon={icon}
                    className="w-[70%] lg:w-[50%] mt-4"
                    placeholder="Enter URL"
                    radius={'xl'}
                    value={url}
                    size={'lg'}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        // Change icon based on URL
                        if (e.target.value.includes('coursera.org')) {
                            setIcon(<img src={'/media/coursera_logo_cutout.png'} alt="Coursera Logo"
                                         style={{height: '50%', width: '50%'}}/>);
                        } else if (e.target.value.includes('ocw.mit.edu')) {
                            setIcon(<img src={'/media/mitocw_logo.jpg'} alt="MIT OCW Logo"
                                         style={{height: '50%', width: '50%'}}/>);
                        } else {
                            setIcon(<IconQuestionMark/>);
                        }
                    }}
                    rightSection={
                        <Button onClick={handleSubmit}
                                size="md"
                                className={`rounded-e-3xl rounded-s-md ${isUrlUpdated ? 'bg-purple-800' : 'border-purple-800'} text-white hover:bg-indigo-600 hover:border-indigo-600 hover:text-white text-ellipsis overflow-ellipsis p-2`}
                                w={`${isSmallScreen ? '90%' : '95%'}}`}
                        >
                            Ingest
                        </Button>
                    }
                    rightSectionWidth={isSmallScreen ? '25%' : '20%'}
                />
            )}
        </>
    )
}