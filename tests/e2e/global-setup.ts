import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const BASE = process.env.HUD_E2E_BASE || 'http://localhost:3000'
const HUD_PASSWORD = process.env.HUD_E2E_PASSWORD
if (!HUD_PASSWORD) {
  throw new Error(
    'HUD_E2E_PASSWORD env var is required for e2e tests. Set it in your shell or CI secret store; do not commit a fallback value.',
  )
}
const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const STORAGE_FILE = path.join(__dirname, '.auth-state.json')

export default async function globalSetup() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  const resp = await ctx.request.post(`${BASE}/api/auth`, {
    data: { password: HUD_PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  })
  if (!resp.ok()) {
    const body = await resp.text()
    throw new Error(`Auth failed: ${resp.status()} ${body}`)
  }
  await ctx.storageState({ path: STORAGE_FILE })
  await browser.close()
}
