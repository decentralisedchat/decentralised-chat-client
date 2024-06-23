'use strict';
require("react-scripts/config/env");

const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const WIDGET_PATH = path.resolve(__dirname, "../src/widget/index.js");
const WIDGET_HTML = path.resolve(__dirname, "../build/index.html");
const WIDGET_OUTPUT = path.resolve(__dirname, "../build/widget.js");

const build = () => {
  const appHost = process.env.REACT_APP_HOST;
  cp.execSync(`craco build`);

  let widget = fs.readFileSync(WIDGET_PATH, 'utf-8');
  let widgetHTML = fs.readFileSync(WIDGET_HTML, 'utf-8');
  widgetHTML = widgetHTML.replaceAll("/static", `${appHost}/static`);
  let widgetOutput = widget.replace("__WIDGET_HTML__", widgetHTML);
  
  fs.writeFileSync(WIDGET_OUTPUT, widgetOutput, 'utf-8');

  fs.unlinkSync(WIDGET_HTML);
}

build();