"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Calculator, BookOpen } from "lucide-react";
import React, { useEffect, useState } from "react";

// -------------------------------
// KaTeX Renderer (SSR-safe)
const KaTeXRenderer: React.FC<{ latex: string; block?: boolean }> = ({
  latex,
  block = true,
}) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const katex = await import("katex");
        const out = katex.default.renderToString(latex || "\\,", {
          throwOnError: false,
          strict: "ignore",
          displayMode: block,
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
  }, [latex, block]);

  if (html === null) {
    return (
      <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono overflow-x-auto">
        {latex || ""}
      </pre>
    );
  }

  return (
    <div
      className={`prose max-w-none katex ${
        block ? "my-2" : "inline-block align-middle"
      }`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// -------------------------------
// Types
interface MathStep {
  step: number;
  description: string;
  expression: string;
  expressionLatex: string;
  explanation: string;
}

interface Verification {
  solution: string;
  leftSide?: string;
  rightSide?: string;
  isCorrect?: boolean;
  error?: string;
}

interface MathSolution {
  originalFormula: string;
  parsedFormula: string;
  steps: MathStep[];
  finalAnswer: string;
  finalAnswerLatex: string;
  verification?: Verification[];
  explanation: string;
  type: "equation" | "expression" | "derivative" | "integral";
}

interface StepBySolutionProps {
  solution: MathSolution;
  verification?: Verification[];
}

// -------------------------------
export function StepBySolution({ solution }: StepBySolutionProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "equation":
        return "bg-blue-100 text-blue-800";
      case "expression":
        return "bg-green-100 text-green-800";
      case "derivative":
        return "bg-purple-100 text-purple-800";
      case "integral":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "equation":
      case "expression":
        return <Calculator className="w-4 h-4" />;
      case "derivative":
      case "integral":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Calculator className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Problem Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getTypeIcon(solution.type)}
              Problem Analysis
            </CardTitle>
            <Badge className={getTypeColor(solution.type)}>
              {solution.type.charAt(0).toUpperCase() + solution.type.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-1">
              Original Input:
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-lg">
              <KaTeXRenderer latex={solution.originalFormula} />
            </div>
          </div>

          {solution.parsedFormula !== solution.originalFormula && (
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">
                Parsed Formula:
              </h4>
              <div className="bg-blue-50 p-3 rounded-lg font-mono text-lg">
                <KaTeXRenderer latex={solution.parsedFormula} />
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-1">
              Approach:
            </h4>
            <p className="text-gray-700">{solution.explanation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Solution */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {solution.steps.map((step, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    Step {step.step}
                  </Badge>
                  <h4 className="font-medium text-gray-900">
                    {step.description}
                  </h4>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-lg mb-2">
                  <KaTeXRenderer latex={step.expressionLatex} />
                </div>
                <p className="text-sm text-gray-600">{step.explanation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Answer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">Final Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="font-mono text-xl text-green-800">
              <KaTeXRenderer latex={solution.finalAnswerLatex} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
