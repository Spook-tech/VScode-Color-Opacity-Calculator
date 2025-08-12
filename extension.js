const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('colorOpacityCalculator.open', async function () {
        const panel = vscode.window.createWebviewPanel(
            'colorOpacityCalculator',
            'Color Opacity Calculator',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'convert':
                        const result = convertColorWithOpacity(message.color, message.opacity);
                        panel.webview.postMessage({ command: 'result', result: result });
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function convertColorWithOpacity(color, opacity) {
    const hex = color.replace('#', '');
    const clampedOpacity = Math.min(opacity, 100);
    const alpha = Math.round((clampedOpacity / 100) * 255);
    const alphaHex = alpha.toString(16).toUpperCase().padStart(2, '0');
    return `#${hex.toUpperCase()}${alphaHex}`;
}

function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Color Opacity Calculator</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                padding: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            .container {
                max-width: 400px;
                margin: 0 auto;
            }
            .input-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            input {
                width: 100%;
                padding: 8px;
                border: 1px solid var(--vscode-input-border);
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border-radius: 4px;
                font-size: 14px;
            }
            button {
                width: 100%;
                padding: 10px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .result {
                margin-top: 20px;
                padding: 15px;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: 4px;
                border: 1px solid var(--vscode-panel-border);
            }
            .result-label {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .result-value {
                font-family: monospace;
                font-size: 16px;
                user-select: all;
            }
            .color-preview {
                width: 100%;
                height: 40px;
                margin-top: 10px;
                border-radius: 4px;
                border: 1px solid var(--vscode-panel-border);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Color Opacity Calculator</h2>
            
            <div class="input-group">
                <label for="color">Color (HEX)</label>
                <input type="text" id="color" placeholder="#FFFFFF" value="#FFFFFF">
            </div>
            
            <div class="input-group">
                <label for="opacity">Opacity (%)</label>
                <input type="number" id="opacity" min="0" placeholder="30" value="30">
            </div>
            
            <button onclick="convert()">Calculate</button>
            
            <div class="result" id="result" style="display: none;">
                <div class="result-label">Result:</div>
                <div class="result-value" id="resultValue"></div>
                <div class="color-preview" id="colorPreview"></div>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            function convert() {
                const color = document.getElementById('color').value;
                let opacity = parseInt(document.getElementById('opacity').value);
                
                if (!color.match(/^#[0-9A-Fa-f]{6}$/)) {
                    alert('Please enter a valid hex color (e.g., #FFFFFF)');
                    return;
                }
                
                if (isNaN(opacity) || opacity < 0) {
                    alert('Please enter opacity 0 or greater');
                    return;
                }
                
                if (opacity > 100) {
                    opacity = 100;
                    document.getElementById('opacity').value = 100;
                }
                
                vscode.postMessage({
                    command: 'convert',
                    color: color,
                    opacity: opacity
                });
            }

            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'result':
                        document.getElementById('result').style.display = 'block';
                        document.getElementById('resultValue').textContent = message.result;
                        let opacity = parseInt(document.getElementById('opacity').value);
                        opacity = Math.min(opacity, 100) / 100;
                        const color = document.getElementById('color').value;
                        document.getElementById('colorPreview').style.backgroundColor = color;
                        document.getElementById('colorPreview').style.opacity = opacity;
                        break;
                }
            });

            document.getElementById('color').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') convert();
            });
            
            document.getElementById('opacity').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') convert();
            });
        </script>
    </body>
    </html>`;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}