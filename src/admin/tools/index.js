import { developer_name, DeveloperInfoToolUI } from "./developerinfo";
import { get_post_info, PostInfoToolUI } from "./postinfo";

export const tools = {
    developer_name: developer_name,
    get_post_info: get_post_info
};

export const toolsUI = [
    DeveloperInfoToolUI,
    PostInfoToolUI
];

