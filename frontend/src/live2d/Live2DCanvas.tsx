import { useEffect, useRef, useCallback } from "react";
import { createModel, startFramework } from "./Live2DModel";

interface Props {
  modelPath: string;
  className?: string;
}

export default function Live2DCanvas({ modelPath, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<ReturnType<typeof createModel> | null>(null);
  const animRef = useRef<number>(0);
  const mountIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startFramework();
    const mountId = ++mountIdRef.current;
    const model = createModel();
    modelRef.current = model;

    model.load(modelPath).then(async () => {
      if (mountId !== mountIdRef.current) return;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const mw = model.canvasWidth();
      const mh = model.canvasHeight();

      const resize = () => {
        const cw = container.clientWidth || 320;
        const ch = container.clientHeight || 600;
        const dpr = window.devicePixelRatio || 1;

        // 保持模型原始比例，放大 30%
        const scale = Math.min(cw / mw, ch / mh) * 1.2;
        const w = mw * scale;
        const h = mh * scale;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        model.setRenderTargetSize(canvas.width, canvas.height);
      };

      resize();
      await model.setupRenderer(canvas);

      if (mountId !== mountIdRef.current) return;

      const loop = () => {
        if (mountId !== mountIdRef.current) return;
        model.frame();
        animRef.current = requestAnimationFrame(loop);
      };
      loop();
    });

    return () => {
      mountIdRef.current++;
      cancelAnimationFrame(animRef.current);
      modelRef.current?.release();
    };
  }, [modelPath]);

  const handleClick = useCallback(() => {
    modelRef.current?.playTap();
  }, []);

  return (
    <div ref={containerRef} className={`flex items-center justify-center overflow-hidden ${className ?? ""}`} onClick={handleClick}>
      <canvas ref={canvasRef} className="block shrink-0 pointer-events-none" />
    </div>
  );
}
