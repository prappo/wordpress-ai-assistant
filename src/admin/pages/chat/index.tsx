import {
    AssistantRuntimeProvider,
    useLocalRuntime,
    CompositeAttachmentAdapter,
    SimpleImageAttachmentAdapter,
    SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
import { ThreadList } from "@/components/thread-list";
import { Thread } from "@/components/thread";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

import { streamText } from "ai";
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

import React, { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { toast, Toaster } from "sonner";
import type { ChatModelAdapter } from "@assistant-ui/react";
import { tools } from "@/admin/tools";

import { toolsUI } from "@/admin/tools";

import { models } from "@/components/models";

interface ModelContextType {
    selectedModel: string;
    setSelectedModel: (model: string) => void;
}

interface Model {
    id: string;
    name: string;
    provider: string;
    description: string;
    icon: ReactNode;
}

// Group models by provider
const modelsByProvider = models.reduce<Record<string, Model[]>>((acc, model) => {
    if (!acc[model.provider]) {
        acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
}, {});

const ModelContext = createContext<ModelContextType>({
    selectedModel: 'gpt-4o-mini',
    setSelectedModel: () => { }
});

function WpAssistantRuntimeProvider({ children }: { children: ReactNode }) {
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Fetch API keys from WordPress settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const baseUrl = window.wpAiAssistant.apiUrl.replace(/\/$/, '');
                const response = await fetch(`${baseUrl}/wp-ai-assistant/v1/settings/get`, {
                    headers: {
                        'X-WP-Nonce': window.wpAiAssistant.nonce
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch settings');
                }
                const data = await response.json();
                if (data.apiKeys) {
                    setApiKeys(data.apiKeys);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Failed to load API keys');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Get the selected model from context
    const { selectedModel } = useContext(ModelContext);

    // Find the selected model's provider
    const selectedModelInfo = models.find(m => m.id === selectedModel);
    const provider = selectedModelInfo?.provider.toLowerCase() || 'openai';

    // Initialize AI clients
    const openai = createOpenAI({
        apiKey: apiKeys.openai || ''
    });

    const anthropic = createAnthropic({
        apiKey: apiKeys.anthropic || ''
    });

    const google = createGoogleGenerativeAI({
        apiKey: apiKeys.google || ''
    });

    const openrouter = createOpenRouter({
        apiKey: apiKeys.openrouter || ''
    });

    // Get the appropriate model instance based on provider
    const getModelInstance = () => {
        switch (provider) {
            case 'openai':
                return openai(selectedModel);
            case 'anthropic':
                return anthropic(selectedModel);
            case 'google':
                return google(selectedModel);
            case 'groq':
                // Initialize Groq client with their API
                const groq = createGroq({
                    apiKey: apiKeys.groq || '',
                });
                return groq(selectedModel);
            case 'deepseek':
                // Initialize DeepSeek client with their API
                const deepseek = createOpenAI({
                    apiKey: apiKeys.deepseek || '',
                    baseURL: 'https://api.deepseek.com/v1'
                });
                return deepseek(selectedModel);
            case 'openrouter':
                return openrouter(selectedModel);
            default:
                return openai(selectedModel);
        }
    };

    const model = getModelInstance();

    const MyModelAdapter: ChatModelAdapter = {
        async *run({ messages, abortSignal }) {
            // let { messages, abortSignal } = options;

            // If no API key is set, return an error message
            if (!apiKeys[provider]) {
                toast.error(`${selectedModelInfo?.provider} API key is not set. Please add it in the settings.`);
                yield {
                    content: [{
                        type: "text" as const,
                        text: `Please enter your ${selectedModelInfo?.provider} API key in the [settings](#/settings).`,
                    }],
                };
                return;
            }

            // Filter out tool-call messages and format messages for the API
            // const formattedMessages = (messages as ThreadMessage[]).filter(message => 
            //     message.content[0]?.type !== "tool-call"
            // ).map(message => ({
            //     role: message.role,
            //     content: (message.content[0] as TextContentPart)?.text || ''
            // }));

            // messages = messages.filter(message => message.content[0].type !== "tool-call");

            try {
                const config = {
                    model: model,
                    messages: messages,
                    // tools: tools,
                    // system: 'You are a helpful assistant that can answer questions and help with tasks.',
                    // toolChoice: "auto",
                    signal: abortSignal
                };

                const result = await streamText(config as any);

                let text = "";
                for await (const chunk of result.textStream) {

                    text += chunk;
                    yield {
                        content: [{
                            type: "text" as const,
                            text
                        }],
                    };
                }

                // Handle tool calls after the text generation is complete
                const toolCalls = await result.toolCalls;


                if (toolCalls && toolCalls.length > 0) {
                    for (const toolCall of toolCalls) {
                        if (toolCall.type === "tool-call") {
                            yield {
                                content: [{
                                    type: "tool-call",
                                    toolName: tools[parseInt(toolCall.toolName)].name,
                                    toolCallId: toolCall.toolCallId,
                                    args: toolCall.args,
                                }],
                            };
                        }
                    }
                }

            } catch (error: any) {
                console.error('Error in streamText:', error);
                let errorMessage = "An error occurred while processing your request.";

                if (error?.message?.includes('401')) {
                    errorMessage = `Invalid API key. Please check your ${selectedModelInfo?.provider} API key in settings.`;
                    toast.error(errorMessage);
                } else if (error?.message?.includes('429')) {
                    errorMessage = "Rate limit exceeded. Please try again later.";
                    toast.error(errorMessage);
                } else if (error?.message?.includes('503')) {
                    errorMessage = "Service temporarily unavailable. Please try again later.";
                    toast.error(errorMessage);
                } else {
                    toast.error(`Failed to connect to ${selectedModelInfo?.provider}. Please check your internet connection.`);
                }

                yield {
                    content: [{
                        type: "text" as const,
                        text: errorMessage,
                    }],
                };
            }
        }
    };

    const runtime = useLocalRuntime(MyModelAdapter, {
        adapters: {

            attachments: new CompositeAttachmentAdapter([
                new SimpleImageAttachmentAdapter(),
                new SimpleTextAttachmentAdapter(),
            ]),

        }
    });

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            {children}
        </AssistantRuntimeProvider>
    );
}

const Chat = () => {
    const [sidebarVisible, setSidebarVisible] = React.useState(() => {
        // Try to get the saved state from localStorage, default to false (hidden)
        const savedState = localStorage.getItem('sidebarVisible');
        return savedState !== null ? JSON.parse(savedState) : false;
    });

    // Initialize model selection state and provide it through context
    const [selectedModel, setSelectedModel] = useState(() => {
        // Try to get the saved model from localStorage, default to 'gpt-4o-mini'
        const savedModel = localStorage.getItem('selectedModel');
        return savedModel !== null ? savedModel : 'gpt-4o-mini';
    });

    // Initialize API keys state
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Fetch settings when component mounts
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const baseUrl = window.wpAiAssistant.apiUrl.replace(/\/$/, '');
                const response = await fetch(`${baseUrl}/wp-ai-assistant/v1/settings/get`, {
                    headers: {
                        'X-WP-Nonce': window.wpAiAssistant.nonce
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch settings');
                }
                const data = await response.json();
                if (data.apiKeys) {
                    setApiKeys(data.apiKeys);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Failed to load API keys');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Update model selection
    const handleModelChange = async (model: string) => {
        // Get the provider from the selected model
        const provider = models.find(m => m.id === model)?.provider.toLowerCase();

        if (!provider) {
            toast.error('Invalid model selection');
            return;
        }

        // Convert provider name to API key name in storage
        const apiKeyName = provider === 'openai' ? 'openai' : provider.toLowerCase();

        // Check if API key exists for the provider
        if (!apiKeys[apiKeyName]) {
            toast.error(`Please add your ${provider} API key in the settings first.`);
            return;
        }

        try {
            // For OpenAI models, test the API key
            if (provider === 'openai') {
                const openai = createOpenAI({
                    apiKey: apiKeys.openai
                });

                // Update the model immediately to provide faster feedback
                setSelectedModel(model);

                // Test API key in background
                const testModel = openai('gpt-3.5-turbo');
                await streamText({
                    model: testModel,
                    messages: [{ role: 'user', content: 'test' }],
                });
            } else {
                // For other providers, just update the model
                setSelectedModel(model);
            }

            toast.success(`Switched to ${models.find(m => m.id === model)?.name}`);
        } catch (error: any) {
            console.error('API key test failed:', error);
            // Revert to previous model if there's an error
            setSelectedModel(selectedModel);

            if (error?.message?.includes('401')) {
                toast.error('Invalid API key. Please check your API key in settings.');
            } else {
                toast.error('Failed to connect to the API. Please check your internet connection.');
            }
        }
    };

    const toggleSidebar = () => {
        const newState = !sidebarVisible;
        setSidebarVisible(newState);
        // Save the state to localStorage
        localStorage.setItem('sidebarVisible', JSON.stringify(newState));
    };

    // Helper function to get the icon for the selected model
    const getModelIcon = (modelId: string) => {
        const model = models.find(m => m.id === modelId);
        return model ? model.icon : models[0].icon;
    };

    return (
        <ModelContext.Provider value={{ selectedModel, setSelectedModel: handleModelChange }}>
            <WpAssistantRuntimeProvider>
                <div className="flex h-[89vh] m-0 p-0 overflow-hidden">
                    {/* ThreadList sidebar */}
                    <div
                        className={`overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 scrollbar-track-transparent transition-all duration-300 ease-in-out ${sidebarVisible ? 'w-64' : 'w-0'
                            }`}
                    >
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Chat</h2>
                            </div>
                        </div>
                        <div className="p-4">
                            <ThreadList />
                        </div>
                    </div>

                    {/* Thread main content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 flex justify-start">
                            <div className="w-full max-w-[42rem] flex items-center">
                                {!sidebarVisible && (
                                    <button
                                        onClick={toggleSidebar}
                                        className="mr-3 p-1 rounded-md hover:bg-gray-100"
                                        aria-label="Open sidebar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                            <line x1="9" x2="9" y1="3" y2="21" />
                                        </svg>
                                    </button>
                                )}
                                <div className="flex items-center">
                                    {sidebarVisible && (
                                        <button
                                            onClick={toggleSidebar}
                                            className="mr-3 p-1 rounded-md hover:bg-gray-100"
                                            aria-label="Close sidebar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                                <path d="m15 9-6 6" />
                                                <path d="m9 9 6 6" />
                                            </svg>
                                        </button>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 flex items-center justify-center">
                                                    {getModelIcon(selectedModel)}
                                                </div>
                                                <span className="font-medium text-sm">
                                                    {models.find(m => m.id === selectedModel)?.name || selectedModel}
                                                </span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="m6 9 6 6 6-6"></path>
                                                </svg>
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" side="bottom" sideOffset={4} className="w-64">
                                            {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
                                                <DropdownMenuSub key={provider}>
                                                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                                                        <div className="w-4 h-4 flex-shrink-0">
                                                            {providerModels[0].icon}
                                                        </div>
                                                        <span className="font-medium">{provider}</span>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent className="w-64">
                                                        {providerModels.map((model) => (
                                                            <DropdownMenuItem
                                                                key={model.id}
                                                                onSelect={() => handleModelChange(model.id)}
                                                                className="flex items-start gap-3 py-2"
                                                            >
                                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                                    <div className="mt-1 w-4 h-4 flex-shrink-0">
                                                                        {model.icon}
                                                                    </div>
                                                                    <div className="grid gap-0.5 flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-foreground">
                                                                            {model.name}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {model.description}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                        {/* Render the tools ui dynamically  */}
                        {toolsUI.map((tool, index) => (
                            React.createElement(tool, { key: index })
                        ))}
                        <Thread />
                    </div>
                </div>
                <Toaster position="top-center" />
            </WpAssistantRuntimeProvider>
        </ModelContext.Provider>
    );
};

export default Chat;