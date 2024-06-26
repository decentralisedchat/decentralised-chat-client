!(function() {
  var d = document;
  var i = d.createElement('iframe');
  i.id = 'decentralised-chat';
  i.style.position = 'fixed';
  i.style.bottom = '20px';
  i.style.right = '20px';
  i.style.width = '96px';
  i.style.height = '96px';
  i.style.border = 'none';
  i.style.backgroundColor = 'transparent';
  i.style.zIndex = '1000';
  i.style.transition = 'width 0.3s ease-in-out, height 0.3s ease-in-out';  // Smooth transition for resizing
  d.body.appendChild(i);

  var iframeDocument = i.contentDocument || i.contentWindow.document;
  iframeDocument.open();
  i.contentWindow.document.write(`__WIDGET_HTML__`);
  iframeDocument.close();
})();
