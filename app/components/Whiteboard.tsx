'use client';

import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Eraser, Pen, Download, Trash2, Palette } from 'lucide-react';

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const { currentNote, updateNote } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Load saved drawing if exists
    if (currentNote?.content) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = currentNote.content;
    } else {
      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentNote]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);

    // Save canvas as image data
    const canvas = canvasRef.current;
    if (!canvas || !currentNote) return;

    const dataURL = canvas.toDataURL();
    updateNote(currentNote.id, { content: dataURL });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentNote) {
      updateNote(currentNote.id, { content: '' });
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${currentNote?.title || 'whiteboard'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!currentNote) {
    return null;
  }

  const colors = [
    '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE',
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                tool === 'pen'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Pen className="h-4 w-4" />
              <span>Pen</span>
            </button>

            <button
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                tool === 'eraser'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eraser className="h-4 w-4" />
              <span>Eraser</span>
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300" />

          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-gray-600" />
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    brushColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-8 bg-gray-300" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-8">{brushSize}px</span>
          </div>

          <div className="flex-1" />

          <button
            onClick={downloadCanvas}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>

          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-8 overflow-hidden">
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />
        </div>
      </div>
    </div>
  );
}
