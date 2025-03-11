import { z } from "zod";
import { makeAssistantToolUI } from "@assistant-ui/react";

export const developerInfoTool = {
    name: "developerInfo",
    description: "Get information about the developer",
    parameters: z.object({
        query: z.string(),
    }),
    function: async ({ query }) => {
        console.log(query);
        return "Developer information";
    },
};

export const DeveloperInfoToolUI = makeAssistantToolUI({
    toolName: developerInfoTool.name,
    render: ({ part, status, addResult }) => {
        return <div>The developer name is Prappo</div>;
    },
});
