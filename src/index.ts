import parse from "node-html-parser";
import axios from "axios";
import { sendMessage } from "./twilio";
import { readFile } from "fs";

const InMemo: string[] = [];
let oldLen = 0;

const search = async () => {
	const res = await axios.get(
		"https://sites.google.com/secitec.mt.gov.br/processoseletivosecitecimt/edital-102022-fic_dev",
	);
	const parsed = parse(res.data, { comment: false });
	const anchors = parsed.querySelectorAll(".n8H08c .XqQF9c")!;
	const links = anchors
		.map((anchor, index, arr) => {
			return anchor.attrs.href;
		})
		.filter((item, index, arr) => arr.indexOf(item) === index);
	const items = parsed.querySelector(".n8H08c")!.childNodes;
	return { links, items };
};

const checkForUpdates = async () => {
	const { items, links } = await search();
	items.forEach((publishment, index) => {
		const content = publishment.innerText;
		const message = `${content} (${links[index] || "Nenhum link disponibilizado"})`;
		if (!InMemo.includes(message)) return InMemo.push(message);
	});
};

setInterval(async () => {
	await checkForUpdates();
	if (InMemo.length === oldLen) {
		return console.log("None update");
	}
	oldLen = InMemo.length;
	readFile("phones.txt", async (err, data) => {
		if (err) return console.log(err);
		const phones = data.toString().split(";");
		for (let index = 0; index < phones.length; index++) {
			if (phones[index]) await sendMessage(InMemo[0], `whatsapp:${phones[index]}`);
		}
	});
}, 1000 * 60 * 5);
