import { z } from "zod";
import { makeAssistantToolUI , tool } from "@assistant-ui/react";

export const codegen = tool({
    description: "Generate code for wordpress plugin and theme",
    parameters: z.object({
        query: z.string(),
    }),
    execute: async ({ query }) => {
        const prompt = `
        You are a wordpress developer.
        `
        return "prappo";
    }
});

