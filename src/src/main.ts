import { Blog } from './components/blog';
// import "./styles/main.scss"

// import "bootstrap.native/lib/V4/utils-init" // Required in next release
// import "bootstrap.native/lib/V4/utils";
// import "imports-loader?$=jquery!bootstrap.native/lib/V4/collapse-native"
// import "bootstrap.native/dist/bootstrap-native-v4.js"

let blog = new Blog();
blog.siteLoaded();
blog.pageLoaded(document.location.href, document.title, 0, 0);