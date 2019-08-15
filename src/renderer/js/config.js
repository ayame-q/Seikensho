const {ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;

function setConfig() {
	const elementTax = document.getElementById("tax");
	const elementTaxRate = document.getElementById("tax-rate");
	const elementTaxFraction = document.getElementById("tax-fraction");
	const elementSavePath = document.getElementById("save-path");
	const elementShop = document.getElementById("shop");

	ipcRenderer.send("setConfig", {
		isIncludeTax: elementTax.value === "include-tax",
		taxRate: Number(elementTaxRate.value),
		taxFraction: elementTaxFraction.value,
		savePath: elementSavePath.value,
		shop: elementShop.value,
	});
}

ipcRenderer.on("loadConfig", (event, config) => {
	const elementTax = document.getElementById("tax");
	const elementTaxRate = document.getElementById("tax-rate");
	const elementTaxFraction = document.getElementById("tax-fraction");
	const elementSavePath = document.getElementById("save-path");
	const elementShop = document.getElementById("shop");

	if(config.includeTax){
		elementTax.value = "include-tax";
	}else{
		elementTax.value = "without-tax";
	}
	elementTaxRate.value = config.taxRate;
	elementTaxFraction.value = config.taxFraction;
	elementSavePath.value = config.savePath;
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