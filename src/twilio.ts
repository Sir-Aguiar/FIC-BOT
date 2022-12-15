import { Twilio } from "twilio";
import "dotenv/config";
const client = new Twilio(process.env.TWILIO_TEST_SID!, process.env.TWILIO_TEST_AUTH!);

export const sendMessage = async (message: string, to: string) => {
	try {
		const response = await client.messages.create({
			body: message,
			from: process.env.TWILIO_PHONE,
			to,
		});
		console.log(response.sid);
	} catch (e: any) {
		console.log(e);
	}
};
