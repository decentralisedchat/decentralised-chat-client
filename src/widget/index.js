!(function() {
  var d = document;
  var i = d.createElement('iframe');
  i.id = 'decentralised-chat';
  i.style.position = 'fixed';
  i.style.bottom = '20px';
  i.style.right = '20px';
  i.style.width = '400px';
  i.style.height = '600px';
  i.style.border = 'none';
  i.style.backgroundColor = 'transparent';
  i.style.zIndex = '1000';
  d.body.appendChild(i);

  i.contentWindow.document.open("text/html", "replace");
  i.contentWindow.document.write(`__WIDGET_HTML__`);
  i.contentWindow.document.close();
})();