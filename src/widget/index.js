!(function() {
  var i = document.createElement('iframe');
  i.id = 'decentralised-chat';
  i.style.position = 'fixed';
  i.style.bottom = '20px';
  i.style.right = '20px';
  i.style.width = '100dvw';
  i.style.height = '100dvh';
  i.style.border = 'none';
  d.body.appendChild(i);

  i.contentWindow.document.open("text/html", "replace");
  i.contentWindow.document.write(`__WIDGET_HTML__`);
  i.contentWindow.document.close();
})();