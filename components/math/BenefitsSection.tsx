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

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: "Natural Language",
      description: "Write equations in plain English.",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-green-600" />,
      title: "Step-by-Step",
      description: "Detailed explanations for learning.",
    },
    {
      icon: <Target className="h-6 w-6 text-purple-600" />,
      title: "Verification",
      description: "Each solution is verified.",
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: "Instant Results",
      description: "Solutions in seconds.",
    },
    {
      icon: <Brain className="h-6 w-6 text-red-600" />,
      title: "Advanced Engine",
      description: "Supports calculus, trig, etc.",
    },
    {
      icon: <Award className="h-6 w-6 text-indigo-600" />,
      title: "Multiple Types",
      description: "Equations, expressions, integrals.",
    },
  ];

  return (
    <Card className="border-blue-200/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-blue-900">
          Advanced Math Solver
        </CardTitle>
        <CardDescription className="text-blue-700">
          With NLP and Step-by-Step
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="bg-white/80 rounded-xl p-6 shadow-sm border">
                <div className="flex items-start gap-4">
                  {benefit.icon}
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
