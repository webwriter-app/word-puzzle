import crossword from "../snippets/Crossword-Animals.html";
import findTheWords from "../snippets/Find-The-Words-Fruits.html";
import type { WebwriterWordPuzzle } from "../src/widgets/webwriter-word-puzzle";

const snippets = { "Crossword-Animals": crossword, "Find-The-Words-Fruits": findTheWords };
const mounted: HTMLElement[] = [];

export const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function until<T>(fn: () => T | Promise<T>, message = "condition not met", timeout = 15000): Promise<NonNullable<T>> {
  const end = performance.now() + timeout;
  while (performance.now() < end) {
    const value = await fn();
    if (value) return value as NonNullable<T>;
    await wait(25);
  }
  throw new Error(`timed out waiting for ${message}`);
}

export const snippet = (name: keyof typeof snippets) =>
  new DOMParser().parseFromString(snippets[name], "text/html").querySelector("webwriter-word-puzzle")!.outerHTML;

export async function mount(html: string): Promise<{ widget: WebwriterWordPuzzle; host: HTMLElement }> {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const widget = host.querySelector("webwriter-word-puzzle") as WebwriterWordPuzzle;
  await widget.updateComplete;
  return { widget, host };
}

export const open = async (name: keyof typeof snippets) => (await mount(snippet(name))).widget;

export async function cleanup() {
  document.designMode = "off";
  // Let pending renders of the widgets settle before their DOM goes away.
  await wait(100);
  for (const host of mounted.splice(0)) host.remove();
}

export const edit = (widget: HTMLElement) => { widget.setAttribute("contenteditable", ""); document.designMode = "on"; };
export const read = (widget: HTMLElement) => { widget.removeAttribute("contenteditable"); document.designMode = "off"; };

export const parts = (widget: HTMLElement) => {
  const root = widget.shadowRoot!;
  return {
    root,
    grid: root.querySelector("webwriter-word-puzzle-grid") as any,
    clues: root.querySelector("webwriter-word-puzzle-cluebox") as any,
    input: root.querySelector("webwriter-word-puzzle-cluebox-input") as any,
  };
};

export const shown = (element: HTMLElement | null) => !!element && !element.hidden && getComputedStyle(element).display !== "none";
export const block = (widget: HTMLElement) => widget.querySelector(':scope > script[type="application/json"]') as HTMLScriptElement | null;
export const hasDrawer = (widget: HTMLElement) => !!parts(widget).input?.shadowRoot?.querySelector("sl-drawer");
export const wordsOf = (widget: HTMLElement): string[] => parts(widget).grid._wordsClues.map((entry: { word: string }) => entry.word);
