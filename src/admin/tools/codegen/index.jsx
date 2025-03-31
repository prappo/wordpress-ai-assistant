import { z } from "zod";
import { makeAssistantToolUI , tool } from "@assistant-ui/react";
import { useModelInstance } from "@/contexts/ModelInstanceContext";
import { generateText } from "ai";
export const codegen = tool({
    description: "Generate code for wordpress plugin and theme",
    parameters: z.object({
        query: z.string(),
    }),
    execute: async ({ query }) => {
        console.log('here')
        const { getModelInstance } = useModelInstance();
        const model = getModelInstance();
        console.log('model', model);
        const result = await generateText({
            model: model,
            prompt: query,
        });
        
        console.log('result', result);
        return result;
    }
});

export const CodegenToolUI = makeAssistantToolUI({
    toolName: "codegen",
    render: ({ args, status, addResult }) => {
        console.log('args', args);
        addResult('code generated');
        return <div>Codegen</div>;
    },
});

