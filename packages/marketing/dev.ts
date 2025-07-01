import { GET } from "./src/entry.server";

const server = Bun.serve({
  port: 3001,
  async fetch(request) {
    // Route all requests to the server entry
    return await GET();
  },
  error(error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(
  `🚀 Marketing development server running at http://localhost:${server.port}`,
);
