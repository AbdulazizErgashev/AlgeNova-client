// lib/mathSolver.ts
import { MathSolution } from "./types";

export class MathSolverError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = "MathSolverError";
  }
}

export const solveMathEquation = async (
  formula: string,
  abortSignal?: AbortSignal
): Promise<MathSolution> => {
  try {
    const response = await fetch(
      "https://math-engine.alge-nova.uz/api/math/solve",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formula }),
        signal: abortSignal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new MathSolverError(
        `Math server error: ${response.status} ${response.statusText}`,
        errorText
      );
    }

    const data = await response.json();
    return data as MathSolution;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new MathSolverError("Request aborted by user");
    }
    throw new MathSolverError("Failed to connect to math server", err.message);
  }
};
