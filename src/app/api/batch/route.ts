import { buildVerificationResult, summarize } from "@/lib/compare";
import { checkCompliance } from "@/lib/compliance";
import { parseBatchCsv } from "@/lib/csv";
import { extractLabelFromImage } from "@/lib/extract";
import { PublicError, assertCsvFile, validateBatchImageFiles } from "@/lib/limits";
import { beverageTypes, type BeverageType, type VerificationResult } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 300;

type BatchJob = {
  rowId: string;
  imageFile: string;
  file: File | undefined;
  expected: Awaited<ReturnType<typeof parseBatchCsv>>[number] | null;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get("csv");
    const hasCsv = csvFile instanceof File && csvFile.size > 0;

    if (hasCsv) assertCsvFile(csvFile);

    const beverageTypeValue = formData.get("beverageType");
    const overrideBeverageType: BeverageType | null =
      typeof beverageTypeValue === "string" &&
      beverageTypes.includes(beverageTypeValue as BeverageType)
        ? (beverageTypeValue as BeverageType)
        : null;

    const uploadedImages = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File);
    validateBatchImageFiles(uploadedImages);

    const files = new Map<string, File>();
    for (const file of uploadedImages) {
      files.set(file.name, file);
    }

    let jobs: BatchJob[];

    if (hasCsv) {
      const rows = parseBatchCsv(await (csvFile as File).text());
      jobs = rows.map((row) => ({
        rowId: row.rowId,
        imageFile: row.imageFile,
        file: files.get(row.imageFile),
        expected: row,
      }));
    } else {
      jobs = [...files.entries()].map(([name, file], index) => ({
        rowId: String(index + 1),
        imageFile: name,
        file,
        expected: null,
      }));
    }

    const encoder = new TextEncoder();
    const concurrency = 5;

    const stream = new ReadableStream({
      async start(controller) {
        let cursor = 0;

        async function worker() {
          while (cursor < jobs.length) {
            const job = jobs[cursor];
            cursor += 1;

            if (!job.file) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    rowId: job.rowId,
                    imageFile: job.imageFile,
                    status: "error",
                    error: `No uploaded image matched ${job.imageFile}.`,
                  }) + "\n",
                ),
              );
              continue;
            }

            try {
              const extracted = await extractLabelFromImage(
                new Uint8Array(await job.file.arrayBuffer()),
                job.file.type || "image/*",
              );

              let result: VerificationResult;
              if (job.expected) {
                result = buildVerificationResult(
                  overrideBeverageType
                    ? { ...job.expected, beverageType: overrideBeverageType }
                    : job.expected,
                  extracted,
                );
              } else {
                const beverageType =
                  overrideBeverageType ?? extracted.detectedBeverageType ?? "spirits";
                const complianceChecks = checkCompliance(extracted, beverageType);
                result = {
                  extracted,
                  fieldVerdicts: [],
                  complianceChecks,
                  summary: summarize(complianceChecks),
                };
              }

              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    rowId: job.rowId,
                    imageFile: job.imageFile,
                    status: result.summary.status,
                    result,
                  }) + "\n",
                ),
              );
            } catch (error) {
              console.error(error);
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    rowId: job.rowId,
                    imageFile: job.imageFile,
                    status: "error",
                    error: "Unable to process this row. Try a clearer image or run it individually.",
                  }) + "\n",
                ),
              );
            }
          }
        }

        await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof PublicError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return Response.json({ error: "Unable to process the batch." }, { status: 400 });
  }
}
