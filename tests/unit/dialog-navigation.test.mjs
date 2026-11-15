// Layer 1 (Spec 0001 §3): the pure dialog navigation module, D1.1–D1.3.
// Runs in plain Node, without Vite or React. Uses a fixture registry so every branch is reachable
// (the real registry has no project without a gallery), plus checks against the real registry.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fechar, MOTIVOS, navegar, voltar } from '../../src/utils/dialogNavigation.js'
import { projects } from '../../src/data/projects.js'

const fixture = [
  { slug: 'com-tudo', galeria: { screens: [{}] }, demo: { buttonLabel: 'DEMO' } },
  { slug: 'sem-demo', galeria: { screens: [{}] }, demo: null },
  { slug: 'sem-galeria', galeria: null, demo: { buttonLabel: 'DEMO' } },
]

const aceito = (resultado, estado, capturarGatilho) => {
  assert.deepEqual(resultado, capturarGatilho === undefined ? { ok: true, estado } : { ok: true, estado, capturarGatilho })
}
const rejeitado = (resultado, motivo) => assert.deepEqual(resultado, { ok: false, motivo })

test('motivos de rejeição são estáveis e documentados', () => {
  assert.deepEqual(Object.values(MOTIVOS).sort(), [
    'estado-atual-invalido', 'estado-malformado', 'sem-demo', 'sem-galeria', 'sem-voltar',
    'slug-desconhecido', 'slug-obrigatorio', 'slug-proibido', 'tipo-desconhecido',
  ])
  assert.ok(Object.isFrozen(MOTIVOS))
})

test('abrir cada tipo a partir de null é aceito e captura o gatilho', () => {
  aceito(navegar(null, { tipo: 'sobre' }, fixture), { tipo: 'sobre' }, true)
  aceito(navegar(null, { tipo: 'contato' }, fixture), { tipo: 'contato' }, true)
  aceito(navegar(null, { tipo: 'projeto', slug: 'com-tudo' }, fixture), { tipo: 'projeto', slug: 'com-tudo' }, true)
  aceito(navegar(null, { tipo: 'galeria', slug: 'com-tudo' }, fixture), { tipo: 'galeria', slug: 'com-tudo' }, true)
  aceito(navegar(null, { tipo: 'demo', slug: 'com-tudo' }, fixture), { tipo: 'demo', slug: 'com-tudo' }, true)
})

test('transições entre dialogs são aceitas sem capturar o gatilho', () => {
  const projeto = { tipo: 'projeto', slug: 'com-tudo' }
  aceito(navegar(projeto, { tipo: 'galeria', slug: 'com-tudo' }, fixture), { tipo: 'galeria', slug: 'com-tudo' }, false)
  aceito(navegar(projeto, { tipo: 'demo', slug: 'com-tudo' }, fixture), { tipo: 'demo', slug: 'com-tudo' }, false)
  aceito(navegar({ tipo: 'sobre' }, { tipo: 'contato' }, fixture), { tipo: 'contato' }, false)
  aceito(navegar({ tipo: 'galeria', slug: 'com-tudo' }, projeto, fixture), projeto, false)
})

test('fechar leva sempre a null, inclusive pela navegação para null', () => {
  aceito(fechar(), null)
  for (const atual of [null, { tipo: 'sobre' }, { tipo: 'contato' }, { tipo: 'projeto', slug: 'com-tudo' }, { tipo: 'galeria', slug: 'com-tudo' }, { tipo: 'demo', slug: 'com-tudo' }]) {
    assert.deepEqual(navegar(atual, null, fixture), { ok: true, estado: null })
  }
})

test('destino null fecha mesmo quando o estado atual é malformado ou inválido (D1.2)', () => {
  // "O destino null (fechar) é sempre válido": closing must never be blocked by a corrupted state.
  for (const atual of [undefined, {}, { tipo: null }, [], 'sobre', { tipo: 'modal' }, { tipo: 'galeria', slug: 'sem-galeria' }, { tipo: 'demo', slug: 'inexistente' }]) {
    assert.deepEqual(navegar(atual, null, fixture), { ok: true, estado: null })
  }
})

test('estados malformados são rejeitados', () => {
  for (const destino of [undefined, {}, { tipo: null }, { tipo: 'sobre', extra: true }, [], 'sobre', 42, { tipo: 'projeto', slug: '' }, { tipo: 'projeto', slug: 7 }]) {
    rejeitado(navegar(null, destino, fixture), MOTIVOS.ESTADO_MALFORMADO)
  }
})

test('tipo desconhecido é rejeitado', () => {
  rejeitado(navegar(null, { tipo: 'modal' }, fixture), MOTIVOS.TIPO_DESCONHECIDO)
  rejeitado(navegar(null, { tipo: 'Projeto', slug: 'com-tudo' }, fixture), MOTIVOS.TIPO_DESCONHECIDO)
})

test('slug é obrigatório em projeto, galeria e demo', () => {
  for (const tipo of ['projeto', 'galeria', 'demo']) rejeitado(navegar(null, { tipo }, fixture), MOTIVOS.SLUG_OBRIGATORIO)
})

test('slug é proibido em sobre e contato', () => {
  for (const tipo of ['sobre', 'contato']) rejeitado(navegar(null, { tipo, slug: 'com-tudo' }, fixture), MOTIVOS.SLUG_PROIBIDO)
})

test('slug desconhecido é rejeitado, sem fallback para outro projeto', () => {
  for (const tipo of ['projeto', 'galeria', 'demo']) rejeitado(navegar(null, { tipo, slug: 'inexistente' }, fixture), MOTIVOS.SLUG_DESCONHECIDO)
})

test('galeria ou demo de um projeto sem esse recurso é rejeitada', () => {
  rejeitado(navegar(null, { tipo: 'galeria', slug: 'sem-galeria' }, fixture), MOTIVOS.SEM_GALERIA)
  rejeitado(navegar(null, { tipo: 'demo', slug: 'sem-demo' }, fixture), MOTIVOS.SEM_DEMO)
  rejeitado(navegar({ tipo: 'projeto', slug: 'sem-demo' }, { tipo: 'demo', slug: 'sem-demo' }, fixture), MOTIVOS.SEM_DEMO)
})

test('estado atual inválido rejeita a transição em vez de seguir com ele', () => {
  rejeitado(navegar({ tipo: 'galeria', slug: 'sem-galeria' }, { tipo: 'sobre' }, fixture), MOTIVOS.ESTADO_ATUAL_INVALIDO)
  rejeitado(navegar({}, { tipo: 'sobre' }, fixture), MOTIVOS.ESTADO_ATUAL_INVALIDO)
  rejeitado(navegar(undefined, { tipo: 'sobre' }, fixture), MOTIVOS.ESTADO_ATUAL_INVALIDO)
})

test('voltar de galeria ou demo leva aos detalhes do mesmo projeto', () => {
  aceito(voltar({ tipo: 'galeria', slug: 'com-tudo' }, fixture), { tipo: 'projeto', slug: 'com-tudo' })
  aceito(voltar({ tipo: 'demo', slug: 'com-tudo' }, fixture), { tipo: 'projeto', slug: 'com-tudo' })
  aceito(voltar({ tipo: 'galeria', slug: 'sem-demo' }, fixture), { tipo: 'projeto', slug: 'sem-demo' })
})

test('voltar sem dialog anterior é rejeitado: null, detalhes, sobre e contato', () => {
  for (const atual of [null, { tipo: 'projeto', slug: 'com-tudo' }, { tipo: 'sobre' }, { tipo: 'contato' }]) {
    rejeitado(voltar(atual, fixture), MOTIVOS.SEM_VOLTAR)
  }
})

test('voltar a partir de estado inválido é rejeitado', () => {
  rejeitado(voltar({ tipo: 'galeria', slug: 'inexistente' }, fixture), MOTIVOS.ESTADO_ATUAL_INVALIDO)
  rejeitado(voltar({ tipo: 'demo' }, fixture), MOTIVOS.ESTADO_ATUAL_INVALIDO)
  rejeitado(voltar(undefined, fixture), MOTIVOS.ESTADO_ATUAL_INVALIDO)
})

test('o estado devolvido é uma cópia nova, sem compartilhar o objeto recebido', () => {
  const destino = { tipo: 'projeto', slug: 'com-tudo' }
  const { estado } = navegar(null, destino, fixture)
  assert.notEqual(estado, destino)
  destino.slug = 'alterado'
  assert.equal(estado.slug, 'com-tudo')
})

test('registro real: os quatro projetos abrem detalhes e galeria; demo só onde existe', () => {
  for (const { slug, demo } of projects) {
    assert.equal(navegar(null, { tipo: 'projeto', slug }, projects).ok, true)
    assert.equal(navegar({ tipo: 'projeto', slug }, { tipo: 'galeria', slug }, projects).ok, true)
    const resultado = navegar({ tipo: 'projeto', slug }, { tipo: 'demo', slug }, projects)
    if (demo) assert.equal(resultado.ok, true)
    else rejeitado(resultado, MOTIVOS.SEM_DEMO)
  }
})

test('módulo é puro: sem imports, React ou DOM', async () => {
  const source = (await readFile(resolve(import.meta.dirname, '../../src/utils/dialogNavigation.js'), 'utf8')).replace(/^\s*\/\/.*$/gm, '')
  assert.doesNotMatch(source, /^\s*import\s|\bimport\(|\brequire\(/m)
  assert.doesNotMatch(source, /<[A-Z][A-Za-z]*[\s/>]|\bdocument\.|\bwindow\.|\bconsole\./)
})
