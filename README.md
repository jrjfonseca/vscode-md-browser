# Markdown Browser

A lightweight VS Code extension that opens links from markdown files in an embedded browser — without leaving your editor.

## Features

- **Click any URL** in a markdown file to open it in VS Code's built-in Simple Browser
- **YouTube support** — YouTube links open as embedded video players with autoplay
- **Detects all link formats** — `[text](url)`, `[url](url)`, and bare `https://...` URLs
- **Context menu** — right-click for "Open in Embedded Browser" or "Open in System Browser"
- **Keyboard shortcut** — `Alt+Enter` opens the link under your cursor

## Usage

1. Open any `.md` file
2. Hover over a URL — you'll see the tooltip "Open in embedded browser"
3. Click the link, press `Alt+Enter`, or right-click and choose from the context menu

| Action | Behavior |
|---|---|
| Click a detected link | Opens in Simple Browser (side panel) |
| `Alt+Enter` on a URL | Opens in embedded browser |
| Right-click → Open Link in Embedded Browser | Opens in Simple Browser / YouTube player |
| Right-click → Open Link in System Browser | Opens in your default browser |

## Install from source

```sh
git clone https://github.com/jrjfonseca/vscode-md-browser.git
cd vscode-md-browser
npm install
npm run compile
npx @vscode/vsce package --no-dependencies
code --install-extension vscode-md-browser-*.vsix
```

## License

MIT
