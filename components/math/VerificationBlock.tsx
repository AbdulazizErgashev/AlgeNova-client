"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { SolutionVerification } from "@/lib/types";

interface VerificationBlockProps {
  verifications: SolutionVerification[] | null;
}

export const VerificationBlock: React.FC<VerificationBlockProps> = ({
  verifications,
}) => {
  if (!verifications?.length) return null;

  return (
    <Card className="border-emerald-200/60 bg-emerald-50/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <CardTitle>Solution Verification</CardTitle>
        </div>
        <CardDescription>
          Checking by substituting into the original equation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {verifications.map((verification, i) => (
          <div key={i} className="rounded-lg bg-white/60 border p-4">
            {verification.error ? (
              <div className="text-red-600 font-medium">
                {verification.solution}: {verification.error}
              </div>
            ) : (
              <div>
                <div className="font-medium text-emerald-800">
                  Solution: {verification.solution}
                </div>
                {verification.isCorrect !== undefined && (
                  <div
                    className={`text-sm ${
                      verification.isCorrect
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {verification.isCorrect ? "✓ Verified" : "✗ Incorrect"}
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
