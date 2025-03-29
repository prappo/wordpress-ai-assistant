import { z } from "zod";
import { makeAssistantToolUI , tool } from "@assistant-ui/react";

export const developer_name = tool({
    
    description: "Get information about the developer",
    parameters: z.object({
        query: z.string(),
    }),
    execute: async ({ query }) => {
        console.log('query', query);
        return "prappo";
    }
});

export const DeveloperInfoToolUI = makeAssistantToolUI({
    toolName: "developer_name",
    render: ({ args, status, addResult }) => {
        console.log('args', args);
        console.log('status', status);
        console.log('addResult', addResult);
        addResult('The developer name is Prappo');
        return <div>The developer name is Prappo</div>;
    },
});
