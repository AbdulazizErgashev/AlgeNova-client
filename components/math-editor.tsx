"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Type, Eye, EyeOff } from "lucide-react";

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// KaTeX-style math rendering component
const MathRenderer: React.FC<{ latex: string }> = ({ latex }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <span className="font-mono text-sm">{latex}</span>;
  }

  // Simple LaTeX-like rendering for common math expressions
  const renderMath = (expression: string) => {
    let rendered = expression;

    // Replace common math symbols
    rendered = rendered.replace(/\^(\w+|$$[^)]+$$)/g, "<sup>$1</sup>");
    rendered = rendered.replace(/_(\w+|$$[^)]+$$)/g, "<sub>$1</sub>");
    rendered = rendered.replace(/sqrt$$([^)]+)$$/g, "√($1)");
    rendered = rendered.replace(/pi/g, "π");
    rendered = rendered.replace(/infinity/g, "∞");
    rendered = rendered.replace(/\*/g, "×");
    rendered = rendered.replace(/\+-/g, "±");

    return rendered;
  };

  return (
    <div
      className="math-rendered font-serif text-lg"
      dangerouslySetInnerHTML={{ __html: renderMath(latex) }}
    />
  );
};

const ADVANCED_MATH_SYMBOLS = [
  {
    category: "Basic",
    symbols: [
      { label: "(", value: "(" },
      { label: ")", value: ")" },
      { label: "=", value: "=" },
      { label: "+", value: "+" },
      { label: "−", value: "-" },
      { label: "×", value: "*" },
      { label: "÷", value: "/" },
      { label: "±", value: "+-" },
    ],
  },
  {
    category: "Powers & Roots",
    symbols: [
      { label: "x²", value: "^2" },
      { label: "x³", value: "^3" },
      { label: "xⁿ", value: "^" },
      { label: "√", value: "sqrt(" },
      { label: "∛", value: "cbrt(" },
      { label: "ⁿ√", value: "nthroot(" },
    ],
  },
  {
    category: "Trigonometry",
    symbols: [
      { label: "sin", value: "sin(" },
      { label: "cos", value: "cos(" },
      { label: "tan", value: "tan(" },
      { label: "csc", value: "csc(" },
      { label: "sec", value: "sec(" },
      { label: "cot", value: "cot(" },
      { label: "sin⁻¹", value: "asin(" },
      { label: "cos⁻¹", value: "acos(" },
      { label: "tan⁻¹", value: "atan(" },
    ],
  },
  {
    category: "Logarithms",
    symbols: [
      { label: "log", value: "log(" },
      { label: "ln", value: "ln(" },
      { label: "log₂", value: "log2(" },
      { label: "log₁₀", value: "log10(" },
    ],
  },
  {
    category: "Calculus",
    symbols: [
      { label: "d/dx", value: "d/dx(" },
      { label: "∫", value: "integrate(" },
      { label: "∂/∂x", value: "partial(" },
      { label: "lim", value: "limit(" },
      { label: "Σ", value: "sum(" },
      { label: "∏", value: "product(" },
    ],
  },
  {
    category: "Constants & Variables",
    symbols: [
      { label: "x", value: "x" },
      { label: "y", value: "y" },
      { label: "z", value: "z" },
      { label: "π", value: "pi" },
      { label: "e", value: "e" },
      { label: "∞", value: "infinity" },
      { label: "|x|", value: "abs(" },
    ],
  },
  {
    category: "Advanced",
    symbols: [
      { label: "!", value: "!" },
      { label: "%", value: "%" },
      { label: "≤", value: "<=" },
      { label: "≥", value: ">=" },
      { label: "≠", value: "!=" },
      { label: "≈", value: "~=" },
      { label: "∈", value: " in " },
      { label: "∀", value: "forall " },
    ],
  },
];

const insertTextAtCursor = (
  element: HTMLTextAreaElement,
  textToInsert: string
): void => {
  if (!element) return;

  const startPosition = element.selectionStart ?? element.value.length;
  const endPosition = element.selectionEnd ?? element.value.length;
  const beforeText = element.value.slice(0, startPosition);
  const afterText = element.value.slice(endPosition);

  element.value = beforeText + textToInsert + afterText;

  const newCursorPosition = startPosition + textToInsert.length;
  element.setSelectionRange(newCursorPosition, newCursorPosition);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.focus();
};

export const MathEditor: React.FC<MathEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your mathematical equation...",
  className = "",
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSymbolInsert = (symbolValue: string) => {
    if (textareaRef.current) {
      insertTextAtCursor(textareaRef.current, symbolValue);
      onChange(textareaRef.current.value);
    }
  };

  return (
    <Card className={`border-blue-200/60 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Advanced Math Engine
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Input</span>
          </div>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] font-mono text-base resize-none"
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                handleSymbolInsert("  ");
              }
            }}
          />
        </div>

        {/* Preview Area */}
        {showPreview && value && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-muted/60">
              <MathRenderer latex={value} />
            </div>
          </div>
        )}

        {/* Symbol Palette */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Math Symbols</span>
          </div>

          <Tabs defaultValue="Basic" className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
              {ADVANCED_MATH_SYMBOLS.map((category) => (
                <TabsTrigger
                  key={category.category}
                  value={category.category}
                  className="text-xs"
                >
                  {category.category}
                </TabsTrigger>
              ))}
            </TabsList>

            {ADVANCED_MATH_SYMBOLS.map((category) => (
              <TabsContent
                key={category.category}
                value={category.category}
                className="mt-3"
              >
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {category.symbols.map((symbol) => (
                    <Button
                      key={`${symbol.label}-${symbol.value}`}
                      variant="outline"
                      size="sm"
                      className="h-10 text-sm bg-white/50 hover:bg-blue-50 border-blue-200/40"
                      onClick={() => handleSymbolInsert(symbol.value)}
                      title={`Insert ${symbol.label}`}
                    >
                      {symbol.label}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Quick Tips */}
        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/40">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">
              Tip
            </Badge>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Quick formatting tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Use ^ for exponents: x^2 becomes x²</li>
                <li>• Use _ for subscripts: H_2O becomes H₂O</li>
                <li>• Functions auto-complete: sin( cos( tan( log( ln(</li>
                <li>• Click symbols above to insert at cursor position</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
