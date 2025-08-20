import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Calculator, BookOpen } from "lucide-react"

interface MathStep {
  step: number
  description: string
  expression: string
  explanation: string
}

interface Verification {
  solution: string
  leftSide?: string
  rightSide?: string
  isCorrect?: boolean
  error?: string
}

interface MathSolution {
  originalFormula: string
  parsedFormula: string
  steps: MathStep[]
  finalAnswer: any
  verification?: Verification[]
  explanation: string
  type: "equation" | "expression" | "derivative" | "integral"
}

interface StepBySolutionProps {
  solution: MathSolution
}

export function StepBySolution({ solution }: StepBySolutionProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "equation":
        return "bg-blue-100 text-blue-800"
      case "expression":
        return "bg-green-100 text-green-800"
      case "derivative":
        return "bg-purple-100 text-purple-800"
      case "integral":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "equation":
        return <Calculator className="w-4 h-4" />
      case "expression":
        return <Calculator className="w-4 h-4" />
      case "derivative":
        return <BookOpen className="w-4 h-4" />
      case "integral":
        return <BookOpen className="w-4 h-4" />
      default:
        return <Calculator className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Problem Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getTypeIcon(solution.type)}
              Problem Analysis
            </CardTitle>
            <Badge className={getTypeColor(solution.type)}>
              {solution.type.charAt(0).toUpperCase() + solution.type.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-1">Original Input:</h4>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-lg">{solution.originalFormula}</div>
          </div>

          {solution.parsedFormula !== solution.originalFormula && (
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Parsed Formula:</h4>
              <div className="bg-blue-50 p-3 rounded-lg font-mono text-lg">{solution.parsedFormula}</div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-1">Approach:</h4>
            <p className="text-gray-700">{solution.explanation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Solution */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {solution.steps.map((step, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    Step {step.step}
                  </Badge>
                  <h4 className="font-medium text-gray-900">{step.description}</h4>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-lg mb-2">{step.expression}</div>
                <p className="text-sm text-gray-600">{step.explanation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Answer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">Final Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="font-mono text-xl text-green-800">
              {Array.isArray(solution.finalAnswer) ? solution.finalAnswer.join(" or ") : solution.finalAnswer}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification */}
      {solution.verification && solution.verification.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Solution Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {solution.verification.map((verify, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {verify.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">{verify.solution}</span>
                  </div>

                  {verify.error ? (
                    <p className="text-red-600 text-sm">{verify.error}</p>
                  ) : (
                    <div className="text-sm space-y-1">
                      <div>
                        Left side: <span className="font-mono">{verify.leftSide}</span>
                      </div>
                      <div>
                        Right side: <span className="font-mono">{verify.rightSide}</span>
                      </div>
                      <div className={verify.isCorrect ? "text-green-600" : "text-red-600"}>
                        {verify.isCorrect ? "✓ Solution is correct!" : "✗ Solution verification failed"}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
