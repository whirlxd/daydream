import winston from 'winston';
import type { Actions } from './$types';

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new winston.transports.File({ filename: 'emails.log' })
	]
});

export const actions: Actions = {
	default: async ({ request }) => {
		const { email } = await request.json();

		if (!email) {
			return { success: false, error: 'Email is required' };
		}

		try {
			logger.info({ email, timestamp: new Date().toISOString() });
			return { success: true, message: 'Email logged successfully' };
		} catch (error) {
			return { success: false, error: 'Failed to log email' };
		}
	}
};
