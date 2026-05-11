import { buildVerificationResult } from "@/lib/compare";
import { parseBatchCsv } from "@/lib/csv";
import { extractLabelFromImage } from "@/lib/extract";

export const runtime = "nodejs";
export const maxDuration = 300;

type BatchJob = Awaited<ReturnType<typeof parseBatchCsv>>[number];

export async function POST(request: Request) {
  const formData = await request.formData();
  const csvFile = formData.get("csv");

  if (!(csvFile instanceof File)) {
    return Response.json({ error: "Missing CSV file." }, { status: 400 });
  }

  const csvText = await csvFile.text();
  let rows: BatchJob[];

  try {
    rows = parseBatchCsv(csvText);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid CSV." },
      { status: 400 },
    );
  }

  const files = new Map<string, File>();
  for (const entry of formData.getAll("images")) {
    if (
      entry instanceof File &&
      ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(entry.type)
    ) {
      files.set(entry.name, entry);
    }
  }

  const encoder = new TextEncoder();
  const concurrency = 5;

  const stream = new ReadableStream({
    async start(controller) {
      let cursor = 0;

      async function worker() {
        while (cursor < rows.length) {
          const row = rows[cursor];
          cursor += 1;
          const file = files.get(row.imageFile);

          if (!file) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  rowId: row.rowId,
                  imageFile: row.imageFile,
                  status: "error",
                  error: `No uploaded image matched ${row.imageFile}.`,
                }) + "\n",
              ),
            );
            continue;
          }

          try {
            const extracted = await extractLabelFromImage(
              new Uint8Array(await file.arrayBuffer()),
              file.type || "image/*",
            );
            const result = buildVerificationResult(row, extracted);

            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  rowId: row.rowId,
                  imageFile: row.imageFile,
                  status: result.summary.status,
                  result,
                }) + "\n",
              ),
            );
          } catch (error) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  rowId: row.rowId,
                  imageFile: row.imageFile,
                  status: "error",
                  error: error instanceof Error ? error.message : "Unable to process row.",
                }) + "\n",
              ),
            );
          }
        }
      }

      await Promise.all(Array.from({ length: Math.min(concurrency, rows.length) }, worker));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
