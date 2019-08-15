const {ipcRenderer} = require('electron');

function make() {
	const elementForm = document.getElementsByTagName("form")[0];
	const elementName1 = document.getElementById("name-1");
	const elementName2 = document.getElementById("name-2");
	const elementTitle = document.getElementById("title");
	const elementDate = document.getElementById("date");
	const elementItems = document.getElementsByClassName("item");
	const elementIsPrint = document.getElementById("isPrint");

	const isPrint = elementIsPrint.value === "true";
	const type = elementForm.type.value;
	const name1 = elementName1.value;
	const name2 = elementName2.value;
	const title = elementTitle.value;
	const date = elementDate.value;
	let items = [];
	let count = 0;
	let total = 0;
	for (const elementItem of elementItems){
		const elementItemDate = elementItem.getElementsByClassName("date")[0];
		const elementItemProduct1 = elementItem.getElementsByClassName("product-1")[0];
		const elementItemProduct2 = elementItem.getElementsByClassName("product-2")[0];
		const elementPrice = elementItem.getElementsByClassName("price")[0];
		const elementNumber = elementItem.getElementsByClassName("number")[0];
		const elementNote = elementItem.getElementsByClassName("note")[0];
		const item = {
			date: elementItemDate.value,
			product: [elementItemProduct1.value, elementItemProduct2.value],
			unitPrice: Number(elementPrice.value),
			number: Number(elementNumber.value),
			note: elementNote.value,
			total: Number(elementPrice.value) * Number(elementNumber.value),
		};
		items.push(item);
		count += item.number;
		total += item.total;
	}
	const data = {
		type: type,
		name: [name1, name2],
		title: title,
		date: date,
		total: total,
		count: count,
		items: items,
	};
	ipcRenderer.send("openPageWindow", type, isPrint, data);
}