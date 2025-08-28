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
    const response = await fetch("http://localhost:5000/api/math/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    return await response.json();
  } catch (error) {
    if (error instanceof MathSolverError) throw error;
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
