'use server';
import { promises as fs } from 'fs';
import json5 from 'json5';

export default async function getJson5(name: string) {
const dir = process.cwd()
  const path = `${dir}/json/${name}`;
  console.log(path)
  const bytes = await fs.readFile(path, 'utf-8');
  return json5.parse(bytes);
}