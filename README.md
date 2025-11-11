<div align="center">
<img src="public/logo-128.png" alt="logo"/>
<h1> Graze  </h1>
<h2>Read websites in a minimal, customizable environment.</h2>

<h5>
A browser extension built with &#9829;
</div>

## Table of Contents

- [Overview](#overview)
- [Usage](#usage)
- [Installation](#installation)
  - [Getting Started](#gettingStarted)
  - [Customization](#customization)
  - [Publish](#publish)
- [Tech Docs](#tech)
- [Credit](#credit)
- [Contributing](#contributing)


## Overview <a name="overview"></a>
Graze is a minimalist browser extension for reading texts online in a
customizable environment. The extension enables you to read html books,
news articles, wikis, blogs, and most websites more quickly and easily.

Graze is for users searching for the best of both worlds between hard-copy text
and reading in a browser. The extension is made with book lovers and readers
of long texts in mind such as researchers, students, and teachers.

Graze pulls website text into its simple book-like interface and enhances it.
The extension provides users with a variety of features and tools to tune and
optimize their reading experience with custom pagination, font-size, searching,
bookmarking, tracking progress, keyboard shortcuts and more.

Graze cares about its users privacy! There is zero tracking or analytics of any
kind. This extension is entirely self-contained, requiring no network
connection. All features are fully free to users. Finally, Graze development is
open source under GNU.

## Usage <a name="usage"></a>
Basic Usage

## Installation <a name="installation"></a>

### Getting Started <a name="gettingStarted"></a>

#### Developing and building
This template comes with build configs for both Chrome and Firefox. Running
`dev` or `build` commands without specifying the browser target will build
for Chrome by default.

1. Clone this repository or click "Use this template"
2. Change `name` and `description` in `manifest.json`
3. Run `yarn` or `npm i` (check your node version >= 16)
4. Run `yarn dev[:chrome|:firefox]`, or `npm run dev[:chrome|:firefox]`

Running a `dev` command will build your extension and watch for changes in the
source files. Changing the source files will refresh the corresponding
`dist_<chrome|firefox>` folder.

To create an optimized production build, run `yarn build[:chrome|:firefox]`, or
`npm run build[:chrome|:firefox]`.

#### Load your extension
For Chrome
1. Open - Chrome browser
2. Access - [chrome://extensions](chrome://extensions)
3. Tick - Developer mode
4. Find - Load unpacked extension
5. Select - `dist_chrome` folder in this project (after dev or build)

For Firefox
1. Open - Firefox browser
2. Access - [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox)
3. Click - Load temporary Add-on
4. Select - any file in `dist_firefox` folder (i.e. `manifest.json`) in this project (after dev or build)

# Tech <a name="tech"></a>
### Libraries
- [React 19](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [i18n (optional)](https://developer.chrome.com/docs/extensions/reference/api/i18n)
- [Cross browser development with polyfill (optional)](https://github.com/mozilla/webextension-polyfill?tab=readme-ov-file#basic-setup-with-module-bundlers)
- [ESLint](https://eslint.org/)
- [Chrome Extension Manifest Version 3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Github Action](https://github.com/JohnBra/vite-web-extension/actions/workflows/ci.yml) to build and zip your extension (manual trigger)
## Documentation
- [Vite](https://vitejs.dev/)
- [Vite Plugins](https://vitejs.dev/guide/api-plugin.html)
- [Chrome Extension with manifest 3](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Extension i18n](https://developer.chrome.com/docs/extensions/reference/api/i18n#description)
- [Cross browser development with webextension-polyfill](https://github.com/mozilla/webextension-polyfill?tab=readme-ov-file#webextension-browser-api-polyfill)
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- [Rollup](https://rollupjs.org/guide/en/)
- [Tailwind CSS 4](https://tailwindcss.com/docs/configuration)

# Contributing <a name="contributing"></a>
Feel free to open PRs or raise issues!
