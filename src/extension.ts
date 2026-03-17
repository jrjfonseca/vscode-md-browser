import * as vscode from 'vscode';
import { MarkdownLinkProvider, getUrlAtCursor } from './linkProvider';

const NEEDS_SYSTEM_BROWSER = /youtube\.com|youtu\.be/;
const MD_LINK_IN_TEXT = /\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;
const BARE_URL_IN_TEXT = /https?:\/\/[^\s)>\]"'`]+/g;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      { language: 'markdown' },
      new MarkdownLinkProvider()
    ),

    vscode.commands.registerCommand('md-browser.openUrl', async (urlOrUrls?: string | string[]) => {
      let urls = resolveUrls(urlOrUrls);
      if (urls.length === 0) {
        const input = await vscode.window.showInputBox({
          prompt: 'Enter URL(s) to open (comma or newline separated)',
        });
        urls = parseUrlsFromInput(input);
      }

      for (const url of urls) {
        await openInEmbeddedOrExternal(url);
      }
    }),

    vscode.commands.registerCommand('md-browser.openUrlExternal', async () => {
      for (const url of resolveUrls()) {
        await vscode.env.openExternal(vscode.Uri.parse(url));
      }
    })
  );
}

function resolveUrls(urlOrUrls?: string | string[]): string[] {
  if (Array.isArray(urlOrUrls)) {
    return dedupeAndNormalize(urlOrUrls);
  }

  if (typeof urlOrUrls === 'string' && urlOrUrls.trim()) {
    return dedupeAndNormalize([urlOrUrls]);
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return [];
  }

  const urls: string[] = [];
  for (const selection of editor.selections) {
    if (selection.isEmpty) {
      const url = getUrlAtCursor(editor.document, selection.active);
      if (url) {
        urls.push(url);
      }
    } else {
      urls.push(...extractUrlsFromText(editor.document.getText(selection)));
    }
  }

  return dedupeAndNormalize(urls);
}

function extractUrlsFromText(text: string): string[] {
  const urls: string[] = [];

  MD_LINK_IN_TEXT.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MD_LINK_IN_TEXT.exec(text)) !== null) {
    urls.push(m[1]);
  }

  BARE_URL_IN_TEXT.lastIndex = 0;
  while ((m = BARE_URL_IN_TEXT.exec(text)) !== null) {
    urls.push(m[0].replace(/[.,;:!?]+$/, ''));
  }

  return urls;
}

function parseUrlsFromInput(input: string | undefined): string[] {
  if (!input) {
    return [];
  }

  const urls = input
    .split(/[\n,\s]+/)
    .map(url => url.trim())
    .filter(url => /^https?:\/\//.test(url));

  return dedupeAndNormalize(urls);
}

function dedupeAndNormalize(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const url of urls) {
    const normalized = url.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    out.push(normalized);
  }

  return out;
}

async function openInEmbeddedOrExternal(url: string): Promise<void> {
  if (NEEDS_SYSTEM_BROWSER.test(url)) {
    await vscode.env.openExternal(vscode.Uri.parse(url));
    return;
  }

  try {
    await vscode.commands.executeCommand('simpleBrowser.show', url);
  } catch {
    await vscode.env.openExternal(vscode.Uri.parse(url));
  }
}

export function deactivate() {}