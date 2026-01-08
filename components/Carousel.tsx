import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface CarouselProps {
  images: string[];
  heightClass?: string;
}

const Carousel: React.FC<CarouselProps> = ({ images, heightClass = 'h-64' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={`w-full ${heightClass} bg-gray-100 flex items-center justify-center text-gray-300`}>
        <ImageIcon size={40} />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden group`}>
      <img src={images[currentIndex]} className="w-full h-full object-cover" alt="Unit" />
      {images.length > 1 && (
        <>
          <button onClick={() => setCurrentIndex(c => (c === 0 ? images.length - 1 : c - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentIndex(c => (c === images.length - 1 ? 0 : c + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
};

export default Carousel;