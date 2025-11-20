import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (event.url.pathname.startsWith('/stats')) {
		const session = event.cookies.get('admin_session');
		
		if (!session) {
			throw redirect(303, '/login');
		}
	}

	const response = await resolve(event);
	return response;
}
