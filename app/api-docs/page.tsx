// app/api-docs/page.tsx — Swagger UI
"use client";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { getApiDocs } from "@/lib/swagger";

export default function ApiDocsPage() {
  return <SwaggerUI spec={getApiDocs()} />;
}
