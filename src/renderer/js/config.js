const {ipcRenderer} = require('electron');

function setConfig() {
	const elementTax = document.getElementById("tax");
	const elementTaxRate = document.getElementById("tax-rate");
	const elementTaxFraction = document.getElementById("tax-fraction");
	const elementShop = document.getElementById("shop");
	const isIncludeTax = elementTax.value === "include-tax";
	const taxRate = Number(elementTaxRate.value);
	const taxFraction = elementTaxFraction.value;
	const shop = elementShop.value;
	ipcRenderer.send("setConfig", {isIncludeTax: isIncludeTax, taxRate: taxRate, taxFraction: taxFraction, shop: shop});
}

ipcRenderer.on("loadConfig", (event, config) => {
	const elementTax = document.getElementById("tax");
	const elementTaxRate = document.getElementById("tax-rate");
	const elementTaxFraction = document.getElementById("tax-fraction");
	const elementShop = document.getElementById("shop");

	if(config.includeTax){
		elementTax.value = "include-tax";
	}else{
		elementTax.value = "without-tax";
	}
	elementTaxRate.value = config.taxRate;
	elementTaxFraction.value = config.taxFraction;
	elementShop.value = config.shop;
});