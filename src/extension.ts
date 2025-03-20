import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Path from 'path';

var debug: boolean = true;
var globalContext: vscode.ExtensionContext;

function print(input: any) {
	if (debug) return;
	input = input.toString();
	console.log("dexcom-monitor: LOG: " + input);
}

export function activate(context: vscode.ExtensionContext) {
	print("dexcom-monitor is active");
	globalContext = context;

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'dexcom-monitor.sidebar',
			new SidebarProvider(context),
		)
	);
}

class SidebarProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;
	constructor(private readonly _context: vscode.ExtensionContext) {}

	resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	) {
		this._view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._context.extensionUri]
		};
	
		webviewView.webview.html = getHtmlForWebview(webviewView.webview, context);
	}
}

function getHtmlForWebview(webview: vscode.Webview, context: any): string {
	try {
		const file = vscode.Uri.file(Path.join(globalContext.extensionPath, 'src', 'sidebar.html')).fsPath;
		print("getting sidebar from path " + file);
		var data = fs.readFileSync(file, 'utf8');

		const username: string = vscode.workspace.getConfiguration('dexcom-monitor').get<string>('username') ?? "none";
		const password: string = vscode.workspace.getConfiguration('dexcom-monitor').get<string>('password') ?? "none";

		data = data.replace("{{debug}}", debug.toString()).replace("{{username}}", username).replace("{{password}}", password);
		return data;
	} catch (e) {
		return "Error: " + e;
	}
}

export function deactivate() {
	print("deactivating...");
}
