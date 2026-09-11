import { randomBytes } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Human friendly order code, e.g. CF-7K2M4P. Ambiguous glyphs are excluded. */
export function generateOrderCode(): string {
  const bytes = randomBytes(6)
  let code = ''
  for (const byte of bytes) code += ALPHABET[byte % ALPHABET.length]
  return `CF-${code}`
}
