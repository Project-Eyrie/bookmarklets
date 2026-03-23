// Minifies JavaScript and encodes it as a bookmarklet URI using Terser
import { minify } from 'terser';

// Minifies the given JS code and returns it as a javascript: bookmarklet URI
export async function generateBookmarklet(code: string): Promise<string> {
	const result = await minify(code, { mangle: { toplevel: false } });
	const minified = result.code || code;
	return `javascript:${encodeURIComponent(minified)}`;
}
