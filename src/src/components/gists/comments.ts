import { logger } from "./../logger";
const src = "https://utteranc.es/client.js";
const repo = "Silvenga/comments.silvenga.com";
const issueTerm = "pathname";
const theme = "github-light";

export class Comments {

    public attach() {

        let commentsNode = document.getElementById("comments");
        if (!commentsNode) {
            return;
        }

        logger.info("Loading comments for current page.");
        let utterancesScriptNode = document.createElement("script");
        utterancesScriptNode.src = src;
        utterancesScriptNode.setAttribute("repo", repo);
        utterancesScriptNode.setAttribute("issue-term", issueTerm);
        utterancesScriptNode.setAttribute("theme", theme);
        utterancesScriptNode.crossOrigin = "anonymous";
        utterancesScriptNode.async = true;
        commentsNode.appendChild(utterancesScriptNode);
    }
}