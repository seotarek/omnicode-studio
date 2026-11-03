export interface BatchItem {
  id: number;
  name: string;
  data: string;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim() || "unnamed_item";
}

export function parseBatchInput(input: string): BatchItem[] {
  if (!input) return [];
  const lines = input.split(/\r?\n/);
  const items: BatchItem[] = [];

  let idx = 1;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;

    const currentId = idx++;
    const commaIndex = line.indexOf(",");
    if (commaIndex !== -1) {
      const rawName = line.slice(0, commaIndex).trim();
      const rawData = line.slice(commaIndex + 1).trim();
      if (rawData) {
        items.push({
          id: currentId,
          name: sanitizeFileName(rawName || `item_${currentId}`),
          data: rawData
        });
      } else if (rawName) {
        items.push({
          id: currentId,
          name: `item_${currentId}`,
          data: rawName
        });
      }
    } else {
      items.push({
        id: currentId,
        name: `item_${currentId}`,
        data: line
      });
    }
  }

  return items;
}
