import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Download,
  Film,
  Sparkles,
  CheckCircle,
  FileText,
  Archive,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Monitor,
  Eye,
  Sliders,
  Check,
  AlertCircle,
  Copy,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { PROMO_CLIPS_CATALOG, CONSISTENT_DEMO_ORDER } from "./mockData";
import { ClipDefinition, RenderedClip, StudioTab } from "./types";
import { renderClip1Frame } from "./clips/Clip1Discover";
import { renderClip2Frame } from "./clips/Clip2SelectMeal";
import { renderClip3Frame } from "./clips/Clip3AddToCart";
import { renderClip4Frame } from "./clips/Clip4PickupOrder";
import { renderClip5Frame } from "./clips/Clip5MerchantReceive";
import { renderClip6Frame } from "./clips/Clip6ReadyCollection";
import { recordClipToVideo } from "./engine/videoRecorder";
import { createClipsZipArchive, triggerDownload } from "./engine/zipExporter";
import { GENERATED_README_CONTENT } from "./readmeContent";

interface PromoClipsStudioProps {
  onBackToApp?: () => void;
}

export function PromoClipsStudio({ onBackToApp }: PromoClipsStudioProps) {
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<StudioTab>("studio");
  const [renderedClips, setRenderedClips] = useState<Record<string, RenderedClip>>({});
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderingProgress, setRenderingProgress] = useState<number>(0);
  const [renderingStatusText, setRenderingStatusText] = useState<string>("");
  const [isPlayingFullWorkflow, setIsPlayingFullWorkflow] = useState<boolean>(false);
  const [copiedReadme, setCopiedReadme] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);

  // Hidden 1920x1080 master canvas for real-time rendering and video recording
  const masterCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Visible preview canvas
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback timer & progress
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animationFrameIdRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const pausedProgressRef = useRef<number>(0);

  const activeClip = PROMO_CLIPS_CATALOG[activeClipIndex];

  // Map of clip renderers
  const clipRenderers: Record<string, (ctx: CanvasRenderingContext2D, f: number, tf: number) => void> = {
    "clip-1-discover": renderClip1Frame,
    "clip-2-select": renderClip2Frame,
    "clip-3-cart": renderClip3Frame,
    "clip-4-pickup": renderClip4Frame,
    "clip-5-merchant": renderClip5Frame,
    "clip-6-ready": renderClip6Frame,
  };

  // Render a specific frame onto a target canvas
  const drawFrame = useCallback(
    (canvas: HTMLCanvasElement, clipId: string, progressFraction: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const renderer = clipRenderers[clipId];
      if (renderer) {
        const totalFrames = 150;
        const currentFrame = Math.min(totalFrames - 1, Math.round(progressFraction * (totalFrames - 1)));
        renderer(ctx, currentFrame, totalFrames);
      }
    },
    []
  );

  // Redraw preview whenever active clip or playback progress updates
  useEffect(() => {
    if (previewCanvasRef.current) {
      drawFrame(previewCanvasRef.current, activeClip.id, playbackProgress);
    }
  }, [activeClip.id, playbackProgress, drawFrame]);

  // Handle Play / Pause animation loop
  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    playbackStartTimeRef.current = performance.now() - pausedProgressRef.current * (activeClip.durationSeconds * 1000);

    const step = (now: number) => {
      const elapsed = now - playbackStartTimeRef.current;
      const durationMs = activeClip.durationSeconds * 1000;
      let nextProgress = elapsed / durationMs;

      if (nextProgress >= 1) {
        if (isPlayingFullWorkflow) {
          // Advance to next clip in workflow
          if (activeClipIndex < PROMO_CLIPS_CATALOG.length - 1) {
            setActiveClipIndex((prev) => prev + 1);
            pausedProgressRef.current = 0;
            playbackStartTimeRef.current = performance.now();
            animationFrameIdRef.current = requestAnimationFrame(step);
            return;
          } else {
            setIsPlayingFullWorkflow(false);
          }
        }
        nextProgress = 1;
        setIsPlaying(false);
        pausedProgressRef.current = 0;
        setPlaybackProgress(1);
        return;
      }

      setPlaybackProgress(nextProgress);
      pausedProgressRef.current = nextProgress;
      animationFrameIdRef.current = requestAnimationFrame(step);
    };

    animationFrameIdRef.current = requestAnimationFrame(step);
  }, [activeClip.durationSeconds, activeClipIndex, isPlayingFullWorkflow]);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    setIsPlayingFullWorkflow(false);
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  }, []);

  const togglePlayPause = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      if (playbackProgress >= 1) {
        setPlaybackProgress(0);
        pausedProgressRef.current = 0;
      }
      startPlayback();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    pausePlayback();
    pausedProgressRef.current = val;
    setPlaybackProgress(val);
  };

  // Play Complete Workflow
  const handlePlayCompleteWorkflow = () => {
    pausePlayback();
    setActiveClipIndex(0);
    setPlaybackProgress(0);
    pausedProgressRef.current = 0;
    setIsPlayingFullWorkflow(true);
    setTimeout(() => {
      startPlayback();
    }, 50);
  };

  // Render Single Clip to Video File
  const handleRenderSingleClip = async (clip: ClipDefinition) => {
    if (!masterCanvasRef.current || isRendering) return;

    pausePlayback();
    setIsRendering(true);
    setRenderingProgress(0);
    setRenderingStatusText(`Encoding ${clip.title} (1920x1080 @ 30fps)...`);

    try {
      const renderer = clipRenderers[clip.id];
      const result = await recordClipToVideo({
        clip,
        canvas: masterCanvasRef.current,
        renderFrame: (f, tf) => {
          const ctx = masterCanvasRef.current?.getContext("2d");
          if (ctx) renderer(ctx, f, tf);
        },
        onProgress: (pct) => {
          setRenderingProgress(pct);
        },
      });

      setRenderedClips((prev) => ({
        ...prev,
        [clip.id]: result,
      }));

      setRenderingStatusText(`Completed ${clip.filename}!`);
    } catch (err: any) {
      console.error("Render failed:", err);
      setRenderingStatusText(`Error: ${err.message || String(err)}`);
    } finally {
      setIsRendering(false);
    }
  };

  // Render All 6 Clips in Batch
  const handleRenderAllClips = async () => {
    if (!masterCanvasRef.current || isRendering) return;

    pausePlayback();
    setIsRendering(true);

    for (let i = 0; i < PROMO_CLIPS_CATALOG.length; i++) {
      const clip = PROMO_CLIPS_CATALOG[i];
      setActiveClipIndex(i);
      setRenderingStatusText(`Rendering Clip ${i + 1} of 6: ${clip.title}...`);

      const renderer = clipRenderers[clip.id];
      const result = await recordClipToVideo({
        clip,
        canvas: masterCanvasRef.current,
        renderFrame: (f, tf) => {
          const ctx = masterCanvasRef.current?.getContext("2d");
          if (ctx) renderer(ctx, f, tf);
        },
        onProgress: (pct) => {
          const overallPct = Math.round(((i + pct / 100) / PROMO_CLIPS_CATALOG.length) * 100);
          setRenderingProgress(overallPct);
        },
      });

      setRenderedClips((prev) => ({
        ...prev,
        [clip.id]: result,
      }));
    }

    setRenderingStatusText("All 6 clips successfully rendered!");
    setIsRendering(false);
  };

  // Download ZIP Archive of all 6 clips + README
  const handleDownloadAllZip = async () => {
    // If not all 6 clips rendered yet, automatically batch render the missing ones first!
    let currentClips = { ...renderedClips };
    const missingClips = PROMO_CLIPS_CATALOG.filter((c) => !currentClips[c.id]);

    if (missingClips.length > 0) {
      setIsRendering(true);
      for (let i = 0; i < missingClips.length; i++) {
        const clip = missingClips[i];
        setRenderingStatusText(`Rendering missing clip ${clip.clipNumber}: ${clip.title}...`);
        const renderer = clipRenderers[clip.id];
        if (masterCanvasRef.current && renderer) {
          const res = await recordClipToVideo({
            clip,
            canvas: masterCanvasRef.current,
            renderFrame: (f, tf) => {
              const ctx = masterCanvasRef.current?.getContext("2d");
              if (ctx) renderer(ctx, f, tf);
            },
            onProgress: (pct) => {
              setRenderingProgress(pct);
            },
          });
          currentClips[clip.id] = res;
          setRenderedClips((prev) => ({ ...prev, [clip.id]: res }));
        }
      }
      setIsRendering(false);
    }

    setIsZipping(true);
    setZipProgress(0);

    try {
      const clipsList = PROMO_CLIPS_CATALOG.map((c) => currentClips[c.id]).filter(Boolean);
      const zipBlob = await createClipsZipArchive(clipsList, (pct) => {
        setZipProgress(pct);
      });

      triggerDownload(zipBlob, "LocalEats_Synthesia_Promo_Clips.zip");
    } catch (err: any) {
      console.error("ZIP creation failed:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyReadme = async () => {
    try {
      await navigator.clipboard.writeText(GENERATED_README_CONTENT);
      setCopiedReadme(true);
      setTimeout(() => setCopiedReadme(false), 2500);
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  const allClipsRendered = PROMO_CLIPS_CATALOG.every((c) => renderedClips[c.id]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Hidden Master 1920x1080 Canvas for Video Recording */}
      <canvas
        ref={masterCanvasRef}
        width={1920}
        height={1080}
        className="hidden pointer-events-none fixed -top-[9999px] -left-[9999px]"
      />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to LocalEats App</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-orange-600/30">
              🎬
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>LocalEats Promo Clips Studio</span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase">
                  1920 × 1080 30FPS
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Standalone generator for missing Synthesia promotional video clips
              </p>
            </div>
          </div>
        </div>

        {/* Studio Navigation Tabs & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab("studio")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "studio"
                  ? "bg-orange-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Clips Studio</span>
            </button>
            <button
              onClick={() => setActiveTab("readme")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "readme"
                  ? "bg-orange-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Synthesia Guide (README)</span>
            </button>
            <button
              onClick={() => setActiveTab("inspect")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "inspect"
                  ? "bg-orange-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Mock Data & Consistency</span>
            </button>
          </div>

          <button
            onClick={handleDownloadAllZip}
            disabled={isRendering || isZipping}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isZipping ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
            <span>
              {isZipping
                ? `Creating ZIP (${zipProgress}%)...`
                : "Download All Clips (ZIP)"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      {activeTab === "studio" && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 6 Clip Cards List */}
          <section className="lg:col-span-4 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 mb-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Demonstration Clips (6)
              </h2>
              <button
                onClick={handlePlayCompleteWorkflow}
                disabled={isPlaying || isRendering}
                className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play Full Workflow</span>
              </button>
            </div>

            {PROMO_CLIPS_CATALOG.map((clip, idx) => {
              const isSelected = activeClipIndex === idx;
              const rendered = renderedClips[clip.id];

              return (
                <div
                  key={clip.id}
                  onClick={() => {
                    pausePlayback();
                    setActiveClipIndex(idx);
                    setPlaybackProgress(0);
                    pausedProgressRef.current = 0;
                  }}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-2 ${
                    isSelected
                      ? "bg-slate-800/90 border-orange-500/80 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30"
                      : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-700/80 text-orange-400 font-mono font-black text-xs flex items-center justify-center">
                        {clip.clipNumber}
                      </span>
                      <h3 className="font-bold text-sm text-white">
                        {clip.title}
                      </h3>
                    </div>

                    {rendered ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Rendered
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">
                        ~{clip.durationSeconds}s
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {clip.subtitle}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 mt-1">
                    <span className="font-mono text-[10px] text-slate-400">
                      {clip.filename}
                    </span>
                    <span className="text-amber-400/90 font-medium">
                      {clip.synthesiaPlacement.split(":")[0]}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Batch Render CTA */}
            <button
              onClick={handleRenderAllClips}
              disabled={isRendering || isZipping}
              className="mt-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Batch Pre-Render All 6 Clips</span>
            </button>
          </section>

          {/* Right Column: 1920x1080 Video Preview Player & Download Deck */}
          <section className="lg:col-span-8 flex flex-col gap-4">
            {/* Player Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              {/* Preview Canvas (Scaled responsive preview of 1920x1080 master frame) */}
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                <canvas
                  ref={previewCanvasRef}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-contain"
                />

                {/* Status Overlay when rendering */}
                {isRendering && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                    <div className="w-14 h-14 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin mb-4" />
                    <h3 className="text-base font-bold text-white mb-1">
                      {renderingStatusText}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mb-4">
                      Encoding 1920×1080 canvas stream at 30 fps using browser MediaRecorder...
                    </p>
                    <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-orange-500 transition-all duration-150"
                        style={{ width: `${renderingProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-400 mt-2">
                      {renderingProgress}%
                    </span>
                  </div>
                )}
              </div>

              {/* Scrubber & Controls Toolbar */}
              <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-col gap-3">
                {/* Timeline Scrubber */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-12 text-right">
                    {(playbackProgress * activeClip.durationSeconds).toFixed(1)}s
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.005"
                    value={playbackProgress}
                    onChange={handleSeek}
                    className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <span className="text-xs font-mono text-slate-400 w-12">
                    {activeClip.durationSeconds.toFixed(1)}s
                  </span>
                </div>

                {/* Bottom Buttons Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition active:scale-95"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Play Preview</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        pausePlayback();
                        setPlaybackProgress(0);
                        pausedProgressRef.current = 0;
                      }}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                      title="Reset Timeline to 0:00"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Render & Download Controls for Current Clip */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRenderSingleClip(activeClip)}
                      disabled={isRendering}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Film className="w-3.5 h-3.5 text-orange-400" />
                      <span>{renderedClips[activeClip.id] ? "Re-Render" : "Render Video"}</span>
                    </button>

                    {renderedClips[activeClip.id] && (
                      <button
                        onClick={() =>
                          triggerDownload(
                            renderedClips[activeClip.id].blob,
                            renderedClips[activeClip.id].filename
                          )
                        }
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Clip {activeClip.clipNumber}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Clip Synthesia Specifications Card */}
            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Synthesia Placement & Directives — Clip {activeClip.clipNumber}
                  </h3>
                  <p className="text-xs text-orange-400 font-medium">
                    {activeClip.synthesiaPlacement}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono border border-slate-700">
                    Target: 1920×1080 @ 30fps
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeClip.description}
              </p>

              {/* Verified Quality Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                {activeClip.keyHighlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* README & Synthesia Guide Tab */}
      {activeTab === "readme" && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">
                  README.md — Synthesia Integration Documentation
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Bundled into the exported ZIP archive alongside all 6 video files
                </p>
              </div>

              <button
                onClick={handleCopyReadme}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition"
              >
                {copiedReadme ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReadme ? "Copied to Clipboard!" : "Copy README Text"}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-2xl text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
              {GENERATED_README_CONTENT}
            </pre>
          </div>
        </main>
      )}

      {/* Mock Data & Journey Consistency Inspector Tab */}
      {activeTab === "inspect" && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-lg font-black text-white">
              Simulated Journey Consistency Assurance
            </h2>
            <p className="text-xs text-slate-400">
              Zero production databases or real payment gateways are modified. The exact same customer data, order ID, items, and pricing are synchronized across all six clips.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Customer & Merchant
                </span>
                <p className="text-sm font-bold text-white">
                  {CONSISTENT_DEMO_ORDER.customerName}
                </p>
                <p className="text-xs text-slate-400">
                  {CONSISTENT_DEMO_ORDER.customerPhone}
                </p>
                <p className="text-xs text-orange-400 font-bold mt-2">
                  Merchant: {CONSISTENT_DEMO_ORDER.shopName}
                </p>
                <p className="text-xs text-slate-400">
                  {CONSISTENT_DEMO_ORDER.shopAddress}
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Order & Financials
                </span>
                <p className="text-sm font-bold text-white">
                  Order Reference: {CONSISTENT_DEMO_ORDER.orderNumber}
                </p>
                <p className="text-xs text-slate-300">
                  Item: {CONSISTENT_DEMO_ORDER.itemName} (x{CONSISTENT_DEMO_ORDER.quantity})
                </p>
                <p className="text-xs text-emerald-400 font-bold mt-1">
                  Fulfillment: Collection / Counter Pickup (R 0.00 fee)
                </p>
                <p className="text-sm font-black text-orange-400 mt-2">
                  Total Due at Counter: R {CONSISTENT_DEMO_ORDER.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-2xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-300 leading-relaxed">
                <strong>Zero Rider / Delivery / Online Payment Enforcement:</strong> Per your project brief, all clips exclude courier maps, delivery riders, bicycles, and online credit card charges. The customer journey strictly highlights frictionless township counter pickup.
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
