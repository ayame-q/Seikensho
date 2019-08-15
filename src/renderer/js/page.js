const {ipcRenderer} = require('electron');

ipcRenderer.on("data", (event, isPrint, data, config) => {
	console.log(data);
	const elementTime = document.querySelector("#date > time");
	const elementName = document.getElementById("name");
	const elementTitle = document.getElementById("title");
	const elementTotalDd = document.querySelector("#total > dd");
	const elementShop = document.getElementById("shop");
	const elementTable = document.getElementsByTagName("table")[0];

	const date = new Date(data.date);
	elementTime.setAttribute("datetime", date.toISOString());
	elementTime.textContent = date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日";
	if (data.name[1]) {
		elementName.innerHTML = data.name[0] + "<span class='subtitle'>" + data.name[1] + "</span>";
	} else {
		elementName.textContent = data.name[0];
	}
	elementTitle.textContent = data.title;

	elementShop.innerHTML = config.shop;

	let totalPrice, taxPrice;
	if (config.isIncludeTax) {
		totalPrice = data.total;
		taxPrice = fraction(totalPrice / (1 + config.taxRate / 100) * (config.taxRate / 100), config.taxFraction);
	} else {
		taxPrice = fraction(data.total * (config.taxRate / 100), config.taxFraction);
		totalPrice = data.total + taxPrice;
	}
	elementTotalDd.textContent = totalPrice.toLocaleString();

	for (const item of data.items) {
		if (item.product[0]) {
			const date = new Date(item.date);
			let line = "<td class='td-date'>" + (date.getMonth() + 1) + "/" + date.getDate() + "</td><td class='td-product'>" + item.product[0];
			if (item.product[1]) {
				line += "<span class='subtitle'>" + item.product[1] + "</span>";
			}
			line += "</td><td class='td-unitprice num'>" + item.unitPrice.toLocaleString() + "</td><td class='td-number num'>" + item.number.toLocaleString() + "</td><td class='td-total num'>" + item.total.toLocaleString() + "</td><td class='td-note'>" + item.note + "</td>";
			let elementLi = document.createElement("tr");
			elementLi.innerHTML = line;
			elementTable.appendChild(elementLi);
		}
	}
	let lineSubtotal = "<td colspan='3'>小計</td><td class='num'>" + data.count.toLocaleString() + "</td><td class='num'>" + data.total.toLocaleString() + "</td><td rowspan='2'></td>";
	let elementSubtotalLi = document.createElement("tr");
	elementSubtotalLi.innerHTML = lineSubtotal;
	elementTable.appendChild(elementSubtotalLi);
	let lineTaxPrice = "<td colspan='3'>" + (config.isIncludeTax ? "内税" : "消費税") + "</td><td></td><td class='num'>" + taxPrice.toLocaleString() + "</td>";
	let elementTaxPriceLi = document.createElement("tr");
	elementTaxPriceLi.innerHTML = lineTaxPrice;
	elementTable.appendChild(elementTaxPriceLi);
	let lineTotal = "<td colspan='4'>合計</td><td colspan='2' class='num'>" + totalPrice.toLocaleString() + "</td>";
	let elementTotalLi = document.createElement("tr");
	elementTotalLi.setAttribute("id", "totalTr");
	elementTotalLi.innerHTML = lineTotal;
	elementTable.appendChild(elementTotalLi);
	if(isPrint && config.savePath){
		ipcRenderer.send("save", data);
	}
});

function fraction(num, rule="round") {
	switch (rule) {
		case "floor":
			return Math.floor(num);
		case "round":
			return Math.round(num);
		case "ceil":
			return Math.ceil(num);
		default:
			return num;
	}
}