
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BeadPixel, ProjectSettings, ProcessingStatus } from './types';
import { BRANDS } from './palettes';
import { processImageToBeads } from './utils';
import { GoogleGenAI } from "@google/genai";

const CANVAS_PADDING = 40;
const BEAD_SIZE_BASE = 20; // Default zoom level

export default function App() {
  // State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [gridData, setGridData] = useState<BeadPixel[][]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  
  // Initialize with the first brand
  const defaultBrand = BRANDS[0];
  const [settings, setSettings] = useState<ProjectSettings>({
    width: 50,
    height: 50,
    brandId: defaultBrand.id,
    // Default to the last preset (usually the largest set) for better initial results
    paletteId: defaultBrand.presets[defaultBrand.presets.length - 1].id,
    dither: false,
    showGrid: true,
    showNumbers: true,
    pixelShape: 'square',
  });
  
  // For aspect ratio maintenance
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);

  // Stats
  const [colorCounts, setColorCounts] = useState<Map<string, number>>(new Map());

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize GenAI
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // Helpers to get current config objects
  const currentBrand = BRANDS.find(b => b.id === settings.brandId) || BRANDS[0];
  const currentPreset = currentBrand.presets.find(p => p.id === settings.paletteId) || currentBrand.presets[0];

  // Effects
  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
  }, [imageSrc, settings.width, settings.height, settings.brandId, settings.paletteId, settings.dither]);

  useEffect(() => {
    drawCanvas();
    countColors();
  }, [gridData, settings, zoom]);

  // Logic
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target?.result as string;
        
        // Load image to get dimensions
        const img = new Image();
        img.onload = () => {
          setOriginalAspectRatio(img.width / img.height);
          // Auto-adjust height based on width 50 default
          const newHeight = Math.round(50 / (img.width / img.height));
          setSettings(prev => ({ ...prev, height: newHeight }));
          setImageSrc(src);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandChange = (newBrandId: string) => {
    const brand = BRANDS.find(b => b.id === newBrandId);
    if (brand) {
      // When switching brand, try to pick the largest preset by default to show full potential
      const largestPreset = brand.presets[brand.presets.length - 1];
      setSettings(prev => ({
        ...prev,
        brandId: newBrandId,
        paletteId: largestPreset.id
      }));
    }
  };

  const processImage = async () => {
    if (!imageSrc) return;
    setStatus('PROCESSING');
    try {
      // Use the helper variables derived from state
      const selectedPalette = currentPreset.colors;
      
      const data = await processImageToBeads(
        imageSrc, 
        settings.width, 
        settings.height, 
        selectedPalette, 
        settings.dither
      );
      setGridData(data);
      setStatus('DONE');
    } catch (err) {
      console.error(err);
      setStatus('IDLE');
    }
  };

  const countColors = useCallback(() => {
    const counts = new Map<string, number>();
    gridData.flat().forEach(bead => {
      counts.set(bead.color.id, (counts.get(bead.color.id) || 0) + 1);
    });
    setColorCounts(counts);
  }, [gridData]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gridData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const beadSize = BEAD_SIZE_BASE * zoom;
    const totalWidth = settings.width * beadSize + CANVAS_PADDING * 2;
    const totalHeight = settings.height * beadSize + CANVAS_PADDING * 2;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#1e293b'; // Slate 800
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw board
    ctx.translate(CANVAS_PADDING, CANVAS_PADDING);

    // Draw grid lines
    if (settings.showGrid) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      
      // Vertical
      for (let i = 0; i <= settings.width; i++) {
        ctx.beginPath();
        ctx.moveTo(i * beadSize, 0);
        ctx.lineTo(i * beadSize, settings.height * beadSize);
        ctx.stroke();
      }
      // Horizontal
      for (let i = 0; i <= settings.height; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * beadSize);
        ctx.lineTo(settings.width * beadSize, i * beadSize);
        ctx.stroke();
      }
    }

    // Draw beads
    gridData.forEach((row, y) => {
      row.forEach((bead, x) => {
        const cx = x * beadSize + beadSize / 2;
        const cy = y * beadSize + beadSize / 2;
        const radius = (beadSize / 2) * 0.85; // slightly smaller than cell

        ctx.fillStyle = bead.color.hex;
        
        ctx.beginPath();
        if (settings.pixelShape === 'circle') {
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Square with slight padding for definition
          const pad = beadSize * 0.05;
          ctx.rect(x * beadSize + pad, y * beadSize + pad, beadSize - pad*2, beadSize - pad*2);
          ctx.fill();
        }

        // Draw numbers if enabled
        if (settings.showNumbers && zoom > 0.6) {
           // Decide text color based on bead brightness
           const rgb = bead.color.rgb;
           // Perceived brightness formula
           const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
           ctx.fillStyle = brightness > 125 ? '#000000' : '#FFFFFF';
           
           ctx.font = `bold ${Math.max(8, beadSize * 0.35)}px sans-serif`;
           ctx.textAlign = 'center';
           ctx.textBaseline = 'middle';
           ctx.fillText(bead.color.id, cx, cy);
        }
      });
    });

  }, [gridData, settings, zoom]);

  // 高清导出逻辑
  const handleDownload = () => {
    if (gridData.length === 0) return;

    // 1. 创建高分辨率 Canvas 用于导出
    const EXPORT_CELL_SIZE = 40; // 每个珠子 40px，确保文字清晰
    const PADDING = 40; // 边距
    
    const width = settings.width * EXPORT_CELL_SIZE + PADDING * 2;
    const height = settings.height * EXPORT_CELL_SIZE + PADDING * 2;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 2. 绘制背景 (白色，适合打印)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 3. 绘制标题信息
    ctx.fillStyle = '#64748b'; // Slate 500
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`拼豆图纸 - ${currentBrand.name} - ${settings.width}x${settings.height}`, PADDING, PADDING - 10);
    
    ctx.textAlign = 'right';
    ctx.fillText('PixelBead Master', width - PADDING, PADDING - 10);

    ctx.translate(PADDING, PADDING);

    // 4. 绘制网格
    if (settings.showGrid) {
        ctx.strokeStyle = '#e2e8f0'; // 浅灰色网格 Slate 200
        ctx.lineWidth = 2; // 导出时网格线稍粗
        
        // 竖线
        for (let i = 0; i <= settings.width; i++) {
            ctx.beginPath();
            ctx.moveTo(i * EXPORT_CELL_SIZE, 0);
            ctx.lineTo(i * EXPORT_CELL_SIZE, settings.height * EXPORT_CELL_SIZE);
            ctx.stroke();
        }
        
        // 横线
        for (let i = 0; i <= settings.height; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * EXPORT_CELL_SIZE);
            ctx.lineTo(settings.width * EXPORT_CELL_SIZE, i * EXPORT_CELL_SIZE);
            ctx.stroke();
        }
    }

    // 5. 绘制珠子
    gridData.forEach((row, y) => {
        row.forEach((bead, x) => {
            const cx = x * EXPORT_CELL_SIZE + EXPORT_CELL_SIZE / 2;
            const cy = y * EXPORT_CELL_SIZE + EXPORT_CELL_SIZE / 2;
            const radius = (EXPORT_CELL_SIZE / 2) * 0.9; // 留出一点缝隙显示网格

            ctx.fillStyle = bead.color.hex;
            ctx.beginPath();
            if (settings.pixelShape === 'circle') {
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            } else {
                const pad = EXPORT_CELL_SIZE * 0.05;
                ctx.rect(
                    x * EXPORT_CELL_SIZE + pad, 
                    y * EXPORT_CELL_SIZE + pad, 
                    EXPORT_CELL_SIZE - pad * 2, 
                    EXPORT_CELL_SIZE - pad * 2
                );
            }
            ctx.fill();

            // 6. 绘制编号 (导出时总是绘制编号，除非用户特意关闭，但通常图纸都需要编号)
            // 只要 showNumbers 为 true，就用大字体清晰绘制
            if (settings.showNumbers) {
                const rgb = bead.color.rgb;
                // 计算亮度以决定文字颜色 (黑/白)
                const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                const textColor = brightness > 128 ? '#000000' : '#FFFFFF';
                
                ctx.fillStyle = textColor;
                // 使用粗体大字号
                ctx.font = `bold ${Math.floor(EXPORT_CELL_SIZE * 0.4)}px Arial, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.fillText(bead.color.id, cx, cy);
            }
        });
    });

    // 7. 触发下载
    const link = document.createElement('a');
    link.download = `拼豆图纸-${settings.width}x${settings.height}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // UI Components
  return (
    <div className="flex h-screen w-full bg-dark text-slate-200 font-sans">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-surface border-r border-slate-700 flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-primary mb-1">拼豆大师</h1>
          <p className="text-xs text-slate-400">专业图纸设计工具</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Upload Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">图像来源</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-primary hover:bg-slate-800 transition cursor-pointer"
            >
              <span className="text-3xl mb-2 block">🖼️</span>
              <span className="text-sm text-slate-300">上传图片</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">参数设置</h3>
            
            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">宽度 (豆)</label>
                <input 
                  type="number" 
                  value={settings.width}
                  onChange={(e) => {
                    const w = parseInt(e.target.value) || 1;
                    const h = Math.round(w / originalAspectRatio);
                    setSettings(s => ({ ...s, width: w, height: h }));
                  }}
                  className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">高度 (豆)</label>
                <input 
                  type="number" 
                  value={settings.height}
                  onChange={(e) => setSettings(s => ({ ...s, height: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Brand Selection (NEW) */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">拼豆品牌</label>
              <select 
                value={settings.brandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-sm focus:border-primary outline-none mb-1"
              >
                {BRANDS.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
               <p className="text-xs text-slate-500 italic">{currentBrand.description}</p>
            </div>

            {/* Palette Selection (Filtered by Brand) */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">色彩套装</label>
              <select 
                value={settings.paletteId}
                onChange={(e) => setSettings(s => ({ ...s, paletteId: e.target.value }))}
                className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-sm focus:border-primary outline-none"
              >
                {currentBrand.presets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.colors.length}色)</option>
                ))}
              </select>
              {currentPreset && (
                 <p className="text-xs text-slate-500 mt-1 italic">{currentPreset.description}</p>
              )}
            </div>

            {/* Shape Selection */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">珠子形状</label>
              <div className="flex space-x-2 bg-dark border border-slate-600 rounded p-1">
                <button
                  className={`flex-1 py-1 text-xs rounded transition ${settings.pixelShape === 'circle' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  onClick={() => setSettings(s => ({ ...s, pixelShape: 'circle' }))}
                >
                  圆形
                </button>
                <button
                  className={`flex-1 py-1 text-xs rounded transition ${settings.pixelShape === 'square' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  onClick={() => setSettings(s => ({ ...s, pixelShape: 'square' }))}
                >
                  方形
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.dither}
                  onChange={(e) => setSettings(s => ({ ...s, dither: e.target.checked }))}
                  className="form-checkbox text-primary rounded bg-dark border-slate-600"
                />
                <span className="text-sm">抖动处理 (更逼真)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showNumbers}
                  onChange={(e) => setSettings(s => ({ ...s, showNumbers: e.target.checked }))}
                  className="form-checkbox text-primary rounded bg-dark border-slate-600"
                />
                <span className="text-sm">显示色号编号</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showGrid}
                  onChange={(e) => setSettings(s => ({ ...s, showGrid: e.target.checked }))}
                  className="form-checkbox text-primary rounded bg-dark border-slate-600"
                />
                <span className="text-sm">显示网格</span>
              </label>
            </div>
          </div>

          {/* Stats Section */}
          {gridData.length > 0 && currentPreset && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                材料清单 ({colorCounts.size} 种颜色)
              </h3>
              <div className="bg-dark rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 text-xs">
                {Array.from(colorCounts.entries())
                  .sort((a, b) => b[1] - a[1]) // Sort by count desc
                  .map(([id, count]) => {
                    // Find color in current preset first
                    const color = currentPreset.colors.find(c => c.id === id);
                    if (!color) return null;
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: color.hex }}></div>
                          <span className="font-mono text-slate-300 w-8">{id}</span>
                          <span className="text-slate-400 truncate w-20" title={color.name}>{color.name}</span>
                        </div>
                        <span className="font-bold text-slate-200">{count} 颗</span>
                      </div>
                    );
                  })}
                <div className="pt-2 border-t border-slate-700 flex justify-between font-bold">
                  <span>总计珠子数</span>
                  <span>{gridData.length * gridData[0].length}</span>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={handleDownload}
            disabled={!imageSrc}
            className="w-full bg-primary hover:bg-secondary text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            导出高清图纸 (PNG)
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-[#0f172a] overflow-hidden relative">
        {/* Toolbar */}
        <div className="h-14 border-b border-slate-700 flex items-center justify-between px-6 bg-surface z-10">
          <div className="flex items-center space-x-4">
             <span className="text-sm text-slate-400">缩放: {Math.round(zoom * 100)}%</span>
             <input 
               type="range" 
               min="0.2" 
               max="3" 
               step="0.1" 
               value={zoom}
               onChange={(e) => setZoom(parseFloat(e.target.value))}
               className="w-32 accent-primary"
             />
          </div>
          <div className="text-xs text-slate-500">
            尺寸: {settings.width}x{settings.height} 颗 • {settings.width * 0.5} 厘米宽 (预估)
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-dots">
          {!imageSrc ? (
            <div className="text-center text-slate-500">
              <p className="text-xl mb-2">👋 欢迎使用拼豆大师</p>
              <p>请点击左侧“上传图片”开始制作图纸。</p>
            </div>
          ) : (
             <canvas ref={canvasRef} className="shadow-2xl rounded" />
          )}
        </div>
      </div>

      <style>{`
        .bg-dots {
          background-image: radial-gradient(#334155 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
