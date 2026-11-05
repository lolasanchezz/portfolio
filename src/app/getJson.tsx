import { promises as fs } from 'fs';
import json5 from 'json5';

// only ever called from server components - reads files out of /json
export default async function getJson5(name: string) {
  const bytes = await fs.readFile(`${process.cwd()}/json/${name}`, 'utf-8');
  return json5.parse(bytes);
}

