"use client";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MathEditor } from "@/components/math-editor";
import { StepBySolution } from "@/components/step-by-step-solution";
import { BenefitsSection } from "@/components/math/BenefitsSection";
import { solveMathEquation, MathSolverError } from "@/lib/mathSolver";
import { MathSolution } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Loader2, Wand2, Info } from "lucide-react";
import Footer from "@/components/footer/Footer";
import "katex/dist/katex.min.css";

export default function MathSolverApp() {
  const [inputFormula, setInputFormula] = useState("");
  const [solutionData, setSolutionData] = useState<MathSolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSolveEquation = useCallback(async () => {
    if (!inputFormula.trim()) return;
    setErrorMessage(null);
    setSolutionData(null);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      const solution = await solveMathEquation(
        inputFormula.trim(),
        abortControllerRef.current.signal
      );
      setSolutionData(solution);
    } catch (error) {
      setErrorMessage(
        error instanceof MathSolverError ? error.message : "Unexpected error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputFormula]);

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 min-2xl:px-[10%] min-lg:px-[5%] min-sm:px-[2%]">
        <section className="">
          <BenefitsSection />
        </section>

        <section className="space-y-6">
          <MathEditor
            value={inputFormula}
            onChange={setInputFormula}
            placeholder="Enter equation..."
          />

          <Card>
            <CardFooter className="justify-end">
              <Button
                onClick={handleSolveEquation}
                disabled={!inputFormula.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}{" "}
                {isLoading ? "Solving..." : "Solve"}
              </Button>
            </CardFooter>
          </Card>

          {errorMessage && <div className="text-red-600">{errorMessage}</div>}
          {solutionData && <StepBySolution solution={solutionData} />}
        </section>
      </main>
      <Footer />
    </TooltipProvider>
  );
}
