function deleteStuffFromIndicatorPagesForIframe(indicator) {
    var iframeId = 'myIframe_' + indicator;
    var goal = indicator.substring(0, indicator.search('-'));
    var iframe = document.getElementById(iframeId);
    var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    // Header ausblenden
    var header = iframeDocument.querySelector("header[role='banner']");
    if (header) {
        header.style.display = "none";
    }
    // Element mit Klasse "heading goal-banner indicator goal-2" ausblenden
    var element = iframeDocument.querySelector(".heading.goal-banner.indicator.goal-" + goal);
    if (element) {
        element.style.display = "none";
    }
    // Disclaimer ausblenden
    var disclaimer = iframeDocument.getElementById("disclaimer");
    if (disclaimer) {
        disclaimer.style.display = "none";
    }
    // Breadcrumbs ausblenden
    iframeDocument.querySelectorAll(".breadcrumb").forEach(a=>a.style.display = "none");
    // Buttons ausblenden
    iframeDocument.getElementById("navigationbuttons").style.display = 'none';
    // Buttons ausblenden
    iframeDocument.querySelectorAll(".app-c-back-to-top__icon").forEach(a=>a.style.display = "none");
    // Footer ausblenden
    iframeDocument.querySelectorAll('[role="contentinfo"]').forEach(a=>a.style.display = "none");
  }
