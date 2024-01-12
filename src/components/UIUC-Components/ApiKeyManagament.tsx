// src/components/UIUC-Components/ApiKeyManagement.tsx
import React, { useEffect, useState } from 'react';
import { Card, Title, Button, Text, Flex, Group, Input, useMantineTheme, Textarea, Select } from '@mantine/core';
import { useClipboard, useMediaQuery } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { type UserResource } from '@clerk/types';
import { IconCheck, IconCopy, IconExternalLink } from '@tabler/icons-react';
import { montserrat_heading } from 'fonts';

const ApiKeyManagement = ({ course_name, clerk_user }: {
	course_name: string, clerk_user: {
		isLoaded: boolean;
		isSignedIn: boolean;
		user: UserResource | undefined;
	}
}) => {
	const theme = useMantineTheme();
	const isSmallScreen = useMediaQuery('(max-width: 960px)');
	const { copy } = useClipboard();
	const [apiKey, setApiKey] = useState<string | null>(null);
	const baseUrl = process.env.VERCEL_URL || window.location.origin;
	const [loading, setLoading] = useState(true);
	// Define a type for the keys of codeSnippets
	type Language = 'curl' | 'python' | 'node';

	// Ensure selectedLanguage is of type Language
	const [selectedLanguage, setSelectedLanguage] = useState<Language>('curl');

	// State to track whether code snippet has been copied
	const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
	// State to track whether API key has been copied
	const [copiedApiKey, setCopiedApiKey] = useState(false);

	// Function to handle copying of code snippet
	const handleCopyCodeSnippet = (text: string) => {
		copy(text);
		setCopiedCodeSnippet(true);
		setTimeout(() => setCopiedCodeSnippet(false), 2000); // Reset after 2 seconds
	};

	// Function to handle copying of API key
	const handleCopyApiKey = (text: string) => {
		copy(text);
		setCopiedApiKey(true);
		setTimeout(() => setCopiedApiKey(false), 2000); // Reset after 2 seconds
	};


	const languageOptions = [
		{ value: 'curl', label: 'cURL' },
		{ value: 'python', label: 'Python' },
		{ value: 'node', label: 'Node.js' },
	];

	const apiKeyPlaceholder = '\"your-api-key\" // replace with your API key';

	const codeSnippets = {
		'curl': `curl -X POST ${baseUrl}/api/chat-api/chat \\
	-H "Content-Type: application/json" \\
	-d '{
		"model": "gpt-3.5-turbo",
		"messages": [
			{
				"role": "system",
				"content": "Your system prompt here"
			},
			{
				"role": "user",
				"content": "Hello, how can I help you today?"
			}
		],
		"openai_key": "your-openai-key", // replace with your OpenAI key
		"temperature": 0.7,
		"course_name": "${course_name}",
		"stream": true,
		"api_key": ${apiKey || apiKeyPlaceholder}
	}'`,
		'python': `import requests
	
	url = "${baseUrl}/api/chat-api/chat"
	headers = {
		'Content-Type': 'application/json'
	}
	data = {
		"model": "gpt-3.5-turbo",
		"messages": [
			{
				"role": "system",
				"content": "Your system prompt here"
			},
			{
				"role": "user",
				"content": "Hello, how can I help you today?"
			}
		],
		"openai_key": "your-openai-key", // replace with your OpenAI key
		"temperature": 0.7,
		"course_name": "${course_name}",
		"stream": true,
		"api_key": ${apiKey || apiKeyPlaceholder}
	}
	
	response = requests.post(url, headers=headers, json=data)
	print(response.text)`,
		'node': `const axios = require('axios');
	
	const data = {
		"model": "gpt-3.5-turbo",
		"messages": [
			{
				"role": "system",
				"content": "Your system prompt here"
			},
			{
				"role": "user",
				"content": "Hello, how can I help you today?"
			}
		],
		"openai_key": "your-openai-key", // replace with your OpenAI key
		"temperature": 0.7,
		"course_name": "${course_name}",
		"stream": true,
		"api_key": ${apiKey || apiKeyPlaceholder}
	};
	
	axios.post('${baseUrl}/api/chat-api/chat', data, {
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then((response) => {
		console.log(response.data);
	})
	.catch((error) => {
		console.error(error);
	});`
	};

	useEffect(() => {
		const fetchApiKey = async () => {
			const response = await fetch(`/api/chat-api/keys/fetch`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data = await response.json();
				setApiKey(data.apiKey);
			} else {
				showNotification({
					title: 'Error',
					message: 'Failed to fetch API key.',
					color: 'red',
				});
			}
			setLoading(false);
		};

		fetchApiKey();
	}, [clerk_user.isLoaded]);

	const handleGenerate = async () => {
		const response = await fetch(`/api/chat-api/keys/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (response.ok) {
			const data = await response.json();
			setApiKey(data.apiKey);
			showNotification({
				title: 'Success',
				message: 'API key generated successfully.',
			});
		} else {
			showNotification({
				title: 'Error',
				message: 'Failed to generate API key.',
				color: 'red',
			});
		}
	};

	const handleRotate = async () => {
		const response = await fetch(`/api/chat-api/keys/rotate`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (response.ok) {
			const data = await response.json();
			setApiKey(data.newApiKey);
			showNotification({
				title: 'Success',
				message: 'API key rotated successfully.',
			});
		} else {
			showNotification({
				title: 'Error',
				message: 'Failed to rotate API key.',
				color: 'red',
			});
		}
	};

	const handleDelete = async () => {
		const response = await fetch(`/api/chat-api/keys/delete`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (response.ok) {
			setApiKey(null);
			showNotification({
				title: 'Success',
				message: 'API key deleted successfully.',
			});
		} else {
			showNotification({
				title: 'Error',
				message: 'Failed to delete API key.',
				color: 'red',
			});
		}
	};

	return (
		<Card
			shadow="xs"
			padding="none"
			radius="xl"
			style={{ maxWidth: '85%', width: '100%', marginTop: '4%' }}
		>
			<Flex direction={isSmallScreen ? 'column' : 'row'} style={{ height: '100%' }}>
				<div
					style={{
						flex: isSmallScreen ? '1 1 100%' : '1 1 60%',
						padding: '1rem',
						color: 'white',
						alignItems: 'center',
					}}
					className="min-h-full bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-800 justify-center"
				>
					<div className="card flex h-full flex-col">
						<Group
							// spacing="lg"
							m="3rem"
							align="center"
							variant='column'
							style={{ justifyContent: 'center', width: '75%', alignSelf: 'center', overflow: 'hidden' }}
						>
							<Title
								order={2}
								variant="gradient"
								gradient={{ from: 'gold', to: 'white', deg: 50 }}
								style={{ marginBottom: '0.5rem' }}
								align='center'
								className={`label ${montserrat_heading.variable} font-montserratHeading`}
							>
								API Key Management
							</Title>
							<Title order={4} w={'90%'}>
								This API is stateless, meaning each request is independent of others. If you need to use the response from one call in a subsequent call, append the messages from the first call to the 'messages' array in the next call. For more information on how to structure the 'messages' array, please refer to the <a href="https://platform.openai.com/docs/api-reference/chat/create"
									target="_blank"
									rel="noopener noreferrer"
									className={`text-purple-500 hover:underline ${montserrat_heading.variable} font-montserratHeading`}
								>
									OpenAI API documentation
									<IconExternalLink
										className="mr-2 inline-block"
										style={{ position: 'relative', top: '-3px' }}
									/>
								</a>.
							</Title>
							<div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#15162c', paddingTop: '1rem', borderRadius: '1rem' }}>
								<div style={{ width: '95%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#15162c', paddingBottom: '1rem' }}>

									<Title order={3}
										align='left'
										variant="gradient"
										gradient={{ from: 'gold', to: 'white', deg: 50 }}
										style={{ width: '100%', marginLeft: '1rem' }}>Example Request</Title>
									<Select
										placeholder="Select an option"
										data={languageOptions}
										value={selectedLanguage}
										onChange={(value: string | null) => {
											if (value === 'curl' || value === 'python' || value === 'node') {
												setSelectedLanguage(value);
											}
										}}
										style={{ width: '30%' }}
									/>
									<Button onClick={() => handleCopyCodeSnippet(codeSnippets[selectedLanguage])} variant="subtle" size="xs"
										className='min-h-[2.5rem] transform rounded-tl-md rounded-bl-xl bg-purple-800 text-white hover:border-indigo-600 hover:bg-indigo-600 hover:text-white focus:shadow-none focus:outline-none rounded-tr-xl rounded-br-md ms-2 self-end'>
										{copiedCodeSnippet ? <IconCheck /> : <IconCopy />}
									</Button>
								</div>
								<Textarea
									value={codeSnippets[selectedLanguage] as string}
									autosize
									variant='unstyled'
									wrapperProps={{ overflow: 'hidden' }}
									className="w-[100%] min-w-[20rem] overflow-hidden relative rounded-b-xl border-t-2 pl-8 bg-[#0c0c27] border-gray-400 text-white"
									readOnly

								/>
							</div>
						</Group>
					</div>
				</div>
				<div
					style={{
						flex: isSmallScreen ? '1 1 100%' : '1 1 40%',
						padding: '1rem',
						backgroundColor: '#15162c',
						color: 'white',
					}}
				>
					<div className="card flex h-full flex-col">

						<Group position="center" m="3rem" variant='column'>
							<Title
								className={`label ${montserrat_heading.variable} font-montserratHeading`}
								variant="gradient"
								gradient={{ from: 'gold', to: 'white', deg: 170 }}
								order={2}
								style={{ marginBottom: '1rem' }}
							>
								Your API Key
							</Title>
							{apiKey && (
								<Input
									value={apiKey}
									className="mt-4 w-[80%] min-w-[5rem]"
									radius={'xl'}
									size={'md'}
									readOnly
									rightSection={
										<Button onClick={() => handleCopyApiKey(apiKey)} variant="subtle" size="sm"
											radius={'xl'}
											className='min-w-[5rem] -translate-x-1 transform rounded-s-md bg-purple-800 text-white hover:border-indigo-600 hover:bg-indigo-600 hover:text-white focus:shadow-none focus:outline-none'>
											{copiedApiKey ? <IconCheck /> : <IconCopy />}
										</Button>
									}
									rightSectionWidth={'auto'}
								/>
							)}
						</Group>
						{!apiKey && !loading && (
							<Button onClick={handleGenerate} disabled={loading || apiKey !== null}
								size="lg"
								radius={'xl'}
								className="min-w-[5rem] rounded-md bg-purple-800 text-white hover:border-indigo-600 hover:bg-indigo-600 hover:text-white focus:shadow-none focus:outline-none self-center"
								w={'50%'}>Generate API Key</Button>
						)}
						{apiKey && !loading && (
							<>
								<Group position="center" variant='column' mt="1rem" mb={"3rem"}>
									<Button onClick={handleRotate} disabled={loading || apiKey === null}
										size="lg"
										radius={'xl'}
										className="min-w-[5rem] rounded-md bg-purple-800 text-white hover:border-indigo-600 hover:bg-indigo-600 hover:text-white focus:shadow-none focus:outline-none"
										w={'auto'}>Rotate API Key</Button>
									<Button onClick={handleDelete} disabled={loading || apiKey === null}
										size="lg"
										radius={'xl'}
										className="min-w-[5rem] rounded-md bg-purple-800 text-white hover:border-indigo-600 hover:bg-indigo-600 hover:text-white focus:shadow-none focus:outline-none"
										w={'auto'}>Delete API Key</Button>
								</Group>
							</>
						)}


					</div>
				</div>
			</Flex>
		</Card>
	);
};

export default ApiKeyManagement;