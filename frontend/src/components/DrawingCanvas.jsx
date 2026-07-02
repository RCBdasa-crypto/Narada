import { useRef, useEffect, useState } from 'react';
import './DrawingCanvas.css';

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#92400e', '#0d9488',
];

export default function DrawingCanvas({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, []);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineWidth = tool === 'erase' ? 16 : 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'erase' ? '#ffffff' : color;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endDraw() {
    drawingRef.current = false;
    onChange?.(canvasRef.current.toDataURL('image/png'));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange?.(null);
  }

  return (
    <div className="drawing-canvas-wrap">
      <span className="drawing-label">Рисунок в задаче</span>
      <div className="drawing-toolbar">
        <button type="button" className={tool === 'draw' ? 'active' : ''} onClick={() => setTool('draw')}>
          ✏️ Рисовать
        </button>
        <button type="button" className={tool === 'erase' ? 'active' : ''} onClick={() => setTool('erase')}>
          🧹 Стереть
        </button>
        <button type="button" onClick={clear}>Очистить</button>
      </div>
      <div className="color-palette">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`color-swatch ${color === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => { setColor(c); setTool('draw'); }}
            aria-label={`Цвет ${c}`}
          />
        ))}
      </div>
      <canvas
        ref={canvasRef}
        width={480}
        height={200}
        className="drawing-canvas"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
    </div>
  );
}
