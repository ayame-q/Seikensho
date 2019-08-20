const {ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;

function setConfig() {
	const elementTax = document.getElementById("tax");
	const elementTaxRate = document.getElementById("tax-rate");
	const elementTaxFraction = document.getElementById("tax-fraction");
	const elementSavePath = document.getElementById("save-path");
	const elementListName = document.getElementById("list-name");
	const elementShop = document.getElementById("shop");

	const arrListName = elementListName.value.split(/\r\n|\r|\n/);
	let listName = [];
	for (data of arrListName){
		console.log(data);
		let match = data.match(/(.+)\s*:\s*(.+)/);
		if(match){
			let subtitles = match[2].split(/\s*,\s*/);
			listName.push({name: match[1], subtitles: subtitles});
		}else{
			listName.push({name: data});
		}
	}

	ipcRenderer.send("setConfig", {
		isIncludeTax: elementTax.value === "include-tax",
		taxRate: Number(elementTaxRate.value),
		taxFraction: elementTaxFraction.value,
		savePath: elementSavePath.value,
		listName: listName,
		shop: elementShop.value,
	});
}

ipcRenderer.on("loadConfig", (event, config) => {
	const elementTax = document.getElementById("tax");
	const elementTaxRate = document.getElementById("tax-rate");
	const elementTaxFraction = document.getElementById("tax-fraction");
	const elementSavePath = document.getElementById("save-path");
	const elementListName = document.getElementById("list-name");
	const elementShop = document.getElementById("shop");

	let listName = "";
	if(config.listName){
		let listNameList = [];
		for (data of config.listName){
			if(data.subtitles){
				listNameList.push(data.name + ": " + data.subtitles.join(", "));
			}else{
				listNameList.push(data.name);
			}
		}
		listName = listNameList.join("\n");
	}

	if(config.includeTax){
		elementTax.value = "include-tax";
	}else{
		elementTax.value = "without-tax";
	}
	elementTaxRate.value = config.taxRate;
	elementTaxFraction.value = config.taxFraction;
	elementSavePath.value = config.savePath;
	elementListName.value = listName;
	elementShop.value = config.shop;
});

function selectDir() {
	const elementSavePath = document.getElementById("save-path");
	let dialogOption = {
		title: "保存先フォルダを選択",
		buttonLabel: "選択",
		properties: ["openDirectory", "createDirectory", "noResolveAliases"]
	};
	if(elementSavePath.value){
		dialogOption.defaultPath = elementSavePath.value;
	}
	dialog.showOpenDialog(dialogOption).then(result =>{
		if(result.filePaths[0]) {
			elementSavePath.value = result.filePaths[0];
		}
	});
}