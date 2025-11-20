import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (password !== process.env.ADMIN_PASSWORD && password !== env.ADMIN_PASSWORD) {
			return fail(400, { error: 'Incorrect password' });
		}

		cookies.set('admin_session', 'true', {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 // 1 day
		});

		throw redirect(303, '/stats');
	}
};
