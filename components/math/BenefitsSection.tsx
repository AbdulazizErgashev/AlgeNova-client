"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Zap,
  BookOpen,
  Target,
  Clock,
  Brain,
  Award,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import Image from "next/image";

const benefits = [
  {
    icon: <Zap className="h-6 w-6 text-blue-600" />,
    title: "Natural Language Processing",
    description:
      "Write equations in plain English - 'two x plus five equals eleven' becomes '2x + 5 = 11'.",
  },
  {
    icon: <BookOpen className="h-6 w-6 text-green-600" />,
    title: "Step-by-Step Learning",
    description:
      "Understand every step with detailed explanations and mathematical reasoning.",
  },
  {
    icon: <Target className="h-6 w-6 text-purple-600" />,
    title: "Automatic Verification",
    description:
      "Every solution is verified by substituting back into the original equation.",
  },
  {
    icon: <Clock className="h-6 w-6 text-orange-600" />,
    title: "Instant Results",
    description:
      "Get comprehensive solutions in seconds with your dedicated math server.",
  },
  {
    icon: <Brain className="h-6 w-6 text-red-600" />,
    title: "Advanced Math Engine",
    description:
      "Powered by MathJS with support for calculus, trigonometry, and complex equations.",
  },
  {
    icon: <Award className="h-6 w-6 text-indigo-600" />,
    title: "Multiple Problem Types",
    description:
      "Handles equations, expressions, derivatives, integrals, and more mathematical operations.",
  },
];

const capabilities = [
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
];

const BenefitsSection = () => {
  return (
    <div className="space-y-10 ">
      <div className="flex gap-5">
        <Image
          src={"./logo.png"}
          alt="Logo of AlgeNova"
          width={300}
          height={300}
          className="rounded-4xl mx-auto object-cover"
        />
        {/* === Benefits Grid === */}
        <Card className="border-blue-200/60 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 shadow-lg">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-3xl font-bold text-blue-900">
              Advanced Math Solver
            </CardTitle>
            <CardDescription className="text-lg text-blue-700">
              Powered by natural language processing and detailed step-by-step
              solutions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/80 rounded-2xl p-6 shadow-md border border-white/60 hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 p-3 rounded-xl bg-gray-50 shadow-sm">
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
      </div>
      {/* === Capabilities Showcase === */}
      <Card className="border-green-200/60 bg-gradient-to-br from-green-50/70 to-emerald-50/50 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-green-900 flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Supported Mathematical Operations
          </CardTitle>
          <CardDescription className="text-green-700">
            Comprehensive backend-powered mathematical problem solving.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-green-200/40 hover:bg-green-50/80 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span className="font-medium text-green-800">{capability}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { BenefitsSection };
