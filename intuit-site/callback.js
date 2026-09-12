// RR Financials: the page Intuit sends a person to after they consent to connect QuickBooks.
//
// It shows the address Intuit landed on, for pasting into `python bo.py qbo-authorize --manual`, and then takes the
// one-time authorization code out of the address bar and the browser history. Intuit's OAuth guide advises a
// redirect page not to leave the response parameters in the URL, where other resources could read them.
//
// No network requests, no third-party code (the page's Content-Security-Policy allows neither), and nothing taken
// from the address is ever inserted as HTML: only as a text field's value or an element's text.
(function () {
  "use strict";

  var href = window.location.href;
  var params = new URLSearchParams(window.location.search);

  function section(id) {
    var el = document.getElementById(id);
    if (el) {
      el.hidden = false;
    }
  }

  if (params.has("code") || params.has("error") || params.has("state")) {
    window.history.replaceState(null, "", window.location.pathname);
  }

  if (params.has("code")) {
    section("received");
    var box = document.getElementById("address");
    var status = document.getElementById("copy-status");
    box.value = href;

    var copied = function () {
      status.textContent = "Copied. Paste it into the RR Financials window, then close this tab.";
    };
    var byHand = function () {
      box.focus();
      box.select();
      status.textContent = "Could not copy automatically. The address is selected: press Ctrl+C.";
    };
    var legacyCopy = function () {
      box.focus();
      box.select();
      try {
        if (document.execCommand("copy")) {
          copied();
          return;
        }
      } catch (e) {
        // fall through to copying by hand
      }
      byHand();
    };

    document.getElementById("copy").addEventListener("click", function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(href).then(copied, legacyCopy);
      } else {
        legacyCopy();
      }
    });
  } else if (params.has("error")) {
    section("refused");
    document.getElementById("intuit-said").textContent =
      params.get("error_description") || params.get("error");
  } else {
    section("nothing");
  }
})();
