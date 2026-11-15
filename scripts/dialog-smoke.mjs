#!/usr/bin/env node
// Browser smoke for dialog accessibility and interaction (Spec 0001 §7.4, layer 3). Local only, outside CI.
// Record a baseline:  node scripts/dialog-smoke.mjs <preview-url> --record=<file.json outside the repo>
// Check a candidate:  node scripts/dialog-smoke.mjs <preview-url> --baseline=<file.json> [--out=<file.json>]
// Mandatory checks must pass; recorded observations (initial-focus identity, semantics, iframe C2/C3)
// must equal the baseline. Uses real CDP keyboard and mouse input.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { launchChrome, wait } from './cdp.mjs'
import { describeEnvironment } from './run-environment.mjs'

const args = process.argv.slice(2)
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const baseUrl = args.find(arg => !arg.startsWith('--'))
const recordFile = option('record')
const baselineFile = option('baseline')
if (!baseUrl || (!recordFile && !baselineFile)) {
  console.error('Uso: node scripts/dialog-smoke.mjs <preview-url> (--record=<json> | --baseline=<json> [--out=<json>])')
  process.exit(1)
}

const viewports = [
  { id: 'desktop', width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
  { id: 'mobile', width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
]
const projects = ['people', 'cindy', 'phx', 'nexus']

// In-page helpers, installed after every navigation. The focusable selector mirrors src/utils/focus.js.
const helpers = `window.__smoke = {
  focusableSelector: 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  dialogs: () => [...document.querySelectorAll('[role="dialog"]')],
  dialog: () => document.querySelector('[role="dialog"]'),
  focusables: root => [...root.querySelectorAll(__smoke.focusableSelector)].filter(el => el.getClientRects().length > 0),
  identity: el => {
    if (!el) return null
    const d = __smoke.dialog()
    const list = d ? __smoke.focusables(d) : []
    return { tag: el.tagName.toLowerCase(), classes: el.className && typeof el.className === 'string' ? el.className : '',
      text: (el.innerText || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 80),
      ariaLabel: el.getAttribute('aria-label'), position: list.includes(el) ? (list.indexOf(el) + 1) + '/' + list.length : null }
  },
  where: () => {
    const active = document.activeElement, d = __smoke.dialog()
    if (!d) return 'no-dialog'
    if (active && active.tagName === 'IFRAME' && d.contains(active)) return 'iframe'
    return d.contains(active) ? 'dialog' : 'outside'
  },
  waitFor: async (test, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (test()) return true; await new Promise(r => setTimeout(r, 50)) } return false },
}; true`

const keys = {
  Tab: { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 },
  Escape: { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 },
  Enter: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
  Space: { key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: ' ' },
}

const checks = []
const observations = {}
const check = (id, pass, detail = null) => {
  checks.push({ id, pass: Boolean(pass), detail })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${detail && !pass ? ` — ${JSON.stringify(detail)}` : ''}`)
}

const run = async () => {
  const page = await launchChrome({ port: Number(option('port') ?? 9261) })
  const press = async (name, shift = false) => {
    const base = { ...keys[name], modifiers: shift ? 8 : 0 }
    await page.send('Input.dispatchKeyEvent', { type: base.text ? 'keyDown' : 'rawKeyDown', ...base })
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base, text: undefined })
    await wait(250)
  }
  const js = expression => page.evaluate(expression)
  // Real mouse click at the centre of the element returned by `elementExpression`.
  const clickAt = async elementExpression => {
    const rect = await js(`(() => { const r = (${elementExpression}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })()`)
    for (const type of ['mousePressed', 'mouseReleased']) {
      await page.send('Input.dispatchMouseEvent', { type, x: rect.x, y: rect.y, button: 'left', clickCount: 1 })
    }
    await wait(300)
  }
  // Accessibility role and computed name of the open dialog, read from Chrome's accessibility tree.
  const dialogSemantics = async () => {
    const { result } = await page.send('Runtime.evaluate', { expression: '__smoke.dialog()' })
    const tree = await page.send('Accessibility.getPartialAXTree', { objectId: result.objectId, fetchRelatives: false })
    const node = tree.nodes[0]
    const attrs = await js(`(() => { const d = __smoke.dialog(); const ids = (d.getAttribute('aria-labelledby') || '').split(/\\s+/).filter(Boolean);
      return { ariaModal: d.getAttribute('aria-modal'), labelledBy: ids.map(id => ({ id, count: document.querySelectorAll('[id="' + id + '"]').length,
        text: (document.getElementById(id)?.textContent || '').trim() })), ariaLabel: d.getAttribute('aria-label'), dialogCount: __smoke.dialogs().length } })()`)
    return { role: node.role?.value, name: node.name?.value ?? '', ...attrs }
  }

  const fresh = async () => {
    const loaded = page.waitForEvent('Page.loadEventFired')
    await page.send('Page.navigate', { url: baseUrl })
    await loaded
    await js(helpers)
    await wait(1200)
  }
  const goProjects = async () => {
    await js(`document.querySelector('#projetos').scrollIntoView({ behavior: 'instant' })`)
    await js(`__smoke.waitFor(() => document.querySelectorAll('.project-journey__card').length === 4)`)
    await wait(600)
  }
  const openDialogAndSettle = async () => {
    await js('__smoke.waitFor(() => __smoke.dialogs().length === 1)')
    await wait(400) // initial focus is applied on the next animation frame
  }
  // Opens a dialog the way a keyboard user would and remembers the trigger element in the page.
  const open = async dialogId => {
    await fresh()
    const [kind, slug] = dialogId.split('-')
    if (kind === 'sobre' || kind === 'contato') {
      const label = kind === 'sobre' ? 'Sobre' : 'Contato'
      await js(`window.__trigger = [...document.querySelectorAll('a.menu-link')].find(a => a.textContent.includes('${label}')); __trigger.focus(); true`)
      await press('Enter')
      await openDialogAndSettle()
      return
    }
    await goProjects()
    await js(`window.__trigger = document.querySelectorAll('.project-journey__card')[${projects.indexOf(slug)}]; __trigger.focus(); true`)
    await press('Enter')
    await openDialogAndSettle()
    if (kind === 'galeria') {
      await js(`document.querySelector('[role="dialog"] .project-gallery-preview').click()`)
      await openDialogAndSettle()
    }
    if (kind === 'demo') {
      await js(`document.querySelector('[role="dialog"] .project-demo-cta').click()`)
      await openDialogAndSettle()
    }
  }

  const dialogIds = [
    ...projects.map(slug => `detalhes-${slug}`),
    ...projects.map(slug => `galeria-${slug}`),
    'sobre', 'contato',
    ...['cindy', 'phx', 'nexus'].map(slug => `demo-${slug}`),
  ]

  try {
    await page.send('Accessibility.enable')
    for (const viewport of viewports) {
      await page.send('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: viewport.deviceScaleFactor, mobile: viewport.mobile })
      await page.send('Emulation.setTouchEmulationEnabled', viewport.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false })
      const v = viewport.id

      // A0 + A: per dialog semantics, initial focus, focus trap and Escape.
      for (const id of dialogIds) {
        await open(id)
        const semantics = await dialogSemantics()
        observations[`${v}/${id}/semantics`] = semantics
        check(`${v}/${id}/A0-papel`, semantics.role === 'dialog', semantics.role)
        check(`${v}/${id}/A0-aria-modal`, semantics.ariaModal === 'true', semantics.ariaModal)
        check(`${v}/${id}/A0-nome`, semantics.name.length > 0 && semantics.labelledBy.every(l => l.count === 1 && l.text), semantics.labelledBy)
        check(`${v}/${id}/A0-unico`, semantics.dialogCount === 1, semantics.dialogCount)

        observations[`${v}/${id}/initialFocus`] = await js('__smoke.identity(document.activeElement)')
        check(`${v}/${id}/A-foco-inicial-dentro`, (await js('__smoke.where()')) === 'dialog')

        const tabLast = await js(`(() => { const l = __smoke.focusables(__smoke.dialog()); l.at(-1).focus(); return l.length })()`)
        await press('Tab')
        check(`${v}/${id}/A-tab-ultimo-volta-ao-primeiro`, await js('document.activeElement === __smoke.focusables(__smoke.dialog())[0]'), { focusables: tabLast, now: await js('__smoke.identity(document.activeElement)') })
        await js('__smoke.focusables(__smoke.dialog())[0].focus()')
        await press('Tab', true)
        check(`${v}/${id}/A-shift-tab-primeiro-vai-ao-ultimo`, await js('document.activeElement === __smoke.focusables(__smoke.dialog()).at(-1)'), await js('__smoke.identity(document.activeElement)'))

        await js('__smoke.focusables(__smoke.dialog())[0].focus()')
        await press('Escape')
        const afterEscape = await js(`({ dialogs: __smoke.dialogs().length, scene: !!document.querySelector('main#top .hero'), focusOnTrigger: document.activeElement === window.__trigger })`)
        check(`${v}/${id}/A-escape-fecha`, afterEscape.dialogs === 0 && afterEscape.scene, afterEscape)
        check(`${v}/${id}/A-escape-devolve-foco`, afterEscape.focusOnTrigger, afterEscape)
      }

      // C: Escape and focus with focus inside the same-origin demo iframes (Cindy, Phx).
      for (const slug of ['cindy', 'phx']) {
        await open(`demo-${slug}`)
        const focusedInside = await js(`(() => { const f = __smoke.dialog().querySelector('iframe'); const doc = f.contentDocument; const el = doc && [...doc.querySelectorAll(__smoke.focusableSelector)].find(e => e.getClientRects().length);
          if (!el) return false; f.contentWindow.focus(); el.focus(); return doc.activeElement === el })()`)
        await press('Escape')
        observations[`${v}/demo-${slug}/C2-escape-dentro-do-iframe`] = { focusedInside, dialogClosed: (await js('__smoke.dialogs().length')) === 0 }
        if ((await js('__smoke.dialogs().length')) === 0) await open(`demo-${slug}`)

        await js(`(() => { const f = __smoke.dialog().querySelector('iframe'); const doc = f.contentDocument; const list = [...doc.querySelectorAll(__smoke.focusableSelector)].filter(e => e.getClientRects().length); f.contentWindow.focus(); list.at(-1).focus(); return list.length })()`)
        const path = []
        for (let step = 0; step < 3; step++) {
          await press('Tab')
          path.push(await js('__smoke.where()'))
        }
        await js(`(() => { const f = __smoke.dialog()?.querySelector('iframe'); if (!f) return; const doc = f.contentDocument; const first = [...doc.querySelectorAll(__smoke.focusableSelector)].find(e => e.getClientRects().length); f.contentWindow.focus(); first.focus() })()`)
        await press('Tab', true)
        observations[`${v}/demo-${slug}/C3-tab-a-partir-do-iframe`] = { tabFromLast: path, shiftTabFromFirst: await js('__smoke.where()') }

        if ((await js('__smoke.dialogs().length')) === 0) await open(`demo-${slug}`)
        await js('__smoke.focusables(__smoke.dialog())[0].focus()')
        await press('Escape')
        check(`${v}/demo-${slug}/C4-escape-no-chrome-fecha-e-devolve-foco`, await js('__smoke.dialogs().length === 0 && document.activeElement === window.__trigger'))
      }

      // B: navigation chains and return to the original trigger.
      await open('detalhes-cindy')
      const titleId = await js(`__smoke.dialog().getAttribute('aria-labelledby')`)
      await js(`document.querySelector('[role="dialog"] .project-gallery-preview').click()`)
      await openDialogAndSettle()
      await js(`document.querySelector('[role="dialog"] .people-gallery__back').click()`)
      await openDialogAndSettle()
      const backFromGallery = await js(`__smoke.dialog().getAttribute('aria-labelledby')`)
      await js(`document.querySelector('[role="dialog"] .project-demo-cta').click()`)
      await openDialogAndSettle()
      await js(`[...__smoke.dialog().querySelectorAll('button')].find(b => b.textContent.includes('Voltar ao projeto')).click()`)
      await openDialogAndSettle()
      const backFromDemo = await js(`__smoke.dialog().getAttribute('aria-labelledby')`)
      await press('Escape')
      check(`${v}/B-cadeia-voltar-mesmo-projeto`, backFromGallery === titleId && backFromDemo === titleId, { titleId, backFromGallery, backFromDemo })
      check(`${v}/B-cadeia-escape-devolve-foco-ao-card`, await js('__smoke.dialogs().length === 0 && document.activeElement === window.__trigger'))

      await fresh()
      await goProjects()
      await js(`window.__trigger = document.querySelectorAll('.project-journey__card')[0]; __trigger.focus(); true`)
      await press('Space')
      await openDialogAndSettle()
      await press('Escape')
      check(`${v}/B-space-abre-e-escape-devolve-foco`, await js('__smoke.dialogs().length === 0 && document.activeElement === window.__trigger'))

      await fresh()
      await goProjects()
      await js(`window.__trigger = document.querySelectorAll('.project-journey__card')[2]; __trigger.scrollIntoView({ block: 'center', behavior: 'instant' }); true`)
      await wait(400)
      await clickAt('window.__trigger')
      await openDialogAndSettle()
      const clickOpened = await js('__smoke.dialogs().length === 1')
      await js(`document.querySelector('[role="dialog"] .info-panel__close').click()`)
      await wait(300)
      check(`${v}/B-clique-abre-e-fechar-devolve-foco`, clickOpened && await js('__smoke.dialogs().length === 0 && document.activeElement === window.__trigger'), { clickOpened })

      await open('detalhes-people')
      await js(`document.querySelector('[role="dialog"] .project-gallery-preview').click()`)
      await openDialogAndSettle()
      const eyebrow = await js(`__smoke.dialog().querySelector('.people-gallery__eyebrow')?.textContent ?? null`)
      check(`${v}/B-previa-people-abre-galeria-people`, /^PEOPLE/.test(eyebrow ?? ''), eyebrow)

      await open('sobre')
      await js(`document.querySelector('[role="dialog"] .about-contact-cta').click()`)
      await openDialogAndSettle()
      const contactOpen = await js(`__smoke.dialog().id`)
      await press('Escape')
      check(`${v}/B-sobre-contato-escape-devolve-ao-menu`, contactOpen === 'contato' && await js('__smoke.dialogs().length === 0 && document.activeElement === window.__trigger'), { contactOpen })

      await fresh()
      await js(`window.__trigger = document.querySelector('.hero__cta--contact'); __trigger.focus(); true`)
      await press('Enter')
      await openDialogAndSettle()
      const contactFromHero = await js(`({ id: __smoke.dialog()?.id, scene: !!document.querySelector('main#top .hero') })`)
      await press('Escape')
      check(`${v}/B-hero-contato-preserva-cena-e-devolve-foco`, contactFromHero.id === 'contato' && contactFromHero.scene && await js('document.activeElement === window.__trigger'), contactFromHero)

      await fresh()
      const exploreHref = await js(`document.querySelector('.hero__cta:not(.hero__cta--contact)').getAttribute('href')`)
      check(`${v}/B-explorar-aponta-para-servicos`, exploreHref === '#servicos', exploreHref)

      await open('galeria-cindy')
      const counter = () => js(`__smoke.dialog().querySelector('figcaption span').textContent`)
      const first = await counter()
      await js(`__smoke.dialog().querySelector('.people-gallery__arrow--previous').click()`)
      await wait(200)
      const wrappedBack = await counter()
      await js(`__smoke.dialog().querySelector('.people-gallery__arrow--next').click()`)
      await wait(200)
      const wrappedForward = await counter()
      await js(`__smoke.dialog().querySelector('.people-gallery__arrow--next').click()`)
      await wait(200)
      await js(`document.querySelector('[role="dialog"] .people-gallery__back').click()`)
      await openDialogAndSettle()
      await js(`document.querySelector('[role="dialog"] .project-gallery-preview').click()`)
      await openDialogAndSettle()
      const reopened = await counter()
      const total = first.split('/')[1].trim()
      check(`${v}/B-galeria-circular-e-reinicia`, first.startsWith('01') && wrappedBack.startsWith(total) && wrappedForward.startsWith('01') && reopened.startsWith('01'), { first, wrappedBack, wrappedForward, reopened })

      await open('demo-nexus')
      const issuesBefore = page.runtimeIssues.length
      const before = await js(`__smoke.dialog().querySelector('[aria-current="page"]')?.textContent.trim()`)
      await js(`[...__smoke.dialog().querySelectorAll('nav button, nav a')].find(b => !b.hasAttribute('aria-current'))?.click()`)
      await wait(2500)
      const after = await js(`__smoke.dialog().querySelector('[aria-current="page"]')?.textContent.trim()`)
      check(`${v}/B-nexus-navegacao-troca-secao`, before && after && before !== after && page.runtimeIssues.length === issuesBefore, { before, after, issues: page.runtimeIssues.slice(issuesBefore) })
    }
  } finally {
    page.close()
  }

  const report = {
    kind: 'dialog-smoke',
    ...describeEnvironment({ browser: page.browser, url: baseUrl, command: `node scripts/dialog-smoke.mjs ${args.join(' ')}` }),
    reducedMotion: 'no-preference',
    viewports,
    observations,
    checks,
  }

  if (baselineFile) {
    const baseline = JSON.parse(readFileSync(baselineFile, 'utf8'))
    for (const [key, value] of Object.entries(baseline.observations)) {
      check(`igual-a-baseline/${key}`, JSON.stringify(value) === JSON.stringify(observations[key]), { baseline: value, atual: observations[key] })
    }
  }

  const target = recordFile ?? option('out')
  if (target) {
    mkdirSync(dirname(resolve(target)), { recursive: true })
    writeFileSync(resolve(target), JSON.stringify(report, null, 2))
  }
  const failed = checks.filter(item => !item.pass)
  console.log(`${checks.length - failed.length}/${checks.length} verificações aprovadas`)
  if (failed.length) process.exitCode = 1
}

run().catch(error => {
  console.error(error.stack ?? error.message)
  process.exitCode = 1
})
