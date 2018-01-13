const dataGistIdKey: string = "data-gist-id";

// https://stackoverflow.com/a/3855394/2001966
function getParams(query: string): { [key: string]: string } {
    if (!query) {
        return {};
    }
    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split("&")
        .reduce((result, param) => {
            let [key, value] = param.split("=");
            result[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
            return result;
        }, {});
}

let params = getParams(document.location.hash);
let gistId = params[dataGistIdKey];

if (gistId == null) {
    throw new Error("Error, gist id is null.");
}

let scriptSrc = `<script src="https://gist.github.com/${gistId}.js"></script>`;
document.write(scriptSrc);

console.log("Gist loader active for gist:", gistId);