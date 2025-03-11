import type { FC } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/tooltip-icon-button";

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="flex flex-col items-stretch gap-1.5">
      <ThreadListNew />
      <div className="mt-4">
        <ThreadListItems />
      </div>
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button className="w-full bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 rounded-lg px-3 py-2 text-start" variant="ghost">
        <PlusIcon className="h-4 w-4" />
        <span className="text-sm">New Thread</span>
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="group data-[active]:bg-gray-100 hover:bg-gray-50 focus-visible:bg-gray-50 flex items-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 mb-1">
      <ThreadListItemPrimitive.Trigger className="flex-grow px-3 py-2.5 text-start w-full">
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemArchive />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <p className="text-sm truncate">
      <ThreadListItemPrimitive.Title fallback="New Chat" />
    </p>
  );
};

const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="hover:text-primary text-gray-500 ml-auto mr-2 size-4 p-0 opacity-0 group-hover:opacity-100"
        variant="ghost"
        tooltip="Archive thread"
      >
        <ArchiveIcon className="h-3.5 w-3.5" />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
