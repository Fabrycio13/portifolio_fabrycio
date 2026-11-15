// Navegação entre dialogs (Spec 0001, D1.1–D1.3). Módulo puro: sem React e sem DOM.
//
// EstadoDialog = null | { tipo, slug? }
// - null é o único valor de "nenhum dialog aberto";
// - tipo ∈ sobre | contato | projeto | galeria | demo;
// - slug é obrigatório em projeto, galeria e demo, e proibido em sobre e contato.
//
// Toda operação devolve um resultado explícito: { ok: true, estado, ... } ou { ok: false, motivo }.
// Uma rejeição nunca troca de dialog nem cai num fallback: quem chama mantém o estado atual.
// O registro de projetos chega por argumento; daqui só se usam slug, galeria e demo.

export const MOTIVOS = Object.freeze({
  ESTADO_MALFORMADO: 'estado-malformado',
  ESTADO_ATUAL_INVALIDO: 'estado-atual-invalido',
  TIPO_DESCONHECIDO: 'tipo-desconhecido',
  SLUG_OBRIGATORIO: 'slug-obrigatorio',
  SLUG_PROIBIDO: 'slug-proibido',
  SLUG_DESCONHECIDO: 'slug-desconhecido',
  SEM_GALERIA: 'sem-galeria',
  SEM_DEMO: 'sem-demo',
  SEM_VOLTAR: 'sem-voltar',
})

const TIPOS_DO_SITE = new Set(['sobre', 'contato'])
const TIPOS_DE_PROJETO = new Set(['projeto', 'galeria', 'demo'])
// Só galeria e demo têm "voltar": são os tipos de projeto que não são os próprios detalhes.
const TIPOS_COM_VOLTAR = new Set([...TIPOS_DE_PROJETO].filter(tipo => tipo !== 'projeto'))
const CHAVES_PERMITIDAS = new Set(['tipo', 'slug'])

const rejeitar = motivo => ({ ok: false, motivo })

// Valida um EstadoDialog não nulo contra o registro e devolve uma cópia normalizada.
const validar = (estado, projetos) => {
  if (estado === null || typeof estado !== 'object' || Array.isArray(estado)) return rejeitar(MOTIVOS.ESTADO_MALFORMADO)
  if (Object.keys(estado).some(chave => !CHAVES_PERMITIDAS.has(chave))) return rejeitar(MOTIVOS.ESTADO_MALFORMADO)
  if (typeof estado.tipo !== 'string') return rejeitar(MOTIVOS.ESTADO_MALFORMADO)

  const temSlug = estado.slug !== undefined
  if (temSlug && (typeof estado.slug !== 'string' || estado.slug === '')) return rejeitar(MOTIVOS.ESTADO_MALFORMADO)

  if (TIPOS_DO_SITE.has(estado.tipo)) {
    return temSlug ? rejeitar(MOTIVOS.SLUG_PROIBIDO) : { ok: true, estado: { tipo: estado.tipo } }
  }
  if (!TIPOS_DE_PROJETO.has(estado.tipo)) return rejeitar(MOTIVOS.TIPO_DESCONHECIDO)
  if (!temSlug) return rejeitar(MOTIVOS.SLUG_OBRIGATORIO)

  const projeto = projetos.find(item => item.slug === estado.slug)
  if (!projeto) return rejeitar(MOTIVOS.SLUG_DESCONHECIDO)
  if (estado.tipo === 'galeria' && !projeto.galeria) return rejeitar(MOTIVOS.SEM_GALERIA)
  if (estado.tipo === 'demo' && !projeto.demo) return rejeitar(MOTIVOS.SEM_DEMO)

  return { ok: true, estado: { tipo: estado.tipo, slug: estado.slug } }
}

// O estado atual precisa ser null ou um estado válido; qualquer outra coisa é um erro de quem chama.
const validarAtual = (atual, projetos) => {
  if (atual === null) return { ok: true, estado: null }
  const resultado = validar(atual, projetos)
  return resultado.ok ? resultado : rejeitar(MOTIVOS.ESTADO_ATUAL_INVALIDO)
}

// Transição do estado atual para o destino. O gatilho só é capturado ao abrir a partir de null.
export const navegar = (atual, destino, projetos) => {
  // O destino null (fechar) é sempre válido, mesmo com um estado atual corrompido (D1.2).
  if (destino === null) return fechar()

  const anterior = validarAtual(atual, projetos)
  if (!anterior.ok) return anterior

  const resultado = validar(destino, projetos)
  if (!resultado.ok) return resultado
  return { ok: true, estado: resultado.estado, capturarGatilho: anterior.estado === null }
}

// "Voltar" de galeria ou demo reabre os detalhes do mesmo projeto; os demais estados não têm voltar.
export const voltar = (atual, projetos) => {
  const anterior = validarAtual(atual, projetos)
  if (!anterior.ok) return anterior
  if (anterior.estado === null || !TIPOS_COM_VOLTAR.has(anterior.estado.tipo)) return rejeitar(MOTIVOS.SEM_VOLTAR)
  return { ok: true, estado: { tipo: 'projeto', slug: anterior.estado.slug } }
}

// Fechar (inclusive pelo Escape) leva sempre a null.
export const fechar = () => ({ ok: true, estado: null })
