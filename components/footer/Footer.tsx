import React from "react";
import { Badge } from "@/components/ui/badge";

const Footer = () => {
  return (
    <footer className="py-8 border-t mt-16 bg-gradient-to-r from-white/70 to-gray-50/70 backdrop-blur-md">
      <div className={`max-w-5xl w-full mx-auto px-4`}>
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
      </div>
    </footer>
  );
};

export default Footer;
