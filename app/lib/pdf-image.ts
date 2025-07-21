import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set the workerSrc to the public path
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Converts the first page of a PDF file to a PNG image Blob and returns a File and its object URL.
 * @param pdfFile File or Blob representing the PDF
 * @returns Promise<{ file: File, url: string }>
 */
export async function convertPdfToImage(
  pdfFile: File | Blob
): Promise<{ file: File; url: string }> {
  // Read the PDF file as an ArrayBuffer
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  // Set up a canvas to render the PDF page
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context!, viewport }).promise;

  // Convert the canvas to a Blob (PNG)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Failed to convert PDF to image"));
      const file = new File([blob], "resume-preview.png", {
        type: "image/png",
      });
      const url = URL.createObjectURL(file);
      resolve({ file, url });
    }, "image/png");
  });
}
