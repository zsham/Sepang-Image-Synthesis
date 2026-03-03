/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Zap, Image as ImageIcon, Loader2, Download, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize AI
const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [sourceImage1, setSourceImage1] = useState<string | null>(null);
  const [sourceImage2, setSourceImage2] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (index === 1) setSourceImage1(reader.result as string);
        else setSourceImage2(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!sourceImage1 && !sourceImage2) return;

    setIsProcessing(true);
    setError(null);

    try {
      const ai = getAI();
      const parts: any[] = [];

      if (sourceImage1) {
        parts.push({
          inlineData: {
            data: sourceImage1.split(',')[1],
            mimeType: sourceImage1.split(';')[0].split(':')[1],
          },
        });
      }

      if (sourceImage2) {
        parts.push({
          inlineData: {
            data: sourceImage2.split(',')[1],
            mimeType: sourceImage2.split(';')[0].split(':')[1],
          },
        });
      }

      parts.push({
        text: 'Combine these subjects and place them on the Sepang International Circuit race track. CRITICAL: Do not change the appearance, color, model, or any details of the motorcycles/subjects in the uploaded images. They must be preserved exactly as they appear. The background should show the iconic grandstand or the track curves of Sepang. Integrate them realistically into the racing environment using only lighting, shadows, and perspective adjustments. They should look like they are part of the same scene at the track without any modifications to the subjects themselves.',
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: parts,
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setResultImage(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error('AI did not return an image. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process image. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setSourceImage1(null);
    setSourceImage2(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-white/10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="text-black fill-current" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase italic">Sepang Image Synthesis</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">High Performance Image Synthesis</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-widest text-white/60 font-semibold">
          <span>System: Online</span>
          <span>Status: Ready</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload & Controls */}
        <div className="space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-500">Input Module</h2>
              <span className="text-[10px] text-white/30 font-mono">01 / SOURCE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Slot 1 */}
              <div 
                onClick={() => fileInputRef1.current?.click()}
                className={`relative aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
                  ${sourceImage1 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                {sourceImage1 ? (
                  <img src={sourceImage1} alt="Source 1" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <Upload className="mb-2 text-white/20 group-hover:text-emerald-500 transition-colors" size={32} />
                    <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-widest">Upload Image 1</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef1} 
                  onChange={(e) => handleImageUpload(e, 1)} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {/* Slot 2 */}
              <div 
                onClick={() => fileInputRef2.current?.click()}
                className={`relative aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
                  ${sourceImage2 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                {sourceImage2 ? (
                  <img src={sourceImage2} alt="Source 2" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <Upload className="mb-2 text-white/20 group-hover:text-emerald-500 transition-colors" size={32} />
                    <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-widest">Upload Image 2</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef2} 
                  onChange={(e) => handleImageUpload(e, 2)} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                disabled={(!sourceImage1 && !sourceImage2) || isProcessing}
                onClick={processImage}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/20 text-black font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 group"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Zap className="group-hover:scale-110 transition-transform" size={20} />
                    Teleport to Sepang
                  </>
                )}
              </button>
              
              {(sourceImage1 || sourceImage2) && (
                <button 
                  onClick={reset}
                  className="w-full py-3 border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  Reset Session
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs">
                {error}
              </div>
            )}
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Technical Specs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                <p className="text-[10px] text-white/30 uppercase mb-1">Target Location</p>
                <p className="text-xs font-mono">Sepang Circuit, MY</p>
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                <p className="text-[10px] text-white/30 uppercase mb-1">Processing Mode</p>
                <p className="text-xs font-mono">Multi-Subject Synthesis</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Result */}
        <div className="space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-500">Output Module</h2>
              <span className="text-[10px] text-white/30 font-mono">02 / SYNTHESIS</span>
            </div>

            <div className="flex-1 relative rounded-xl border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center min-h-[400px]">
              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative">
                      <Loader2 className="animate-spin text-emerald-500" size={64} />
                      <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/50" size={24} />
                    </div>
                    <p className="text-sm font-mono text-emerald-500 animate-pulse uppercase tracking-widest">Synthesizing Multi-Subject Scene...</p>
                  </motion.div>
                ) : resultImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full flex flex-col"
                  >
                    <img src={resultImage} alt="Result" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-6 right-6 flex gap-3">
                      <a 
                        href={resultImage} 
                        download="sepang-combined.png"
                        className="p-3 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors shadow-lg"
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 text-white/20"
                  >
                    <ImageIcon size={64} />
                    <p className="text-sm uppercase tracking-widest">Awaiting Synthesis</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
              <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest mb-1">AI Log</p>
              <p className="text-xs text-emerald-500/80 leading-relaxed italic">
                {isProcessing ? "Analyzing multiple subjects and track geometry..." : 
                 resultImage ? "Multi-subject synthesis complete. Lighting and perspective unified for Sepang." : 
                 "System ready. Upload one or two images to combine them at the track."}
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-[10px] text-white/20 uppercase tracking-[0.3em]">
        &copy; 2026 Sepang International Circuit AI Synthesis Lab
      </footer>
    </div>
  );
}
