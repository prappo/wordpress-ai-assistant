import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { models } from '@/components/models';
import { toast } from 'sonner';
import { generateText as generateTextAI , streamText as streamTextAI } from 'ai';

interface ModelInstanceContextType {
    getModelInstance: () => any;
    apiKeys: Record<string, string>;
    setApiKeys: (keys: Record<string, string>) => void;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    generateText: (query: string, prompt: string) => Promise<string>;
    streamText: (query: string, prompt: string) => Promise<string>;
}

const ModelInstanceContext = createContext<ModelInstanceContextType>({
    getModelInstance: () => null,
    apiKeys: {},
    setApiKeys: () => {},
    selectedModel: 'gpt-4o-mini',
    setSelectedModel: () => {},
    generateText: async () => '',
    streamText: async () => ''
});

export function ModelInstanceProvider({ children }: { children: ReactNode }) {
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
    const [selectedModel, setSelectedModel] = useState(() => {
        const savedModel = localStorage.getItem('selectedModel');
        return savedModel || 'gpt-4o-mini';
    });

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
                toast.error('Failed to load settings');
            }
        };

        fetchSettings();
    }, []);

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
        const selectedModelInfo = models.find(m => m.id === selectedModel);
        const provider = selectedModelInfo?.provider.toLowerCase() || 'openai';

        switch (provider) {
            case 'openai':
                return openai(selectedModel);
            case 'anthropic':
                return anthropic(selectedModel);
            case 'google':
                return google(selectedModel);
            case 'groq':
                const groq = createGroq({
                    apiKey: apiKeys.groq || '',
                });
                return groq(selectedModel);
            case 'deepseek':
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

    const handleModelChange = async (model: string) => {
        const provider = models.find(m => m.id === model)?.provider.toLowerCase();
        const apiKeyName = provider === 'openai' ? 'openai' : provider?.toLowerCase();

        if (!apiKeyName || !apiKeys[apiKeyName]) {
            toast.error(`Please add your ${provider} API key in the settings first.`);
            return;
        }

        try {
            // Test the API connection by making a simple request
            const baseUrl = window.wpAiAssistant.apiUrl.replace(/\/$/, '');
            const response = await fetch(`${baseUrl}/wp-ai-assistant/v1/settings/get`, {
                headers: {
                    'X-WP-Nonce': window.wpAiAssistant.nonce
                }
            });

            if (!response.ok) {
                throw new Error('Failed to connect to the API');
            }

            setSelectedModel(model);
            localStorage.setItem('selectedModel', model);

            const modelName = models.find(m => m.id === model)?.name;
            toast.success(`Switched to ${modelName}`);
        } catch (error: any) {
            console.error('API key test failed:', error);
            setSelectedModel(selectedModel);
            localStorage.setItem('selectedModel', selectedModel);

            if (error?.message?.includes('401')) {
                toast.error('Invalid API key. Please check your API key in settings.');
            } else {
                toast.error('Failed to connect to the API. Please check your internet connection.');
            }
        }
    };

    const generateText = async (query: string, prompt: string): Promise<string> => {
        try {
            const model = getModelInstance();
            if (!model) {
                throw new Error('No model instance available');
            }

            const result = await generateTextAI({
                model,
                system: prompt,
                messages: [{ role: 'user', content: query }]
            });

            return result.text;
        } catch (error) {
            console.error('Error generating text:', error);
            throw error;
        }
    };

    const streamText = async (query: string, prompt: string): Promise<string> => {
        try {
            const model = getModelInstance();
            if (!model) {
                throw new Error('No model instance available');
            }

            const result = await streamTextAI({
                model,
                prompt: query
            });

            return result.text;
        } catch (error) {
            console.error('Error generating text:', error);
            throw error;
        }
    };

    const value = {
        getModelInstance,
        apiKeys,
        setApiKeys,
        selectedModel,
        setSelectedModel: handleModelChange,
        generateText,
        streamText
    };

    return (
        <ModelInstanceContext.Provider value={value}>
            {children}
        </ModelInstanceContext.Provider>
    );
}

export function useModelInstance() {
    const context = useContext(ModelInstanceContext);
    if (!context) {
        throw new Error('useModelInstance must be used within a ModelInstanceProvider');
    }
    return context;
} 