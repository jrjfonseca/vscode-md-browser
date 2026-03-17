import * as vscode from 'vscode';

// Matches [text](url) markdown links
const MD_LINK = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;

// Matches bare http(s) URLs
const BARE_URL = /https?:\/\/[^\s)>\]"'`]+/g;

export class MarkdownLinkProvider implements vscode.DocumentLinkProvider {
  provideDocumentLinks(document: vscode.TextDocument): vscode.DocumentLink[] {
    const links: vscode.DocumentLink[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;

      const covered: [number, number][] = [];

      MD_LINK.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = MD_LINK.exec(line)) !== null) {
        const displayText = m[1];
        const url = m[2];
        // URL starts after "[text]("  →  [=1 + text + ]=1 + (=1 = 3 extra chars
        const colStart = m.index + displayText.length + 3;
        covered.push([m.index, m.index + m[0].length]);
        links.push(buildLink(i, colStart, colStart + url.length, url));

        if (/^https?:\/\//.test(displayText)) {
          // display text after "[" → +1 char
          links.push(buildLink(i, m.index + 1, m.index + 1 + displayText.length, url));
        }
      }

      BARE_URL.lastIndex = 0;
      while ((m = BARE_URL.exec(line)) !== null) {
        const s = m.index;
        const e = s + m[0].length;
        if (covered.some(([cs, ce]) => s >= cs && e <= ce)) { continue; }

        const url = m[0].replace(/[.,;:!?]+$/, '');
        links.push(buildLink(i, s, s + url.length, url));
      }
    }

    return links;
  }
}

function buildLink(
  line: number,
  colStart: number,
  colEnd: number,
  url: string,
): vscode.DocumentLink {
  const range = new vscode.Range(line, colStart, line, colEnd);
  const target = vscode.Uri.parse(
    `command:md-browser.openUrl?${encodeURIComponent(JSON.stringify([url]))}`
  );
  const link = new vscode.DocumentLink(range, target);
  link.tooltip = `Open in embedded browser: ${url}`;
  return link;
}

export function getUrlAtCursor(
  doc: vscode.TextDocument,
  pos: vscode.Position,
): string | undefined {
  const line = doc.lineAt(pos.line).text;
  const ch = pos.character;

  MD_LINK.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MD_LINK.exec(line)) !== null) {
    if (ch >= m.index && ch <= m.index + m[0].length) {
      return m[2];
    }
  }

  BARE_URL.lastIndex = 0;
  while ((m = BARE_URL.exec(line)) !== null) {
    if (ch >= m.index && ch <= m.index + m[0].length) {
      return m[0].replace(/[.,;:!?]+$/, '');
    }
  }

  return undefined;
}
