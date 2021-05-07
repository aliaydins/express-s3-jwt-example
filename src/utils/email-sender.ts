import sgMail from '@sendgrid/mail';
import { SENDGRID_API, HOST_EMAIL } from '../constants';

const apiKey = SENDGRID_API;
sgMail.setApiKey(apiKey);

const sendMail = async (email, subject, text, html) => {
	const hostEmail = HOST_EMAIL;
	try {
		const msg = {
			html,
			text,
			subject,
			to: email,
			from: hostEmail,
		};
		await sgMail.send(msg);
		console.log('MAIL_SENT');
	} catch (err) {
		console.log('ERROR_MAILING', err.message);
	} finally {
		return;
	}
};

export default sendMail;
