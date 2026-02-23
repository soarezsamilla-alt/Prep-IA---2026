import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, X, Check, RefreshCw, Loader2, Image as ImageIcon, Upload, AlertCircle, ChevronLeft } from "lucide-react";
import { analyzeImageQuestion } from "@/services/ai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useActivity } from "@/context/ActivityContext";

export default function Scan() {
  const webcamRef = useRef<Webcam>(null);
  const { t, language } = useLanguage();
  const { addActivity } = useActivity();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);

  const capture = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      setImageSrc(image);
    }
  }, [webcamRef]);

  const handleRetake = () => {
    setImageSrc(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!imageSrc) return;
    setAnalyzing(true);
    const analysis = await analyzeImageQuestion(imageSrc, language);
    setResult(analysis);
    setAnalyzing(false);

    // Add activity
    addActivity({
      id: Date.now().toString(),
      type: 'scan',
      timestamp: Date.now(),
      status: 'completed',
      score: 0,
      total: 1
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Result View ---
  if (result) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
        <header className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <button onClick={handleRetake} className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white ml-2">{t.scan.resultTitle}</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 max-w-5xl mx-auto w-full">
          <div className="md:grid md:grid-cols-2 md:gap-12 h-full">
            <div className="mb-6 md:mb-0">
              <div className="sticky top-6">
                <img 
                  src={imageSrc!} 
                  alt="Questão capturada" 
                  className="w-full h-auto max-h-[60vh] object-contain bg-black/5 rounded-xl border border-gray-200 dark:border-gray-700 mb-4"
                />
                
                {/* Desktop Actions */}
                <div className="hidden md:flex gap-3 mt-4">
                  <button
                    onClick={handleRetake}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Camera size={20} />
                    {t.scan.newPhoto}
                  </button>
                </div>
              </div>
            </div>

            <div className="md:h-full md:overflow-y-auto md:pr-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6 flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
                  <Check size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">{t.scan.analysisComplete}</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">{t.scan.analysisDesc}</p>
                </div>
              </div>

              <div className="prose prose-blue prose-sm md:prose-base max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Actions */}
        <div className="md:hidden fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 max-w-md mx-auto flex gap-3 transition-colors z-20">
          <button
            onClick={handleRetake}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Camera size={20} />
            {t.scan.newPhoto}
          </button>
        </div>
      </div>
    );
  }

  // --- Camera / Preview View ---
  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden md:rounded-3xl">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <h1 className="text-white font-bold text-lg drop-shadow-md">{t.scan.title}</h1>
        <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
          <span className="text-xs font-medium text-white flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {t.scan.ready}
          </span>
        </div>
      </div>

      {!imageSrc ? (
        <>
          {/* Camera Viewport */}
          <div className="flex-1 relative flex items-center justify-center bg-gray-900">
            {!cameraError ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="absolute inset-0 w-full h-full object-cover"
                onUserMediaError={() => setCameraError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Camera size={40} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t.scan.cameraError}</h3>
                <p className="text-gray-400 mb-8 text-sm">
                  {t.scan.cameraErrorDesc}
                </p>
                <label className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Upload size={20} />
                  {t.scan.upload}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            )}
            
            {/* Guides (Only if camera is working) */}
            {!cameraError && (
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                <div className="flex-1 bg-black/40"></div>
                <div className="flex w-full h-[60%] md:h-[70%] md:max-w-lg md:mx-auto">
                  <div className="flex-1 bg-black/40"></div>
                  <div className="flex-[3] md:flex-[4] relative border-2 border-white/30 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 -mt-[2px] -ml-[2px] rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 -mt-[2px] -mr-[2px] rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 -mb-[2px] -ml-[2px] rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 -mb-[2px] -mr-[2px] rounded-br-lg"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white/70 text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                        {t.scan.guide}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 bg-black/40"></div>
                </div>
                <div className="flex-1 bg-black/40"></div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pb-24 md:pb-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-between items-center z-20">
            <label className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all cursor-pointer border border-white/10">
              <ImageIcon size={24} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            
            <button
              onClick={capture}
              disabled={cameraError}
              className="w-20 h-20 bg-white rounded-full border-4 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-transform active:scale-90 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200"></div>
            </button>
            
            <div className="w-12 h-12"></div> {/* Spacer for balance */}
          </div>
        </>
      ) : (
        /* Preview Screen */
        <div className="flex-1 flex flex-col bg-gray-900 relative">
          <div className="flex-1 relative flex items-center justify-center p-4">
            <img 
              src={imageSrc} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            
            {analyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                  <Loader2 size={64} className="animate-spin text-blue-400 relative z-10" />
                </div>
                <p className="font-bold text-lg mt-6 animate-pulse">{t.scan.analyzing}</p>
                <p className="text-sm text-gray-400 mt-2">{t.scan.analyzingDesc}</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-t-3xl relative z-20 flex gap-4 pb-24 md:pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <button
              onClick={handleRetake}
              disabled={analyzing}
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              {t.scan.retake}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {analyzing ? t.scan.processing : t.scan.solve}
              {!analyzing && <Check size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
