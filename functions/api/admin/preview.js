import { json, readJson } from '../../_lib/http.js';
import { markdownToHtml } from '../../_lib/markdown.js';

export async function onRequestPost({ request }) {
  const body = (await readJson(request)) || {};
  return json({ html: markdownToHtml(body.markdown || '') });
}
