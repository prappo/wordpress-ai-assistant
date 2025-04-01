import { z } from "zod";
import { makeAssistantToolUI, tool } from "@assistant-ui/react";
import { useModelInstance } from "@/contexts/ModelInstanceContext";
import React from "react";

export const codegen = tool({
    description: "Generate code for wordpress plugin and theme",
    parameters: z.object({
        query: z.string(),
    }),
    execute: async ({ query }) => {
        console.log('query', query);
        return query;
        // const { generateText } = useModelInstance();
        // try {
        //     const result = await generateText(
        //         query,
        //         "You are a WordPress code generation expert. Generate code based on the following request:"
        //     );
        //     console.log('result', result);
        //     return result;
        // } catch (error) {
        //     console.error('Error generating code:', error);
        //     throw error;
        // }
    }
});

export const CodegenToolUI = makeAssistantToolUI({
    toolName: "codegen",
    render: ({ args, status, addResult, result }) => {
        const { generateText } = useModelInstance();
        const [content, setContent] = React.useState('Generating code...');
        
        React.useEffect(() => {
            const generateCode = async () => {
                try {
                    const result = await generateText(
                        args.query,
                        "You are a WordPress code generation expert. When you generate plugin code write all code in a single file. When you generate theme code write all code in a single file. Write full code inside <code> tags. "
                    );
                    console.log('result', result);
                    setContent(result);
                    addResult(result);
                } catch (error) {
                    console.error('Error generating code:', error);
                    addResult('Error generating code. Please try again.');
                }
            };

            if (args.query) {
                generateCode();
            }
        }, [args.query]);
       
        return <div>{content}</div>;
    },
});

