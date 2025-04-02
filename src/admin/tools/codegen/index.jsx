import { z } from "zod";
import { makeAssistantToolUI, tool } from "@assistant-ui/react";
import { useModelInstance } from "@/contexts/ModelInstanceContext";
import React from "react";
import { pluginPrompt } from "@/lib/prompt";

export const codegen = tool({
  description: "Make or generate wordpress plugin",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    console.log("query", query);
    return query;
  },
});

const extractPhpCode = (content) => {
  const phpCodeMatch = content.match(/```php\n([\s\S]*?)```/);
  if (phpCodeMatch) {
    const phpCode = phpCodeMatch[1];
    const remainingText = content.replace(/```php\n[\s\S]*?```/, "").trim();
    return { phpCode, remainingText };
  }
  return { phpCode: null, remainingText: content };
};

const createBlueprint = (phpCode) => {
  console.log("phpCode", phpCode);
  return {
    landingPage: "/wp-admin/plugins.php",
    preferredVersions: {
      php: "8.0",
      wp: "latest",
    },
    steps: [
      {
        step: "login",
        username: "admin",
        password: "password",
      },
      {
        step: "mkdir",
        path: "/wordpress/wp-content/plugins/custom-plugin",
      },
      {
        step: "writeFile",
        path: "/wordpress/wp-content/plugins/custom-plugin/custom-plugin.php",
        data: phpCode,
      },
      {
        step: "activatePlugin",
        pluginPath: "custom-plugin/custom-plugin.php",
      },
    ],
  };
};

export const CodegenToolUI = makeAssistantToolUI({
  toolName: "codegen",
  render: ({ args, status, addResult, result }) => {
    const { generateText } = useModelInstance();
    const [content, setContent] = React.useState("Cooking...");
    const [phpCode, setPhpCode] = React.useState(null);
    const [playgroundClient, setPlaygroundClient] = React.useState(null);
    const iframeRef = React.useRef(null);

    React.useEffect(() => {
      const generateCode = async () => {
        try {
          const result = await generateText(args.query, pluginPrompt);
          //   console.log("result", result);

          const { phpCode, remainingText } = extractPhpCode(result);
          setPhpCode(phpCode);
          setContent(remainingText);
          addResult(result);

          // Reload playground with new code if client exists
          if (phpCode) {
            if (iframeRef.current) {
              const { startPlaygroundWeb } = await import(
                "https://playground.wordpress.net/client/index.js"
              );
              const client = await startPlaygroundWeb({
                iframe: iframeRef.current,
                remoteUrl: "https://playground.wordpress.net/remote.html",
                blueprint: createBlueprint(phpCode || ""),
              });
              client.catch((error) => {
                console.error("Error initializing playground:", error);
              });
              setPlaygroundClient(client);
            }
          }
        } catch (error) {
          console.error("Error generating code:", error);
          addResult("Error generating code. Please try again.");
        }
      };

      if (args.query) {
        generateCode();
      }
    }, [args.query]);

    return (
      <div>
        {phpCode && (
          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={() => playgroundClient?.reload()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#0073aa",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "8px",
              }}>
              Reload Playground
            </button>
          </div>
        )}
        <div style={{ marginBottom: "16px" }}>{content}</div>
        <iframe
          ref={iframeRef}
          style={{
            width: "100%",
            height: "800px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
      </div>
    );
  },
});
