import * as vscode from 'vscode';
import { MarkdownLinkProvider, getUrlAtCursor } from './linkProvider';

const NEEDS_SYSTEM_BROWSER = /youtube\.com|youtu\.be/;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      { language: 'markdown' },
      new MarkdownLinkProvider()
    ),

    vscode.commands.registerCommand('md-browser.openUrl', async (url?: string) => {
      url = url ?? resolveUrl();
      if (!url) {
        url = await vscode.window.showInputBox({ prompt: 'Enter URL to open' });
      }
      if (url) {
        if (NEEDS_SYSTEM_BROWSER.test(url)) {
          await vscode.env.openExternal(vscode.Uri.parse(url));
        } else {
          try {
            await vscode.commands.executeCommand('simpleBrowser.show', url);
          } catch {
            await vscode.env.openExternal(vscode.Uri.parse(url));
          }
        }
      }
    }),

    vscode.commands.registerCommand('md-browser.openUrlExternal', async () => {
      const url = resolveUrl();
      if (url) {
        await vscode.env.openExternal(vscode.Uri.parse(url));
      }
    })
  );
}

function resolveUrl(): string | undefined {
  const editor = vscode.window.activeTextEditor;
  return editor ? getUrlAtCursor(editor.document, editor.selection.active) : undefined;
}

export function deactivate() {}
