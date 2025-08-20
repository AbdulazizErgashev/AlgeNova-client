export interface MathStep {
  step: number;
  description: string;
  expression: string;
  explanation: string;
}

export interface SolutionVerification {
  solution: string;
  leftSide?: string;
  rightSide?: string;
  isCorrect?: boolean;
  error?: string;
}

export interface MathSolution {
  originalFormula: string;
  parsedFormula: string;
  steps: MathStep[];
  finalAnswer: string | number | (string | number)[] | null;
  verification?: SolutionVerification[] | null;
  explanation: string;
  type: "equation" | "expression" | "derivative" | "integral" | string;
}
