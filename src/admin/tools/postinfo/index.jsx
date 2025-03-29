import { z } from "zod";
import { makeAssistantToolUI, tool } from "@assistant-ui/react";

export const get_post_info = tool({
    description: "Get information about a WordPress post",
    parameters: z.object({
        post_id: z.number(),
    }),
    execute: async ({ post_id }) => {
        // Here you would typically fetch post data from WordPress
        return `Post ID: ${post_id}`;
    }
});

export const PostInfoToolUI = makeAssistantToolUI({
    toolName: "get_post_info",
    render: ({ args, status, addResult }) => {
        addResult(`Getting information for post ID: ${args.post_id}`);
        return <div>Fetching post information...</div>;
    },
}); 