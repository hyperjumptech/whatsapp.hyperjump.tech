// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";
import { WhatsappClient } from "./client.js";

// Mock the global fetch function
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("whatsappClient", () => {
  beforeEach(() => {
    // Reset mock before each test
    mockFetch.mockClear();
  });

  it("TEST#1: should call fetch with the correct url", async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        meta: { api_status: "success" },
        messages: [{ id: "test-id" }],
      }),
    });

    const client = new WhatsappClient(
      "1234567890",
      "aaa",
      "https://localhost:3000"
    );

    await client.send("confirmation", ["test", "test2", "test3"], "test4");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://localhost:3000/1234567890/messages",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer aaa",
          "Content-Type": "application/json",
        },
        body: expect.any(String),
      })
    );
  });

  it("TEST#2: should handle fetch error when response is not ok", async () => {
    // Mock failed response
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    const client = new WhatsappClient(
      "1234567890",
      "aaa",
      "https://localhost:3000"
    );

    const result = await client.send("confirmation", ["test"], "test4");

    expect(result.error).toBe("FETCH_ERROR");
    expect(result.data).toBeNull();
  });

  it("TEST#3: should return successful response data", async () => {
    const mockData = {
      meta: { api_status: "success" },
      messages: [{ id: "test-id" }],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const client = new WhatsappClient(
      "1234567890",
      "aaa",
      "https://localhost:3000"
    );

    const result = await client.send("confirmation", ["test"], "test4");

    expect(result.error).toBeNull();
    expect(result.data).toEqual(mockData);
  });

  it("TEST#4: should handle JSON parse error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    const client = new WhatsappClient(
      "1234567890",
      "aaa",
      "https://localhost:3000"
    );

    const result = await client.send("confirmation", ["test"], "test4");

    expect(result.error).toBe("PARSE_JSON_ERROR");
    expect(result.data).toBeNull();
  });

  it("TEST#5: should call fetch with the correct body", async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        meta: { api_status: "success" },
        messages: [{ id: "test-id" }],
      }),
    });

    const client = new WhatsappClient(
      "1234567890",
      "aaa",
      "https://localhost:3000"
    );

    await client.send("confirmation", ["test"], "test4");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://localhost:3000/1234567890/messages",
      expect.objectContaining({
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: "test4",
          type: "template",
          template: {
            name: "confirmation",
            language: {
              code: "en",
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: "test",
                  },
                ],
              },
            ],
          },
        }),
      })
    );
  });
});
