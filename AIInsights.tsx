import React, { useState, useRef } from 'react';
import { 
  generatePerformanceReview, 
  analyzeDepartmentHealth,
  generateImage,
  editImage,
  analyzeImage,
  generateVideo
} from '../services/geminiService';
import { Employee, Department, ImageSize, AspectRatio, VideoAspectRatio } from '../types';
import { Button } from './Button';
import { 
  Sparkles, 
  BarChart, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Wand2, 
  ScanEye,
  Upload,
  Play
} from 'lucide-react';

interface AIInsightsProps {
  employees: Employee[];
  selectedEmployee?: Employee | null;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

export const AIInsights: React.FC<AIInsightsProps> = ({ employees, selectedEmployee }) => {
  const [activeTab, setActiveTab] = useState<'review' | 'dept' | 'media'>('review');
  const [mediaSubTab, setMediaSubTab] = useState<'create' | 'edit' | 'analyze' | 'video'>('create');
  
  // Shared state
  const [result, setResult] = useState<string>("");
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Specific inputs
  const [selectedDept, setSelectedDept] = useState<Department>(Department.Engineering);
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<ImageSize>('1K');
  const [imgRatio, setImgRatio] = useState<AspectRatio>('1:1');
  const [videoRatio, setVideoRatio] = useState<VideoAspectRatio>('16:9');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setResult("");
    setGeneratedMediaUrl(null);
    setPrompt("");
    setLoading(false);
    // Don't clear uploaded image immediately as user might switch tabs
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Handlers ---

  const handleGenerateReview = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    setResult("");
    const text = await generatePerformanceReview(selectedEmployee);
    setResult(text);
    setLoading(false);
  };

  const handleAnalyzeDept = async () => {
    setLoading(true);
    setResult("");
    const text = await analyzeDepartmentHealth(employees, selectedDept);
    setResult(text);
    setLoading(false);
  };

  const handleGenerateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setGeneratedMediaUrl(null);
    try {
      const url = await generateImage(prompt, imgSize, imgRatio);
      setGeneratedMediaUrl(url);
    } catch (e) {
      setResult("Failed to generate image.");
    }
    setLoading(false);
  };

  const handleEditImage = async () => {
    if (!prompt || !uploadedImage) return;
    setLoading(true);
    setGeneratedMediaUrl(null);
    try {
      const url = await editImage(uploadedImage, prompt);
      setGeneratedMediaUrl(url);
    } catch (e) {
      setResult("Failed to edit image.");
    }
    setLoading(false);
  };

  const handleAnalyzeImage = async () => {
    if (!uploadedImage) return;
    setLoading(true);
    setResult("");
    try {
      const text = await analyzeImage(uploadedImage, prompt);
      setResult(text);
    } catch (e) {
      setResult("Failed to analyze image.");
    }
    setLoading(false);
  };

  const handleGenerateVideo = async () => {
    setLoading(true);
    setGeneratedMediaUrl(null);
    setResult("");

    try {
      // Check for paid key first
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
         await window.aistudio.openSelectKey();
         // Assume success and proceed, re-check logic would happen in service basically
      }

      const url = await generateVideo(prompt || "A corporate office timelapse", videoRatio, uploadedImage || undefined);
      setGeneratedMediaUrl(url);
    } catch (e) {
      setResult("Video generation failed or was cancelled.");
    }
    setLoading(false);
  };

  // --- Render Helpers ---
  
  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => { setActiveTab(id); resetState(); }}
      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
        activeTab === id 
          ? 'border-blue-600 text-blue-700 bg-blue-50/50' 
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </div>
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden h-full flex flex-col">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
             <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Assistant</h2>
        </div>
      </div>

      <div className="flex border-b border-slate-100">
        <TabButton id="review" icon={FileText} label="Review" />
        <TabButton id="dept" icon={BarChart} label="Analysis" />
        <TabButton id="media" icon={Wand2} label="Studio" />
      </div>

      <div className="p-5 flex-1 overflow-y-auto bg-slate-50/50">
        {/* REVIEW TAB */}
        {activeTab === 'review' && (
          <div className="space-y-4">
            {!selectedEmployee ? (
              <div className="text-center p-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Select an employee to draft a review.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                 <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Employee</p>
                    <p className="font-semibold text-slate-800">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                    <p className="text-xs text-slate-400 mt-1">{selectedEmployee.position}</p>
                 </div>
                 <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={handleGenerateReview} 
                    isLoading={loading}
                    icon={<Sparkles className="w-4 h-4"/>}
                  >
                    Draft Performance Review
                  </Button>
              </div>
            )}
          </div>
        )}

        {/* DEPT TAB */}
        {activeTab === 'dept' && (
          <div className="space-y-4 animate-in fade-in">
             <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Target Department</label>
                <select 
                  className="block w-full rounded-lg border-slate-200 py-2.5 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as Department)}
                >
                  {Object.values(Department).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
             </div>
             <Button 
               className="w-full" 
               onClick={handleAnalyzeDept} 
               isLoading={loading}
               icon={<BarChart className="w-4 h-4"/>}
             >
               Analyze Department
             </Button>
          </div>
        )}

        {/* MEDIA STUDIO TAB */}
        {activeTab === 'media' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Sub-tabs */}
            <div className="flex p-1 bg-slate-200/60 rounded-lg">
              {[
                { id: 'create', icon: ImageIcon },
                { id: 'edit', icon: Wand2 },
                { id: 'analyze', icon: ScanEye },
                { id: 'video', icon: Video }
              ].map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => { setMediaSubTab(tab.id); resetState(); }}
                  className={`flex-1 p-2 rounded-md flex justify-center items-center transition-all ${
                    mediaSubTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="space-y-4">
               {/* Prompt Input (Used for Create, Edit, Video, Analyze optional) */}
               <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    {mediaSubTab === 'analyze' ? 'Question (Optional)' : 'Prompt'}
                  </label>
                  <textarea 
                    className="w-full rounded-lg border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm resize-none"
                    rows={3}
                    placeholder={
                      mediaSubTab === 'create' ? "A futuristic office workspace..." :
                      mediaSubTab === 'edit' ? "Make it look like a sketch..." :
                      mediaSubTab === 'analyze' ? "What is in this image?" :
                      "A cinematic drone shot of a city..."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
               </div>

               {/* Image Upload (Edit, Analyze, Video) */}
               {mediaSubTab !== 'create' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Reference Image</label>
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        icon={<Upload className="w-3 h-3"/>}
                      >
                        {uploadedImage ? "Change Image" : "Upload Image"}
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                      />
                    </div>
                    {uploadedImage && (
                      <div className="relative mt-2 rounded-lg overflow-hidden h-32 w-full bg-slate-100 border border-slate-200">
                        <img src={uploadedImage} alt="Preview" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
               )}

               {/* Configs for Create */}
               {mediaSubTab === 'create' && (
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Aspect Ratio</label>
                       <select 
                          className="w-full rounded-lg border-slate-200 text-sm py-2"
                          value={imgRatio}
                          onChange={(e) => setImgRatio(e.target.value as AspectRatio)}
                        >
                          {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => <option key={r} value={r}>{r}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Size</label>
                       <select 
                          className="w-full rounded-lg border-slate-200 text-sm py-2"
                          value={imgSize}
                          onChange={(e) => setImgSize(e.target.value as ImageSize)}
                        >
                          {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                 </div>
               )}

               {/* Configs for Video */}
               {mediaSubTab === 'video' && (
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Video Ratio</label>
                    <select 
                      className="w-full rounded-lg border-slate-200 text-sm py-2"
                      value={videoRatio}
                      onChange={(e) => setVideoRatio(e.target.value as VideoAspectRatio)}
                    >
                      <option value="16:9">Landscape (16:9)</option>
                      <option value="9:16">Portrait (9:16)</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Requires paid API key.</p>
                 </div>
               )}

               {/* Action Button */}
               <Button 
                 className="w-full bg-blue-600 hover:bg-blue-700" 
                 isLoading={loading}
                 onClick={() => {
                   if (mediaSubTab === 'create') handleGenerateImage();
                   if (mediaSubTab === 'edit') handleEditImage();
                   if (mediaSubTab === 'analyze') handleAnalyzeImage();
                   if (mediaSubTab === 'video') handleGenerateVideo();
                 }}
               >
                 {mediaSubTab === 'create' ? "Generate Image" : 
                  mediaSubTab === 'edit' ? "Edit Image" : 
                  mediaSubTab === 'analyze' ? "Analyze" : "Generate Video"}
               </Button>
            </div>
          </div>
        )}

        {/* OUTPUT AREA */}
        {(result || generatedMediaUrl) && (
          <div className="mt-6 border-t border-slate-100 pt-6 animate-in slide-in-from-bottom-2 fade-in">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Result</h3>
            
            {result && (
              <div className="prose prose-sm prose-slate max-w-none bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-slate-600">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {result}
                </div>
              </div>
            )}

            {generatedMediaUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 flex justify-center items-center">
                 {mediaSubTab === 'video' ? (
                   <video controls className="max-w-full max-h-[400px]" src={generatedMediaUrl} />
                 ) : (
                   <img src={generatedMediaUrl} alt="Generated result" className="max-w-full max-h-[400px] object-contain" />
                 )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};