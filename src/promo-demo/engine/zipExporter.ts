import JSZip from "jszip";
import { RenderedClip } from "../types";
import { GENERATED_README_CONTENT } from "../readmeContent";

export async function createClipsZipArchive(
  renderedClips: RenderedClip[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  // Add README.md
  zip.file("README.md", GENERATED_README_CONTENT);

  // Add each rendered video file
  renderedClips.forEach((clip) => {
    zip.file(clip.filename, clip.blob);
  });

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  return zipBlob;
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
