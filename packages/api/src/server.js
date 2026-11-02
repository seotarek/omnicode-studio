import { app } from "./app.js";

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`[OmniCode API] Service running on http://${HOST}:${PORT}`);
  console.log(`[OmniCode API] OpenAPI Specification: http://${HOST}:${PORT}/api/v1/spec`);
});
