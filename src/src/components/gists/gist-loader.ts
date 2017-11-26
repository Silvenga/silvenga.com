import { dataGistIdKey } from "./gist-helper";

// https://stackoverflow.com/a/3855394/2001966
function getParams(query: string): { [key: string]: string } {
    if (!query) {
        return {};
    }
    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
            let [key, value] = param.split('=');
            params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            return params;
        }, {});
};

let params = getParams(document.location.search);
let gistId = params[dataGistIdKey];

if (gistId == null) {
    throw new Error("Error, gist id is null.");
}

let scriptSrc = `<script src="https://gist.github.com/${gistId}.js"></script>`;
document.write(scriptSrc);

console.log("Gist loader active for gist:", gistId);