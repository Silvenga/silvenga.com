var _paq = _paq || [];


jQuery(function ($) {
    $(document).on("ajax.completed", function (evt) {
        try {
            _paq.push(['setDocumentTitle', evt.title]);
            _paq.push(['setCustomUrl', evt.url]);
            _paq.push(['trackPageView']);
        } catch (err) {
        }
    });
});

(function () {
    var u = "https://piwik.silvenga.com/";
    _paq.push(['setTrackerUrl', u + 'piwik.php']);
    _paq.push(['setSiteId', '3']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript'; g.async = true; g.defer = true; g.src = u + 'piwik.js'; s.parentNode.insertBefore(g, s);
})();