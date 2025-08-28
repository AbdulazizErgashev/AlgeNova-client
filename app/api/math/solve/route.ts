import { type NextRequest, NextResponse } from "next/server";

interface MathSolveRequest {
  formula: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API route called");

    const body: MathSolveRequest = await request.json();
    console.log("[v0] Request body:", body);

    if (!body.formula) {
      return NextResponse.json(
        { error: "Formula is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      // "http://algenova-server.onrender.com/api/math/solve",
      "http://localhost:5000/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formula: body.formula }),
      }
    );

    console.log("[v0] External API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[v0] External API error:", errorText);

      return NextResponse.json(
        {
          error: `Math server error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    } else {
      console.log(response);
    }

    const contentType = response.headers.get("content-type");
    console.log("[v0] Response content-type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.log("[v0] Non-JSON response received:", textResponse);

      // Try to parse as JSON anyway in case content-type header is missing
      try {
        const jsonData = JSON.parse(textResponse);
        console.log("[v0] Successfully parsed JSON from text response");
        return NextResponse.json(jsonData);
      } catch {
        return NextResponse.json(
          {
            error: "Invalid response format from math server",
            details: `Expected JSON but received: ${textResponse}`,
          },
          { status: 502 }
        );
      }
    }

    const data = await response.json();
    console.log("[v0] External API success, returning data:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] API route error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch")
      ) {
        return NextResponse.json(
          {
            error: "Unable to connect to math solver server",
            details:
              "Please ensure your math server at http://192.168.1.86:5000 is running and accessible",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
