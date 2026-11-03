import { describe, it, expect } from "vitest";
import { parseBatchInput, sanitizeFileName } from "../../src/core/batch/parser";

describe("Batch CSV & Text Parser", () => {
  it("parses standard CSV lines with Name and URL", () => {
    const input = `
Item 1, https://site.com/1
Item 2, https://site.com/2
Item 3, https://site.com/3
    `.trim();

    const items = parseBatchInput(input);
    expect(items.length).toBe(3);
    expect(items[0]).toEqual({ id: 1, name: "Item 1", data: "https://site.com/1" });
    expect(items[1]).toEqual({ id: 2, name: "Item 2", data: "https://site.com/2" });
    expect(items[2]).toEqual({ id: 3, name: "Item 3", data: "https://site.com/3" });
  });

  it("preserves query string commas without breaking the payload", () => {
    const input = "Product_A, https://example.com/item?colors=red,blue,green";
    const items = parseBatchInput(input);
    expect(items.length).toBe(1);
    expect(items[0].name).toBe("Product_A");
    expect(items[0].data).toBe("https://example.com/item?colors=red,blue,green");
  });

  it("handles single-column input without commas gracefully", () => {
    const input = "628100123456\n628100654321\n628100987654";
    const items = parseBatchInput(input);
    expect(items.length).toBe(3);
    expect(items[0].data).toBe("628100123456");
    expect(items[0].name).toBe("item_1");
  });

  it("sanitizes forbidden filename characters", () => {
    expect(sanitizeFileName("file/with:invalid*chars?")).toBe("file_with_invalid_chars_");
  });
});
