/**
 * 内置汉化引擎
 * ----------------
 * 译文来自林雷（LinLei_Baruch）的油猴汉化脚本，并针对本仓库新增的无限层内容做了补全。
 * 游戏逻辑中的英文标识符、存档键名一律不改；只在 DOM 呈现层把英文替换为中文，
 * 因此对存档兼容性、数值计算和 Vue 响应式状态都没有影响。
 */
import { baseDictionary, cnPrefix, cnPostfix, cnExcludeWhole, baseRegReplace } from './dictionary'
import { extraDictionary, termDictionary } from './extra'

const STORAGE_KEY = 'beyond-the-limits-chinese'

type Rule = [RegExp, string]

const dictionary: Record<string, string> = { ...baseDictionary, ...extraDictionary }

// 旧脚本的前后缀规则中，非空白部分当作术语替换；纯空白由本引擎原样保留。
const prefixTerms: Rule[] = Object.entries(cnPrefix)
  .filter(([key, value]) => key.trim() && value.trim() && key !== value)
  .map(([key, value]) => [new RegExp(escapeRegExp(key), 'g'), value])

const postfixTerms: Rule[] = Object.entries(cnPostfix)
  .filter(([key, value]) => key.trim() && value.trim() && key !== value)
  .map(([key, value]) => [new RegExp(escapeRegExp(key), 'g'), value])

const termRules: Rule[] = Object.entries(termDictionary)
  .sort((a, b) => b[0].length - a[0].length)
  .map(([key, value]) => [new RegExp(escapeRegExp(key), 'g'), value])

const allRules: Rule[] = [
  ...baseRegReplace,
  ...prefixTerms,
  ...postfixTerms,
  ...termRules,
]

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isExcluded(text: string): boolean {
  return cnExcludeWhole.some((re) => {
    re.lastIndex = 0
    return re.test(text)
  })
}

/** 把一段界面文本从英文译为中文。已经全是中文/数字的文本会原样返回。 */
export function translateText(input: string): string {
  if (typeof input !== 'string' || !input) return input
  if (!/[A-Za-z]/.test(input)) return input
  // 永恒字母格子里的 A、B、C 等单个字母保持原样；但 "/s)" 这类片段仍需翻译
  if (/^[A-Za-z]$/.test(input.trim())) return input

  // 原样保留首尾空白，避免破坏排版和 Vue 的文本节点对比
  const leading = /^\s*/.exec(input)?.[0] ?? ''
  const trailing = /\s*$/.exec(input)?.[0] ?? ''
  let text = input.slice(leading.length, input.length - trailing.length)
  if (!text) return input
  if (isExcluded(text)) return input

  const exact = Object.prototype.hasOwnProperty.call(dictionary, text) ? dictionary[text] : undefined
  if (exact !== undefined) return leading + exact + trailing

  // 规则按顺序累积应用：先处理整句模式，再逐步把剩余英文片段换成中文
  for (const [pattern, replacement] of allRules) {
    pattern.lastIndex = 0
    if (pattern.test(text)) {
      pattern.lastIndex = 0
      text = text.replace(pattern, replacement)
    }
  }

  return leading + text + trailing
}

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'TEXTAREA'])
const TRANSLATED_ATTRS = ['placeholder', 'title', 'alt', 'aria-label', 'data-tooltip']

function translateAttribute(el: Element, attr: string): void {
  if (!el.hasAttribute?.(attr)) return
  const original = el.getAttribute(attr)
  if (!original) return
  const translated = translateText(original)
  if (translated !== original) el.setAttribute(attr, translated)
}

function translateNode(root: Node): void {
  if (!root) return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const parent = node.parentElement
    if (parent && SKIP_TAGS.has(parent.tagName)) continue
    // Vue 注释节点不会出现在 SHOW_TEXT 中，但保险起见跳过非文本节点
    if (node.nodeType !== Node.TEXT_NODE) continue
    const value = node.nodeValue
    if (!value) continue
    const translated = translateText(value)
    if (translated !== value) node.nodeValue = translated
  }

  const elements: Element[] =
    root.nodeType === Node.ELEMENT_NODE
      ? [root as Element, ...(root as Element).querySelectorAll('*')]
      : Array.from((root as ParentNode).querySelectorAll?.('*') ?? [])

  for (const el of elements) {
    if (SKIP_TAGS.has(el.tagName)) continue
    for (const attr of TRANSLATED_ATTRS) translateAttribute(el, attr)
    if (el.tagName === 'INPUT' && ['button', 'submit', 'reset'].includes((el as HTMLInputElement).type)) {
      const input = el as HTMLInputElement
      const translated = translateText(input.value)
      if (translated !== input.value) input.value = translated
    }
    if ((el as Element & { shadowRoot?: ShadowRoot }).shadowRoot) {
      translateNode((el as Element & { shadowRoot: ShadowRoot }).shadowRoot)
    }
  }
}

function translateTitle(): void {
  const title = document.querySelector('title')
  if (!title?.textContent) return
  const translated = translateText(title.textContent)
  if (translated !== title.textContent) title.textContent = translated
}

function observe(root: Node, observer: MutationObserver): void {
  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...TRANSLATED_ATTRS, 'value'],
  })
}

const enabled = localStorage.getItem(STORAGE_KEY) !== 'off'

/** 开启/关闭汉化。切换后会刷新页面，使界面回到对应语言。 */
export function setChineseTranslation(on: boolean): void {
  localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  location.reload()
}

export function isChineseTranslationEnabled(): boolean {
  return enabled
}

declare global {
  interface Window {
    setChineseTranslation?: (on: boolean) => void
  }
}

if (enabled) {
  const observer = new MutationObserver((mutations) => {
    if (!enabled) return
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const value = node.nodeValue
            if (value) {
              const translated = translateText(value)
              if (translated !== value) node.nodeValue = translated
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateNode(node)
          }
        })
      } else if (mutation.type === 'characterData') {
        const node = mutation.target
        const value = node.nodeValue
        if (value) {
          const translated = translateText(value)
          if (translated !== value) node.nodeValue = translated
        }
      } else if (mutation.type === 'attributes' && mutation.attributeName) {
        const target = mutation.target as Element
        if (TRANSLATED_ATTRS.includes(mutation.attributeName)) {
          translateAttribute(target, mutation.attributeName)
        } else if (mutation.attributeName === 'value' && target.tagName === 'INPUT') {
          const input = target as HTMLInputElement
          const translated = translateText(input.value)
          if (translated !== input.value) input.value = translated
        }
      }
    }
  })

  const start = () => {
    translateNode(document.documentElement)
    translateTitle()
    observe(document.body, observer)
    const title = document.querySelector('title')
    if (title) {
      const titleObserver = new MutationObserver(translateTitle)
      titleObserver.observe(title, { childList: true, characterData: true, subtree: true })
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }

}

window.setChineseTranslation = setChineseTranslation
