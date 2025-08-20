"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MathEditor } from "@/components/math-editor";
import { StepBySolution } from "@/components/step-by-step-solution";
import {
  Info,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Wand2,
  ChevronRight,
  Zap,
  BookOpen,
  Target,
  Clock,
  Brain,
  Award,
} from "lucide-react";

/**
 * Represents a single step in the math solution process (matches backend format)
 */
interface MathStep {
  step: number; // backend uses 'step' not 'stepNumber'
  description: string;
  expression: string;
  explanation: string;
}

/**
 * Represents verification of a solution by substitution (matches backend format)
 */
interface SolutionVerification {
  solution: string;
  leftSide?: string;
  rightSide?: string;
  isCorrect?: boolean;
  error?: string; // backend uses 'error' not 'errorMessage'
}

/**
 * Complete solution data returned from the API (matches backend format)
 */
interface MathSolution {
  originalFormula: string;
  parsedFormula: string;
  steps: MathStep[];
  finalAnswer: string | number | (string | number)[] | null;
  verification?: SolutionVerification[] | null; // backend uses 'verification' not 'verifications'
  explanation: string;
  type: "equation" | "expression" | "derivative" | "integral" | string; // backend uses 'type' not 'solutionType'
}

class MathSolverError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = "MathSolverError";
  }
}

const solveMathEquation = async (
  formula: string,
  abortSignal?: AbortSignal
): Promise<MathSolution> => {
  try {
    const response = await fetch("/api/math/solve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formula }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({
        error: "Failed to parse error response",
      }));
      throw new MathSolverError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        errorData.details
      );
    }

    const data: MathSolution = await response.json();
    return data;
  } catch (error) {
    if (error instanceof MathSolverError) {
      throw error;
    }
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new MathSolverError("Request was cancelled");
      }
      if (error.message.includes("fetch")) {
        throw new MathSolverError(
          "Unable to connect to math solver server. Please check your connection."
        );
      }
      throw new MathSolverError(error.message);
    }
    throw new MathSolverError("An unexpected error occurred");
  }
};

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = "" }) => (
  <div className={`max-w-5xl w-full mx-auto px-4 ${className}`}>{children}</div>
);

const MATH_KEYPAD_BUTTONS = [
  { label: "(", value: "(" },
  { label: ")", value: ")" },
  { label: "=", value: "=" },
  { label: "x", value: "x" },
  { label: "y", value: "y" },
  { label: "z", value: "z" },
  { label: "+", value: "+" },
  { label: "−", value: "-" },
  { label: "×", value: "*" },
  { label: "÷", value: "/" },
  { label: "^", value: "^" },
  { label: "√", value: "sqrt(" },
  { label: "sin", value: "sin(" },
  { label: "cos", value: "cos(" },
  { label: "tan", value: "tan(" },
  { label: "log", value: "log(" },
  { label: "ln", value: "ln(" },
  { label: "|x|", value: "abs(" },
  { label: "d/dx", value: "d/dx(" },
  { label: "∫", value: "integrate(" },
  { label: "%", value: "%" },
  { label: "x²", value: "^2" },
  { label: "x³", value: "^3" },
  { label: "π", value: "pi" },
  { label: "e", value: "e" },
  { label: "∞", value: "infinity" },
];

const EXAMPLE_EQUATIONS = [
  "2x + 5 = 11",
  "x^2 - 4 = 0",
  "3*(x + 2) = 15",
  "(x - 1)/2 = 3",
  "sin(x) = 0.5",
  "log(x) = 2",
  "d/dx(x^2 + 3x)",
  "sqrt(x + 4) = 6",
] as const;

const insertTextAtCursor = (
  element: HTMLTextAreaElement | HTMLInputElement,
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

interface StepsListProps {
  steps: MathStep[];
}

const StepsList: React.FC<StepsListProps> = ({ steps }) => {
  if (!steps?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No steps available
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Solution steps">
      {steps.map((step) => (
        <Card key={step.step} className="border-muted/60" role="listitem">
          <CardHeader className="py-3">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="rounded-full min-w-[2rem] h-8 flex items-center justify-center"
                aria-label={`Step ${step.step}`}
              >
                {step.step}
              </Badge>
              <CardTitle className="text-base font-semibold">
                {step.description}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div
              className="rounded-xl bg-muted/40 px-4 py-3 font-mono text-sm overflow-x-auto"
              role="code"
              aria-label="Mathematical expression"
            >
              {step.expression}
            </div>
            {step.explanation && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {step.explanation}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface VerificationBlockProps {
  verifications: SolutionVerification[] | null;
}

const VerificationBlock: React.FC<VerificationBlockProps> = ({
  verifications,
}) => {
  if (!verifications?.length) return null;

  return (
    <Card className="border-emerald-200/60 bg-emerald-50/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-lg text-emerald-900">
            Solution Verification
          </CardTitle>
        </div>
        <CardDescription>
          Checking the solution by substituting back into the original equation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {verifications.map((verification, index) => (
          <div
            key={index}
            className="rounded-lg bg-white/60 border border-emerald-200/40 p-4"
          >
            {verification.error ? (
              <div className="text-red-600 font-medium">
                Solution {verification.solution}: {verification.error}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="font-medium text-emerald-800">
                  Solution: {verification.solution}
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Left side:</span>
                    <div className="bg-muted/40 rounded px-2 py-1">
                      {verification.leftSide}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Right side:</span>
                    <div className="bg-muted/40 rounded px-2 py-1">
                      {verification.rightSide}
                    </div>
                  </div>
                </div>
                {verification.isCorrect !== undefined && (
                  <div
                    className={`text-sm font-medium ${
                      verification.isCorrect
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {verification.isCorrect
                      ? "✓ Verified correct"
                      : "✗ Verification failed"}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

interface MathKeypadProps {
  onInsert: (value: string) => void;
}

const MathKeypad: React.FC<MathKeypadProps> = ({ onInsert }) => (
  <div className="space-y-3">
    <div className="text-sm font-medium">Math Symbols</div>
    <div className="grid grid-cols-6 gap-2">
      {MATH_KEYPAD_BUTTONS.map((button) => (
        <Button
          key={`${button.label}-${button.value}`}
          variant="outline"
          size="sm"
          className="rounded-lg text-xs h-8 bg-transparent"
          onClick={() => onInsert(button.value)}
          aria-label={`Insert ${button.label}`}
        >
          {button.label}
        </Button>
      ))}
    </div>
    <p className="text-xs text-muted-foreground">
      Click any symbol to insert it at your cursor position
    </p>
  </div>
);

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: "Natural Language Processing",
      description:
        "Write equations in plain English - 'two x plus five equals eleven' becomes '2x + 5 = 11'",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-green-600" />,
      title: "Step-by-Step Learning",
      description:
        "Understand every step with detailed explanations and mathematical reasoning",
    },
    {
      icon: <Target className="h-6 w-6 text-purple-600" />,
      title: "Automatic Verification",
      description:
        "Every solution is verified by substituting back into the original equation",
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: "Instant Results",
      description:
        "Get comprehensive solutions in seconds with your dedicated math server",
    },
    {
      icon: <Brain className="h-6 w-6 text-red-600" />,
      title: "Advanced Math Engine",
      description:
        "Powered by MathJS with support for calculus, trigonometry, and complex equations",
    },
    {
      icon: <Award className="h-6 w-6 text-indigo-600" />,
      title: "Multiple Problem Types",
      description:
        "Handles equations, expressions, derivatives, integrals, and more mathematical operations",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Benefits Grid */}
      <Card className="border-blue-200/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">
            Advanced Math Solver with NLP
          </CardTitle>
          <CardDescription className="text-lg text-blue-700">
            Powered by your custom backend with natural language processing and
            step-by-step solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/80 rounded-xl p-6 shadow-sm border border-white/60"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 p-2 rounded-lg bg-gray-50">
                    {benefit.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Math Capabilities Showcase */}
      <Card className="border-green-200/60 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Supported Mathematical Operations
          </CardTitle>
          <CardDescription className="text-green-700">
            Your backend supports comprehensive mathematical problem solving
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Linear Equations (2x + 5 = 13)",
              "Quadratic Equations (x^2 - 4x + 3 = 0)",
              "Polynomial Expressions (x^3 + 2x^2 - x + 1)",
              "Basic Derivatives (d/dx(x^2 + 3x))",
              "Trigonometric Functions (sin(x) + cos(x))",
              "Logarithmic Expressions (log(x) + ln(x))",
              "Natural Language Input ('two x plus five equals eleven')",
              "Expression Evaluation (3^2 + 4*5 - 2)",
              "Function Notation (sin, cos, tan, sqrt, abs)",
              "Advanced Calculus Operations",
            ].map((capability, index) => (
              <div
                key={capability}
                className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-green-200/40"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span className="font-medium text-green-800">{capability}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-white/80 rounded-lg border border-green-200/60">
            <p className="text-sm text-green-700 leading-relaxed">
              <strong>Powered by Your Backend:</strong> This frontend connects
              to your custom math server running on http://192.168.1.86:5000
              with advanced natural language processing and comprehensive
              mathematical solving capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function MathSolverApp() {
  const [inputFormula, setInputFormula] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [solutionData, setSolutionData] = useState<MathSolution | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const formattedFinalAnswer = useMemo(() => {
    if (!solutionData?.finalAnswer && solutionData?.finalAnswer !== 0) {
      return null;
    }

    const answer = solutionData.finalAnswer;
    if (Array.isArray(answer)) {
      return answer.join(" or ");
    }
    return String(answer);
  }, [solutionData?.finalAnswer]);

  const handleSolveEquation = useCallback(async () => {
    if (!inputFormula.trim()) return;

    // Reset previous state
    setErrorMessage(null);
    setSolutionData(null);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      const solution = await solveMathEquation(
        inputFormula.trim(),
        abortControllerRef.current.signal
      );
      setSolutionData(solution);
    } catch (error) {
      if (error instanceof MathSolverError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      console.error("Math solver error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [inputFormula]);

  const handleExampleClick = useCallback((example: string) => {
    setInputFormula(example);
  }, []);

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        {/* Header Section */}
        <header className="py-12">
          <Section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Math Solver
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Natural language math solver with step-by-step solutions powered
                by your custom backend
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">
                  Connected to Math Server (192.168.1.86:5000)
                </span>
              </div>
            </motion.div>
          </Section>
        </header>

        <Section className="space-y-8">
          <BenefitsSection />

          <MathEditor
            value={inputFormula}
            onChange={setInputFormula}
            placeholder="Enter your equation here... Try: 'two x plus five equals eleven' or '2x + 5 = 11'"
            className="shadow-sm"
          />

          {/* Solve Button */}
          <Card className="shadow-sm border-muted/60">
            <CardFooter className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>
                  Advanced math editor with symbol palette and live preview
                </span>
              </div>
              <Button
                onClick={handleSolveEquation}
                disabled={!inputFormula.trim() || isLoading}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isLoading ? "Solving..." : "Solve Equation"}
              </Button>
            </CardFooter>
          </Card>

          {/* Instructions and Examples */}
          <Card className="border-muted/60">
            <CardHeader>
              <CardTitle>How to Use This Advanced Math Solver</CardTitle>
              <CardDescription>
                Learn about supported operations and try example equations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">
                    Supported Operations
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Basic arithmetic: +, −, ×, ÷
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Parentheses for grouping: ( )
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Variables: x, y, z
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Equations with equals: =
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Exponents: x^2, x**2
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Functions: sin, cos, tan, log, ln, sqrt, abs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Calculus: d/dx(f(x)) for derivatives, integrate() for
                      integrals
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Constants: π (pi), e, ∞ (infinity)
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">
                    Try These Examples
                  </h3>
                  <div className="grid gap-2">
                    {EXAMPLE_EQUATIONS.map((example) => (
                      <Button
                        key={example}
                        variant="outline"
                        className="justify-between rounded-lg h-auto py-3 bg-transparent hover:bg-blue-50"
                        onClick={() => handleExampleClick(example)}
                      >
                        <span className="font-mono text-sm">{example}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Error Solving Equation</AlertTitle>
              <AlertDescription className="mt-2">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Results Section */}
          {solutionData && (
            <div className="space-y-6">
              <StepBySolution solution={solutionData} />
            </div>
          )}

          {/* Spacer */}
          <div className="h-12" />
        </Section>

        {/* Footer */}
        <footer className="py-8 border-t mt-16 bg-gradient-to-r from-white/70 to-gray-50/70 backdrop-blur-md">
          <Section>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-gray-700">
                <span className="font-bold text-primary">AlgeNova</span> — The
                Advanced Math Solver
              </span>
              <div className="flex items-center flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  Step-by-Step Explanations
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  Algebra • Geometry • Calculus
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  Covers All Math Levels
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  Fast & Accurate Results
                </Badge>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} AlgeNova. All rights reserved.
            </div>
          </Section>
        </footer>
      </main>
    </TooltipProvider>
  );
}
