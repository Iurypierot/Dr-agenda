"use client";

import { Check, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageCropperDialogProps {
  imageSrc: string;
  onSave: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ImageCropperDialog = ({
  imageSrc,
  onSave,
  onCancel,
  isOpen,
}: ImageCropperDialogProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - position.x - rect.left,
      y: e.clientY - position.y - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - dragStart.x - rect.left,
      y: e.clientY - dragStart.y - rect.top,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const cropSize = 300;
      const containerSize = 400;
      const cropRadius = cropSize / 2;
      const containerCenter = containerSize / 2;

      canvas.width = cropSize;
      canvas.height = cropSize;

      if (!ctx) return;

      // Calcular dimensões da imagem no container
      const imgAspect = img.width / img.height;
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > containerSize || displayHeight > containerSize) {
        if (imgAspect > 1) {
          displayWidth = containerSize;
          displayHeight = containerSize / imgAspect;
        } else {
          displayHeight = containerSize;
          displayWidth = containerSize * imgAspect;
        }
      }

      // Aplicar escala
      displayWidth *= scale;
      displayHeight *= scale;

      // Calcular posição da imagem no container (centralizada + offset)
      const imgX = containerCenter - displayWidth / 2 + position.x;
      const imgY = containerCenter - displayHeight / 2 + position.y;

      // Criar canvas temporário para rotação
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      const rad = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      const rotatedWidth = displayWidth * cos + displayHeight * sin;
      const rotatedHeight = displayWidth * sin + displayHeight * cos;

      tempCanvas.width = Math.ceil(rotatedWidth);
      tempCanvas.height = Math.ceil(rotatedHeight);

      tempCtx.save();
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
      tempCtx.rotate(rad);
      tempCtx.drawImage(
        img,
        -displayWidth / 2,
        -displayHeight / 2,
        displayWidth,
        displayHeight,
      );
      tempCtx.restore();

      // Calcular posição do crop no canvas temporário
      const cropCenterX = tempCanvas.width / 2;
      const cropCenterY = tempCanvas.height / 2;
      const offsetX = (imgX - containerCenter + cropRadius) * (tempCanvas.width / containerSize);
      const offsetY = (imgY - containerCenter + cropRadius) * (tempCanvas.height / containerSize);

      const cropX = cropCenterX - cropRadius + offsetX;
      const cropY = cropCenterY - cropRadius + offsetY;

      // Garantir que o crop não saia dos limites
      const maxX = Math.max(0, tempCanvas.width - cropSize);
      const maxY = Math.max(0, tempCanvas.height - cropSize);
      const finalX = Math.max(0, Math.min(cropX, maxX));
      const finalY = Math.max(0, Math.min(cropY, maxY));

      ctx.drawImage(
        tempCanvas,
        finalX,
        finalY,
        cropSize,
        cropSize,
        0,
        0,
        cropSize,
        cropSize,
      );

      // Aplicar máscara circular
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
      ctx.fill();

      canvas.toBlob((blob) => {
        if (blob) {
          onSave(blob);
        }
      }, "image/png", 1);
    };

    img.crossOrigin = "anonymous";
    img.src = imageSrc;
  }, [imageSrc, scale, rotation, position, onSave]);

  if (!isOpen) return null;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Ajustar Foto</DialogTitle>
        <DialogDescription>
          Ajuste a posição, zoom e rotação da foto antes de salvar
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Controles */}
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRotate}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Área de crop */}
        <div
          ref={containerRef}
          className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden border-2 border-border"
        >
          <div
            className="absolute inset-0 flex items-center justify-center cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.1s",
            }}
          >
            <img
              src={imageSrc}
              alt="Preview"
              className="max-w-full max-h-full object-contain select-none pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Overlay de crop (quadrado centralizado) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[300px] border-2 border-white shadow-lg rounded-full overflow-hidden">
              <div className="absolute inset-0 border-2 border-dashed border-primary/50" />
            </div>
          </div>

          {/* Máscara escura ao redor do crop */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="black" />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="150"
                    fill="white"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.5)"
                mask="url(#crop-mask)"
              />
            </svg>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="button" onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />
          Salvar Foto
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ImageCropperDialog;

