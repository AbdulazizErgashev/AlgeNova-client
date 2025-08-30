"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Calculator, Command, Type, Eraser } from "lucide-react";

/**
 * MathEditor
 * — MathQuill-like UX with:
 *    • Slash commands: type "/frac", "/sqrt", "/pow", etc.
 *    • Symbol palette with one-click insertion/wrapping
 *    • Pure LaTeX value compatible with MathQuill (e.g., \frac{a}{b})
 *    • KaTeX preview (renderToString) with graceful fallback
 *
 * Notes
 *  - Install peer deps:  npm i katex
 *  - And include the KaTeX CSS in your app root:  import "katex/dist/katex.min.css";
 *  - This editor stores/returns a LaTeX string (same format MathQuill emits)
 */

export interface MathEditorProProps {
  value: string;
  onChange: (latex: string) => void;
  placeholder?: string;
  className?: string;
}

// ————————————————————————————————————————————————————————————
// KaTeX renderer (SSR-safe)
const KaTeXRenderer: React.FC<{ latex: string }> = ({ latex }) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cleanLatex = (formula: string) => {
          return formula
            .replace(/\n/g, " ") // yangi qatorlarni olib tashla
            .replace(/\s+/g, " ") // ortiqcha bo‘sh joylarni tozalash
            .replace(/\\,/g, " "); // thin space’larni oddiy space qil
        };

        const katex = await import("katex");
        const out = katex.default.renderToString(cleanLatex(latex) || "\\,", {
          throwOnError: false,
          strict: "ignore",
          displayMode: true,
          trust: true,
        });

        if (mounted) setHtml(out);
      } catch (e) {
        if (mounted) setHtml(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [latex]);

  if (html === null) {
    // Fallback: show raw LaTeX (still useful during dev or if KaTeX isn't loaded yet)
    return (
      <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono overflow-x-auto">
        {latex || ""}
      </pre>
    );
  }
  // eslint-disable-next-line react/no-danger
  return (
    <div
      className="prose max-w-none katex"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// ————————————————————————————————————————————————————————————
// Command templates → pure LaTeX snippets (MathQuill-compatible)
// Empty braces {} act as placeholders that users can fill.
const COMMAND_TEMPLATES: Record<string, (sel?: string) => string> = {
  // Arithmetic / structures
  frac: (sel = "") => `\\frac{${sel}}{}`,
  sqrt: (sel = "") => `\\sqrt{${sel}}`,
  cbrt: (sel = "") => `\\sqrt[3]{${sel}}`,
  nthroot: (sel = "") => `\\sqrt[]{${sel}}`,
  pow: (sel = "") => `{${sel}}^{}`,
  sub: (sel = "") => `{${sel}}_{}`,
  abs: (sel = "") => `\\left|${sel}\\right|`,
  floor: (sel = "") => `\\left\\lfloor ${sel} \\right\\rfloor`,
  ceil: (sel = "") => `\\left\\lceil ${sel} \\right\\rceil`,
  paren: (sel = "") => `\\left(${sel}\\right)`,
  bracket: (sel = "") => `\\left[${sel}\\right]`,
  brace: (sel = "") => `\\left\\{${sel}\\right\\}`,

  // Calculus / sums
  int: () => `\\int_{ }^{ } \\; \\\n`,
  dint: () => `\\int\\!\\int_{ }^{ } \\; \\\n`,
  sum: () => `\\sum_{n= }^{ } `,
  prod: () => `\\prod_{n= }^{ } `,
  lim: () => `\\lim_{x \\to } `,
  diff: (sel = "") => `\\frac{d}{dx}\\left(${sel}\\right)`,
  pdiff: (sel = "") => `\\frac{\\partial}{\\partial x}\\left(${sel}\\right)`,

  // Trig / logs
  sin: (sel = "") => `\\sin\\left(${sel}\\right)`,
  cos: (sel = "") => `\\cos\\left(${sel}\\right)`,
  tan: (sel = "") => `\\tan\\left(${sel}\\right)`,
  ln: (sel = "") => `\\ln\\left(${sel}\\right)`,
  log: (sel = "") => `\\log\\left(${sel}\\right)`,
  logb: (sel = "") => `\\log_{ }\\left(${sel}\\right)`,

  // Vectors / matrices
  vec: (sel = "") => `\\vec{${sel}}`,
  hat: (sel = "") => `\\hat{${sel}}`,
  overline: (sel = "") => `\\overline{${sel}}`,
  matrix2: () => `\\begin{bmatrix} \\; & \\; \\\\ \\; & \\; \\end{bmatrix}`,
  matrix3: () =>
    `\\begin{bmatrix} \\; & \\; & \\; \\\\ \\; & \\; & \\; \\\\ \\; & \\; & \\; \\end{bmatrix}`,

  // Text
  text: (sel = "") => `\\text{${sel}}`,
};

// Symbol palette (button-driven)
const PALETTE = [
  {
    category: "Basic",
    items: [
      { label: "=", latex: "=" },
      { label: "+", latex: "+" },
      { label: "−", latex: "-" },
      { label: "×", latex: "\\cdot" },
      { label: "÷", latex: "\\div" },
      { label: "±", latex: "\\pm" },
      { label: "≠", latex: "\\ne" },
      { label: "≈", latex: "\\approx" },
      { label: "≤", latex: "\\le" },
      { label: "≥", latex: "\\ge" },
    ],
  },
  {
    category: "Structures",
    items: [
      { label: "a/b", latex: COMMAND_TEMPLATES.frac() },
      { label: "√", latex: COMMAND_TEMPLATES.sqrt() },
      { label: "^", latex: COMMAND_TEMPLATES.pow() },
      { label: "_", latex: COMMAND_TEMPLATES.sub() },
      { label: "|x|", latex: COMMAND_TEMPLATES.abs() },
      { label: "( )", latex: COMMAND_TEMPLATES.paren() },
      { label: "[ ]", latex: COMMAND_TEMPLATES.bracket() },
      { label: "{ }", latex: COMMAND_TEMPLATES.brace() },
    ],
  },
  {
    category: "Calc",
    items: [
      { label: "∫", latex: COMMAND_TEMPLATES.int() },
      { label: "∑", latex: COMMAND_TEMPLATES.sum() },
      { label: "∏", latex: COMMAND_TEMPLATES.prod() },
      { label: "lim", latex: COMMAND_TEMPLATES.lim() },
      { label: "d/dx", latex: COMMAND_TEMPLATES.diff() },
      { label: "∂/∂x", latex: COMMAND_TEMPLATES.pdiff() },
    ],
  },
  {
    category: "Greek & Const",
    items: [
      { label: "π", latex: "\\pi" },
      { label: "e", latex: "e" },
      { label: "∞", latex: "\\infty" },
      { label: "θ", latex: "\\theta" },
      { label: "λ", latex: "\\lambda" },
      { label: "φ", latex: "\\varphi" },
    ],
  },
  {
    category: "Trig & Log",
    items: [
      { label: "sin", latex: COMMAND_TEMPLATES.sin() },
      { label: "cos", latex: COMMAND_TEMPLATES.cos() },
      { label: "tan", latex: COMMAND_TEMPLATES.tan() },
      { label: "ln", latex: COMMAND_TEMPLATES.ln() },
      { label: "log", latex: COMMAND_TEMPLATES.log() },
      { label: "log_b", latex: COMMAND_TEMPLATES.logb() },
    ],
  },
  {
    category: "Vectors & Matrix",
    items: [
      { label: "→v", latex: COMMAND_TEMPLATES.vec("v") },
      { label: "x̂", latex: COMMAND_TEMPLATES.hat("x") },
      { label: "\n¯x", latex: COMMAND_TEMPLATES.overline("x") },
      { label: "[2×2]", latex: COMMAND_TEMPLATES.matrix2() },
      { label: "[3×3]", latex: COMMAND_TEMPLATES.matrix3() },
    ],
  },
];

// ————————————————————————————————————————————————————————————
// Utilities for manipulating a textarea as a source of LaTeX
function insertAtCursor(el: HTMLTextAreaElement, text: string) {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const before = el.value.slice(0, start);
  const after = el.value.slice(end);
  el.value = before + text + after;
  const pos = start + text.length;
  el.setSelectionRange(pos, pos);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.focus();
}

function wrapSelection(
  el: HTMLTextAreaElement,
  beforeWrap: string,
  afterWrap: string
) {
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  const sel = el.value.slice(start, end);
  const next = `${beforeWrap}${sel}${afterWrap}`;
  const prefix = el.value.slice(0, start);
  const suffix = el.value.slice(end);
  el.value = prefix + next + suffix;
  const caret = prefix.length + next.length;
  el.setSelectionRange(caret, caret);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.focus();
}

// Parse and expand a trailing slash-command near the caret
function expandSlashCommand(
  el: HTMLTextAreaElement,
  templates: typeof COMMAND_TEMPLATES
) {
  const pos = el.selectionStart ?? el.value.length;
  const text = el.value.slice(0, pos);
  const match = /\/(?:[a-zA-Z0-9_]+)$/.exec(text);
  if (!match) return false;
  const cmd = match[0].slice(1); // remove '/'
  const template = templates[cmd as keyof typeof templates];
  if (!template) return false;

  const selStart = pos - match[0].length;
  const before = el.value.slice(0, selStart);
  const after = el.value.slice(pos);

  // If there is an active selection, prefer wrapping it where makes sense
  let selected = "";
  if ((el.selectionEnd ?? pos) > pos) {
    selected = el.value.slice(pos, el.selectionEnd);
  }

  const snippet = template(selected);
  el.value = before + snippet + after;
  const newPos = before.length + snippet.length;
  el.setSelectionRange(newPos, newPos);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.focus();
  return true;
}

// ————————————————————————————————————————————————————————————
// Command palette component shown when user types '/'
const ALL_COMMANDS = Object.keys(COMMAND_TEMPLATES);

const Palette: React.FC<{
  query: string;
  onPick: (cmd: string) => void;
}> = ({ query, onPick }) => {
  const items = useMemo(() => {
    const q = query.toLowerCase();
    return ALL_COMMANDS.filter((k) => k.startsWith(q)).slice(0, 8);
  }, [query]);

  if (!query) return null;

  return (
    <motion.ul
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="absolute z-20 mt-1 w-64 rounded-2xl border bg-white/95 shadow-xl backdrop-blur p-2 grid gap-1"
      role="listbox"
    >
      {items.length === 0 ? (
        <li className="px-3 py-2 text-sm text-muted-foreground">
          Hech narsa topilmadi
        </li>
      ) : (
        items.map((k) => (
          <li key={k}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => onPick(k)}
            >
              /{k}
            </Button>
          </li>
        ))
      )}
    </motion.ul>
  );
};

// ————————————————————————————————————————————————————————————
export const MathEditor: React.FC<MathEditorProProps> = ({
  value,
  onChange,
  placeholder = "Write LaTeX or use /commands…",
  className = "",
}) => {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [slashQ, setSlashQ] = useState("");

  // Detect when user is after a slash to show palette
  const refreshSlashQuery = () => {
    const el = taRef.current;
    if (!el) return setSlashQ("");
    const pos = el.selectionStart ?? el.value.length;
    const left = el.value.slice(0, pos);
    const m = /\/(?:[a-zA-Z0-9_]*)$/.exec(left);
    setSlashQ(m ? m[0].slice(1) : "");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    const el = e.currentTarget;

    // Expand on Space/Enter/Tab after a known slash command
    if ([" ", "Enter", "Tab", ")"].includes(e.key)) {
      const expanded = expandSlashCommand(el, COMMAND_TEMPLATES);
      if (expanded) {
        e.preventDefault();
        refreshSlashQuery();
        return;
      }
    }

    // Smart pairs for (), [], {}
    if (["(", "[", "{"].includes(e.key)) {
      e.preventDefault();
      const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
      wrapSelection(el, e.key, pairs[e.key]);
      refreshSlashQuery();
      return;
    }

    // ^ and _ wrappers like MathQuill (^ for superscript, _ for subscript)
    if (e.key === "^") {
      e.preventDefault();
      wrapSelection(el, "{}^{", "}");
      refreshSlashQuery();
      return;
    }
    if (e.key === "_") {
      e.preventDefault();
      wrapSelection(el, "{}_{", "}");
      refreshSlashQuery();
      return;
    }

    // Tab inserts a thin space in LaTeX (\\,)
    if (e.key === "Tab") {
      e.preventDefault();
      insertAtCursor(el, "\\, ");
      refreshSlashQuery();
      return;
    }
  };

  const onInput: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    onChange(e.target.value);
    refreshSlashQuery();
  };

  const pickCommand = (cmd: string) => {
    const el = taRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? el.value.length;
    const left = el.value.slice(0, pos);
    const m = /\/(?:[a-zA-Z0-9_]*)$/.exec(left);
    const start = m ? pos - m[0].length : pos;
    const before = el.value.slice(0, start);
    const after = el.value.slice(pos);
    const snippet = COMMAND_TEMPLATES[cmd]();
    el.value = before + snippet + after;
    const caret = (before + snippet).length;
    el.setSelectionRange(caret, caret);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
    refreshSlashQuery();
  };

  const clearAll = () => {
    onChange("");
    if (taRef.current) taRef.current.focus();
  };

  return (
    <Card className={`border-blue-200/60 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Math Editor Pro (LaTeX)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((s) => !s)}
              className="gap-2"
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAll}
              className="gap-2"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Input */}
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Type className="h-4 w-4 text-muted-foreground" />
            Write a matter
            <span className="ml-2 text-xs text-muted-foreground">
              Tip: "/" buyruqlarini sinab ko'ring (masalan, /frac, /sqrt, /pow)
            </span>
          </div>

          <div className="relative">
            <textarea
              ref={taRef}
              value={value}
              onChange={onInput}
              onKeyDown={handleKeyDown}
              onClick={refreshSlashQuery}
              onKeyUp={refreshSlashQuery}
              placeholder={placeholder}
              className="min-h-[120px] w-full rounded-xl border bg-white/70 p-3 font-mono text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Slash palette */}
            <AnimatePresence>
              {slashQ !== "" && (
                <div className="absolute left-3 top-[100%]">
                  <Palette query={slashQ} onPick={pickCommand} />
                </div>
              )}
            </AnimatePresence>

            {/* Floating hint */}
            {value.trim() === "" && (
              <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 border border-blue-200">
                <Command className="h-3 w-3" /> /help
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4 text-muted-foreground" />
              Preview (KaTeX)
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <KaTeXRenderer latex={value} />
            </div>
          </div>
        )}

        {/* Palette Tabs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            Math Symbols
          </div>

          <Tabs defaultValue={PALETTE[0].category} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
              {PALETTE.map((cat) => (
                <TabsTrigger
                  key={cat.category}
                  value={cat.category}
                  className="text-xs"
                >
                  {cat.category}
                </TabsTrigger>
              ))}
            </TabsList>

            {PALETTE.map((cat) => (
              <TabsContent
                key={cat.category}
                value={cat.category}
                className="mt-3"
              >
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {cat.items.map((item) => (
                    <Button
                      key={item.label + item.latex}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 text-sm bg-white/60 hover:bg-blue-50 border-blue-200/40"
                      onClick={() => {
                        const el = taRef.current!;
                        insertAtCursor(el, item.latex);
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Tips */}
        <div className="rounded-lg border border-blue-200/50 bg-blue-50/40 p-3">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">
              Tip
            </Badge>
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-medium">Quick LaTeX usage (MathQuill-like):</p>
              <ul className="text-xs leading-relaxed">
                <li>
                  • "/frac" → \frac{}
                  {} (kursor chiziqdan so'ng bo'ladi)
                </li>
                <li>
                  • "^" va "_" tanlangan matnni mos ravishda super/subscript
                  qiladi: {"{}^{sel}, {}_{sel}"}
                </li>
                <li>
                  • Juft qavslar avtomatik:{" "}
                  {"(, [ , { → mos yopilish bilan o'raydi"}
                </li>
                <li>• Tab → \\, (thin space)</li>
                <li>
                  • Barcha qiymatlar toza LaTeX bo'lib, MathQuill bilan mos
                  keladi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MathEditor;
