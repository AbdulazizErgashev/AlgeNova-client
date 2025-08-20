"use client";
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MathStep } from "@/lib/types";

interface StepsListProps {
  steps: MathStep[];
}

export const StepsList: React.FC<StepsListProps> = ({ steps }) => {
  if (!steps?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No steps available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <Card key={step.step} className="border-muted/60">
          <CardHeader className="py-3">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">
                {step.step}
              </Badge>
              <CardTitle className="text-base font-semibold">{step.description}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-muted/40 px-4 py-3 font-mono text-sm overflow-x-auto">
              {step.expression}
            </div>
            {step.explanation && (
              <p className="text-sm text-muted-foreground mt-3">{step.explanation}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
