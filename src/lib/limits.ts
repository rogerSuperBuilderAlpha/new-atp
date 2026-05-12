export const supportedImageTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"] as const;

export const supportedCsvTypes = new Set([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "text/plain",
  "",
]);

export const uploadLimits = {
  maxImages: 50,
  maxImageBytes: 4 * 1024 * 1024,
  maxTotalImageBytes: 80 * 1024 * 1024,
  maxCsvBytes: 512 * 1024,
  maxCsvRows: 300,
  maxCsvCellChars: 2_000,
};

export class PublicError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PublicError";
    this.status = status;
  }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function assertSupportedImage(file: File) {
  if (!supportedImageTypes.includes(file.type as (typeof supportedImageTypes)[number])) {
    throw new PublicError(`${file.name || "Uploaded file"} must be a PNG, JPEG, GIF, or WEBP image.`);
  }
}

export function assertImageSize(file: File) {
  if (file.size > uploadLimits.maxImageBytes) {
    throw new PublicError(
      `${file.name || "Uploaded image"} is ${formatBytes(file.size)}. The per-image limit is ${formatBytes(
        uploadLimits.maxImageBytes,
      )}.`,
    );
  }
}

export function assertCsvFile(file: File) {
  if (file.size > uploadLimits.maxCsvBytes) {
    throw new PublicError(
      `${file.name || "CSV file"} is ${formatBytes(file.size)}. The CSV limit is ${formatBytes(
        uploadLimits.maxCsvBytes,
      )}.`,
    );
  }

  if (!supportedCsvTypes.has(file.type)) {
    throw new PublicError(`${file.name || "CSV file"} must be a CSV file.`);
  }
}

export function validateBatchImageFiles(files: File[]) {
  if (files.length === 0) {
    throw new PublicError("Choose at least one label image.");
  }

  if (files.length > uploadLimits.maxImages) {
    throw new PublicError(`Upload at most ${uploadLimits.maxImages} label images per batch.`);
  }

  const seenNames = new Set<string>();
  let totalBytes = 0;

  for (const file of files) {
    assertSupportedImage(file);
    assertImageSize(file);
    totalBytes += file.size;

    if (seenNames.has(file.name)) {
      throw new PublicError(`Duplicate uploaded filename "${file.name}". Filenames must be unique.`);
    }
    seenNames.add(file.name);
  }

  if (totalBytes > uploadLimits.maxTotalImageBytes) {
    throw new PublicError(
      `The selected images total ${formatBytes(totalBytes)}. The batch limit is ${formatBytes(
        uploadLimits.maxTotalImageBytes,
      )}.`,
    );
  }
}
