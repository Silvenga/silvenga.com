import posthtmlDoctype from "posthtml-doctype";
import { posthtmlExternalLink } from "posthtml-external-link";

export default {
  plugins: [
    posthtmlDoctype({
      doctype: "HTML 5"
    }),
    posthtmlExternalLink({
      exclude: "silvenga.com",
      noreferrer: true
    })
  ]
};
