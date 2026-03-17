import * as vscode from 'vscode';

// youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, m.youtube.com/watch?v=ID
const YT_REGEX = /(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

let panel: vscode.WebviewPanel | undefined;

export function extractYouTubeId(url: string): string | undefined {
  return YT_REGEX.exec(url)?.[1];
}

export function openYouTube(videoId: string) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  if (panel) {
    panel.webview.html = getHtml(embedUrl, videoId);
    panel.reveal(vscode.ViewColumn.Beside);
    return;
  }

  panel = vscode.window.createWebviewPanel(
    'mdBrowserYouTube',
    `YouTube: ${videoId}`,
    vscode.ViewColumn.Beside,
    { enableScripts: true, retainContextWhenHidden: true }
  );

  panel.webview.html = getHtml(embedUrl, videoId);
  panel.onDidDispose(() => { panel = undefined; });
}

export function disposeYouTube() {
  panel?.dispose();
  panel = undefined;
}

function getHtml(embedUrl: string, videoId: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; frame-src https://www.youtube.com; style-src 'unsafe-inline';">
  <style>
    body { margin: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</body>
</html>`;
}
