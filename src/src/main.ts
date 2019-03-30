import { Blog } from "./components/blog";

let blog = new Blog();
blog.siteLoaded();
blog.pageLoaded(document.location.href, document.title, 0, 0);

require.context("../../output", true, /.*html$/);
require.context("../../output", false, /.*(xml|txt)$/);