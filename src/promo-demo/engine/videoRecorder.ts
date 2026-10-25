import { ClipDefinition, RenderedClip } from "../types";

export interface RecordOptions {
  clip: ClipDefinition;
  canvas: HTMLCanvasElement;
  renderFrame: (frame: number, totalFrames: number) => void;
  onProgress?: (percent: number, currentFrame: number, totalFrames: number) => void;
}

export function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4;codecs=avc1",
    "video/mp4",
  ];

  if (typeof MediaRecorder === "undefined") {
    return "video/webm";
  }

  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }

  return "video/webm";
}

/**
 * Record a deterministic sequence of canvas frames into a high-quality video file
 */
export async function recordClipToVideo(options: RecordOptions): Promise<RenderedClip> {
  const { clip, canvas, renderFrame, onProgress } = options;
  const fps = clip.fps || 30;
  const totalFrames = Math.round(clip.durationSeconds * fps);
  const mimeType = getSupportedMimeType();

  // Draw initial frame
  renderFrame(0, totalFrames);

  // Setup stream
  const stream = canvas.captureStream(fps);
  const recorderOptions: MediaRecorderOptions = {
    mimeType,
    videoBitsPerSecond: 8000000, // 8 Mbps high clarity for 1080p
  };

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, recorderOptions);
  } catch (e) {
    console.warn("Falling back to default MediaRecorder options:", e);
    recorder = new MediaRecorder(stream);
  }

  const recordedChunks: Blob[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const finalBlob = new Blob(recordedChunks, { type: recorder.mimeType || mimeType });
      resolve(finalBlob);
    };
    recorder.onerror = (err) => {
      reject(err);
    };
  });

  // Start recording
  recorder.start();

  // Advance frames deterministically using requestAnimationFrame / setTimeout pacing
  const frameIntervalMs = 1000 / fps;

  for (let f = 0; f < totalFrames; f++) {
    renderFrame(f, totalFrames);

    if (onProgress) {
      const pct = Math.round(((f + 1) / totalFrames) * 100);
      onProgress(pct, f + 1, totalFrames);
    }

    // Yield control to browser to allow canvas captureStream to encode the frame
    await new Promise((res) => setTimeout(res, frameIntervalMs));
  }

  // Request final data and stop
  if (recorder.state === "recording") {
    recorder.requestData();
    recorder.stop();
  }

  const videoBlob = await recordingPromise;
  const videoUrl = URL.createObjectURL(videoBlob);

  const rendered: RenderedClip = {
    id: clip.id,
    clipNumber: clip.clipNumber,
    filename: clip.filename,
    blob: videoBlob,
    url: videoUrl,
    durationSeconds: clip.durationSeconds,
    sizeBytes: videoBlob.size,
    width: canvas.width,
    height: canvas.height,
    mimeType: videoBlob.type || mimeType,
    timestamp: Date.now(),
  };

  return rendered;
}
