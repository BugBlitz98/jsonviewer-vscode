import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('jsonVisualizer.openPanel', async () => {
      const panel = vscode.window.createWebviewPanel(
        'jsonVisualizer',
        'JSON Visualizer',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'media')
          ]
        }
      );

      panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

      // 🔥 Get current active file
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found!');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'json') {
        vscode.window.showErrorMessage('Current file is not a JSON file!');
        return;
      }

      try {
        // 🔥 Read and parse the JSON file content
        const jsonText = document.getText();
        const jsonData = JSON.parse(jsonText);

        // 🔥 Send JSON to Webview
        setTimeout(() => {
          panel.webview.postMessage({
            type: 'setJSON',
            payload: jsonData
          });
        }, 500);
      } catch (error) {
        vscode.window.showErrorMessage('Invalid JSON file or parsing failed.');
      }
    })
  );
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const mediaPath = path.join(extensionUri.fsPath, 'media', 'index.html');
  let html = fs.readFileSync(mediaPath, 'utf8');

  html = html.replace(/(src|href)="\.\/(.*?)"/g, (_, attr, file) => {
    const onDiskPath = vscode.Uri.joinPath(extensionUri, 'media', file);
    const webviewUri = webview.asWebviewUri(onDiskPath);
    return `${attr}="${webviewUri}"`;
  });

  return html;
}

export function deactivate() {}
