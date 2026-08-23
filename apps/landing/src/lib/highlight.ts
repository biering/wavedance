import javascript from "@shikijs/langs/javascript"
import githubDarkDefault from "@shikijs/themes/github-dark-default"
import { type HighlighterCore, createHighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"

const THEME = "github-dark-default"

let highlighterPromise: Promise<HighlighterCore> | null = null

function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    langs: [javascript],
    themes: [githubDarkDefault],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighterPromise
}

export async function highlightJavaScript(code: string): Promise<string> {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code, {
    lang: "javascript",
    theme: THEME,
  })
}
