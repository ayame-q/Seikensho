const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require("fs");

let debugMode = false;
if(process.argv[2] === "debug"){
	debugMode = true;
}

let mainWindow;
let configWindow;

// 設定ファイルを保存するファイル
let configFile = path.join(
	app.getPath('userData'), 'config.json'
);

// 保存しておいた設定項目の取得
let config = null;
try {
	config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
} catch (e) {

}

// ウィンドウサイズを保存するファイル
let boundsFile = path.join(
	app.getPath('userData'), 'bounds.json'
);

// 保存しておいたウィンドウサイズの取得
let bounds = null;
try {
	bounds = JSON.parse(fs.readFileSync(boundsFile, 'utf8'));
} catch (e) {
	bounds = {
		mainwindow: {"width":1024, "height":768},
		pagewindow: {"width":1024, "height":768}
	};
}



app.on("ready", function () {
	mainWindow = new BrowserWindow(Object.assign(bounds.mainwindow,{
		webPreferences: {
			nodeIntegration: true
		}
	}));

	mainWindow.loadFile("src/renderer/index.html");

	const menuTemplate = [
		{
			label: 'ファイル',
			submenu: [
				{
					label: '開く',
					accelerator: 'CmdOrCtrl+O',
					click(item, focusedWindow, focusedWebContents) {
						openFileOpenWindow();
					}
				},
				{role: 'recentDocuments', label: "最近使用したファイルを開く"},
			]
		},
		{
			label: '編集',
			submenu: [
				{role: 'undo', label: "元に戻す"},
				{role: 'redo', label: "やり直し"},
				{type: 'separator'},
				{role: 'cut', label: "切り取り"},
				{role: 'copy', label: "コピー"},
				{role: 'paste', label: "貼り付け"},
				{role: 'selectAll', label: "すべて選択"},
			]
		},
		{
			label: '表示',
			submenu: [
				{role: 'resetzoom', label: "実際のサイズ"},
				{role: 'zoomin', label: "拡大"},
				{role: 'zoomout', label: "縮小"},
				{type: 'separator'},
				{role: 'togglefullscreen', label: "フルスクリーンにする"}
			]
		},
		{
			role: 'window',
			label: 'ウインドウ',
			submenu: [
				{role: 'minimize', label: "最小化"},
				{role: 'close', label: "閉じる"}
			]
		}
	];

	if(debugMode === true){
		menuTemplate[2].submenu.unshift(
			{role: 'reload'},
			{role: 'forcereload'},
			{role: 'toggledevtools'},
			{type: 'separator'},)
	}

	if (process.platform === 'darwin') {
		menuTemplate.unshift({
			label: app.getName(),
			submenu: [
				{role: 'about', label: app.getName() + "について"},
				{type: 'separator'},
				{
					label: "設定",
					accelerator: 'CmdOrCtrl+,',
					click(item, focusedWindow, focusedWebContents) {
						openConfigWindow();
					}
				},
				{type: 'separator'},
				{role: 'hide', label: app.getName() + "を隠す"},
				{role: 'hideOthers', label: "ほかを隠す"},
				{role: 'unhide', label: "すべてを表示"},
				{type: 'separator'},
				{role: 'quit', label: app.getName() + "を終了"}
			]
		});

		// 編集メニュー
		menuTemplate[2].submenu.push(
			{type: 'separator'},
			{
				label: 'スピーチ',
				submenu: [
					{role: 'startspeaking', label: "読み上げを開始"},
					{role: 'stopspeaking', label: "読み上げを停止"}
				]
			}
		);

		// ウインドウメニュー
		menuTemplate[4].submenu = [
			{role: 'close', label: '閉じる'},
			{role: 'minimize', label: 'しまう'},
			{role: 'zoom', label: '拡大/縮小'},
			{type: 'separator'},
			{role: 'front', label: 'すべてを手前に移動'}
		]
	} else {
		menuTemplate.push({
			label: "ツール",
			submenu: [
				{
					label: "設定",
					accelerator: 'CmdOrCtrl+,',
					click(item, focusedWindow, focusedWebContents) {
						openConfigWindow();
					}
				}
			]
		});
		menuTemplate.push({
			label: "ヘルプ",
			submenu: [
				{
					label: "バージョン情報",
					click(item, focusedWindow, focusedWebContents) {
						dialog.showMessageBox({
							message: app.getName(),
							detail: "バージョン: " + app.getVersion() + "\nAuthor: " + require('../package.json').author
						})
					}
				}
			]
		});
	}


	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);

	// メインウインドウが閉じられる前の処理
	mainWindow.on('close', () => {
		bounds.mainwindow = mainWindow.getBounds();
		fs.writeFileSync(
			boundsFile, JSON.stringify(bounds)
		);
	});

	if(config === null){
		openConfigWindow();
	}
});

ipcMain.on("openPageWindow", (event, type, isPrint, data) => {
	let pageWindow = new BrowserWindow(Object.assign(bounds.pagewindow,{
		show: false,
		webPreferences: {
			nodeIntegration: true
		}
	}));
	switch (type) {
		case "bill":
			pageWindow.loadFile("src/renderer/bill.html");
			break;
		case "estimate":
			pageWindow.loadFile("src/renderer/estimate.html");
			break;
		case "deliverynote":
			pageWindow.loadFile("src/renderer/deliverynote.html");
			break;
		default:
			alert("Error!");
	}
	pageWindow.webContents.on("did-finish-load", (event) => {
		pageWindow.webContents.send("data", isPrint, data, config);
		if(isPrint){
			setTimeout(() => {
				pageWindow.webContents.print({silent: true, printBackground:true}, () => {
					pageWindow.close()
				});
			}, 1000);
		}else{
			pageWindow.show();
		}
	});
	pageWindow.on('close', () => {
		bounds.pagewindow = pageWindow.getBounds();
	});
});

ipcMain.on("setConfig", (event, data) => {
	config = data;
	fs.writeFileSync(
		configFile, JSON.stringify(config)
	);
	configWindow.close();
	mainWindow.reload();
});

ipcMain.on("save", (event, data, filePath=null) => {
	if(filePath){
		fs.writeFile(filePath, JSON.stringify(data), () => {});
	} else {
		let typeText;
		switch (data.type) {
			case "bill":
				typeText = "請求書";
				break;
			case "estimate":
				typeText = "見積書";
				break;
			case "deliverynote":
				typeText = "納品書";
				break;
		}
		filePath = path.join(
			config.savePath, typeText + " - " + data.date + " - " + data.name[0] + ( data.name[1] ? "("+data.name[1]+")" : "" )
		);
		fs.writeFile(makeFilePath(filePath), JSON.stringify(data), () => {});
	}

});

function makeFilePath(filePath, num=1) {
	try{
		fs.statSync(num === 1 ? filePath + ".skn" : filePath + " " + num + ".skn");
	} catch (e) {
		if(e.code === "ENOENT"){
			return (num === 1 ? filePath + ".skn" : filePath + " " + num + ".skn");
		}
	}
	num++;
	return makeFilePath(filePath, num)
}

function openConfigWindow() {
	configWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		}
	});
	configWindow.loadFile("src/renderer/config.html");
	configWindow.webContents.on("did-finish-load", (event) => {
		configWindow.webContents.send("loadConfig", config);
	});
}

function openFileOpenWindow() {
	const filePaths = dialog.showOpenDialogSync({
		filters: [
			{ name: 'Seikenshoファイル', extensions: ['skn'] }
		],
		properties: ["openFile"]
	});
	if(filePaths[0]){
		app.addRecentDocument(filePaths[0]);
		const data = fs.readFileSync(filePaths[0], 'utf8');
		mainWindow.webContents.send("openData", JSON.parse(data));
	}
}

ipcMain.on("openFileOpenWindow", () => {
	openFileOpenWindow();
});

