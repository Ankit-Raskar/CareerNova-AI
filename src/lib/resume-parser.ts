// Client-side resume text extraction for TXT, PDF, DOCX.
// PDF: pdfjs-dist (lazy-loaded). DOCX: mammoth (lazy-loaded).

export type ParsedResume = { text: string; pages?: number };

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

async function parsePdf(file: File): Promise<ParsedResume> {
  const pdfjs = await import("pdfjs-dist");
  // Use bundled worker via Vite worker URL
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - vite worker import
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc;

  const buf = await readAsArrayBuffer(file);
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => (typeof it.str === "string" ? it.str : ""))
      .filter(Boolean);
    text += strings.join(" ") + "\n\n";
  }
  return { text: text.trim(), pages: doc.numPages };
}

async function parseDocx(file: File): Promise<ParsedResume> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - mammoth browser entry has no types
  const mammoth = await import("mammoth/mammoth.browser");
  const buf = await readAsArrayBuffer(file);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (mammoth as any).extractRawText({ arrayBuffer: buf });
  return { text: String(result.value || "").trim() };
}

export async function parseResumeFile(file: File): Promise<ParsedResume> {
  const name = file.name.toLowerCase();
  const type = file.type;
  if (type === "application/pdf" || name.endsWith(".pdf")) return parsePdf(file);
  if (
    name.endsWith(".docx") ||
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return parseDocx(file);
  }
  if (type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
    return { text: (await file.text()).trim() };
  }
  if (name.endsWith(".doc")) {
    throw new Error("Legacy .doc not supported. Please save as .docx or PDF.");
  }
  throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
}
