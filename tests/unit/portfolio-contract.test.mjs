// Legacy references kept until Stage 7 of Spec 0001 (D1.12 and D1.13): the registry still points at
// project-01..03.webp. Stage 7 removes those references and, with them, these assertions. The rest of
// the former contract lives in project-journey-, scene-, app-shell- and project-dialogs-contract
// (destination of each rule: tests/unit/RASTREABILIDADE.md, section T6.5).
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { test } from 'node:test'

const root = resolve(import.meta.dirname, '../..')

const read = relativePath => readFile(resolve(root, relativePath), 'utf8')

test('registro ainda referencia project-03.webp (Etapa 7)', async () => {
  const projects = await read('src/data/projects.js')

  assert.match(projects, /project-03\.webp/)
})

test('registro ainda referencia project-01.webp e project-02.webp (Etapa 7)', async () => {
  const projectsData = await read('src/data/projects.js')

  assert.match(projectsData, /image: '\/images\/projects\/project-01\.webp'/)
  assert.match(projectsData, /image: '\/images\/projects\/project-02\.webp'/)
})
