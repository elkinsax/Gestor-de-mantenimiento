import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Trash2 } from 'lucide-react';

interface CarouselProps {
  images: string[];
  heightClass?: string;
  editable?: boolean;
  onUpload?: (file: File) => void;
  onDelete?: (index: number) => void;
}

const Carousel: React.FC<CarouselProps> = ({ images, heightClass = 'h-64', editable = false, onUpload, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Safety check: If an image is deleted and index is out of bounds, adjust it
  useEffect(() => {
    if (currentIndex >= images.length && images.length > 0) {
      setCurrentIndex(images.length - 1);
    }
  }, [images.length, currentIndex]);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((curr) => (curr === 0 ? images.length - 1 : curr - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((curr) => (curr === images.length - 1 ? 0 : curr + 1));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpload) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(currentIndex);
    }
  };

  if (images.length === 0) {
    return (
      <div className={`w-full ${heightClass} bg-gray-200 flex items-center justify-center text-gray-400`}>
        <div className="text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <span className="text-sm">Sin imágenes</span>
          {editable && (
             <label className="block mt-2 cursor-pointer text-blue-600 hover:text-blue-800 text-xs font-semibold">
             Subir Foto
             <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
           </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden bg-gray-100 group`}>
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex}`}
        className="w-full h-full object-cover transition-transform duration-500"
      />
      
      {/* Overlay Gradient for text readability at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {editable && (
        <div className="absolute top-2 right-2 flex gap-2">
           {/* Trash button for deleting images */}
           <button 
             onClick={handleDelete}
             className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors flex items-center justify-center shadow-sm"
             title="Eliminar esta foto"
           >
             <Trash2 size={14} />
           </button>
           
           <label className="cursor-pointer bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors flex items-center justify-center shadow-sm">
             <span className="text-[10px] font-bold">+</span>
             <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
           </label>
        </div>
      )}
    </div>
  );
};

export default Carousel;
