import React from "react";
import { Badge } from "@/components/ui/badge";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = "" }) => (
  <div className={`max-w-6xl w-full mx-auto px-4 ${className}`}>{children}</div>
);

const Footer = () => {
  return (
    <footer className="py-10 border-t bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm shadow-sm">
      <Section>
        {/* Top Part */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <span className="font-medium text-gray-700 text-center md:text-left">
            <span className="font-bold text-primary">AlgeNova</span> — The
            Advanced Math Solver
          </span>

          <div className="flex items-center flex-wrap justify-center md:justify-end gap-2">
            {[
              "Step-by-Step Explanations",
              "Algebra • Geometry • Calculus",
              "Covers All Math Levels",
              "Fast & Accurate Results",
            ].map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-medium shadow-sm hover:scale-[1.05] transition-transform"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bottom Part */}
        <div className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-gray-700">AlgeNova</span>. All
          rights reserved.
        </div>
      </Section>
    </footer>
  );
};

export default Footer;
