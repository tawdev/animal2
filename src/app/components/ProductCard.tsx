'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, RefreshCw } from 'lucide-react';
import ProductRating from './ProductRating';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';
import { useCompare } from '@/app/context/CompareContext';
import { motion } from 'framer-motion';
import { type Product } from '@/app/lib/api';

interface ProductCardProps {
  product: Product;
  className?: string;
  imageClassName?: string;
  viewMode?: 'grid' | 'list';
  
}

export default function ProductCard({ product, className = '', imageClassName = '', viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const productNumId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
  const isWishlisted = isInWishlist(productNumId);
  const isCompared = isInCompare(productNumId);

  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : (product.onSale ? price * 1.2 : null);
  const isOnSale = product.onSale || (oldPrice && oldPrice > price);

  // Combine main image and gallery images, ensuring uniqueness and non-null values
  const allImages = useMemo(() => {
    const images = [];
    if (product.imageUrl) images.push(product.imageUrl);
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      product.imageUrls.forEach(url => {
        if (url && url !== product.imageUrl) images.push(url);
      });
    }
    // Limit to 5 images for performance and UX
    return images.slice(0, 5);
  }, [product.imageUrl, product.imageUrls]);

  // Handle auto-sliding on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && allImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 1500); // 1.5 seconds per slide
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, allImages.length]);

  const fallbackImage = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80';

  const isList = viewMode === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.4 }
      }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`h-full ${className}`}
    >
      <Link
        href={`/products/${product.id}`}
        onMouseEnter={() => {
          setIsHovered(true);
          
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          
        }}
        className={`group/card flex transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative h-full bg-white border border-slate-100 rounded-[24px] overflow-hidden ${isList
          ? 'flex-row w-full gap-4 sm:gap-6 items-start p-3 sm:p-4'
          : 'flex-col w-full sm:max-w-[280px]'
          }`}
      >
      {/* Media Wrapper */}
      <div className={`relative flex flex-col ${isList ? 'shrink-0 pr-8' : 'w-full mb-3'}`}>

        {/* Image Container */}
        <div 
          className={`relative transition-all duration-500 overflow-hidden bg-white shrink-0 grid ${isList
            ? 'w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] rounded-[16px]'
            : 'aspect-square w-full rounded-t-[24px]'
            } ${imageClassName}`}
          style={{ position: 'relative', transform: 'translateZ(0)' }}
        >
          
          {/* Sale Badge */}
          {isOnSale && (
            <div className="absolute top-2 left-2 z-40 bg-[#0bc241] text-white px-2 py-1.5 rounded-[6px] text-[10px] font-black shadow-lg leading-none tracking-wider uppercase pointer-events-none">
              -{oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 17}%
            </div>
          )}

          <div
            className="col-start-1 row-start-1 flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {allImages.length > 0 ? (
              allImages.map((url, idx) => (
                <div key={idx} className="flex-shrink-0 w-full h-full relative bg-white transition-all duration-300">
                  <Image
                    src={url || fallbackImage}
                    alt={`${product.name} - image ${idx + 1}`}
                    fill
                    sizes={isList ? "(max-width: 640px) 100px, 140px" : "280px"}
                    className="object-cover transition-transform duration-500 lg:group-hover/card:scale-[1.05]"
                  />
                </div>
              ))
            ) : (
              <div className="flex-shrink-0 w-full h-full relative bg-white">
                <Image
                  src={fallbackImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

          {/* Quick View Overlay */}
          <div className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl transform transition-transform duration-500 translate-y-4 group-hover/card:translate-y-0">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A5319]">Vue Rapide</span>
            </div>
          </div>


        {/* Action Buttons (Heart & Compare) */}
        <div className={`absolute right-2 top-2 z-30 flex gap-1.5 flex-col transition-all duration-500 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
            <button 
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] transition-all duration-300 shadow-sm ${isWishlisted ? 'bg-[#1A5319] border border-[#1A5319] text-white' : 'bg-white/80 backdrop-blur-md border border-white/60 text-slate-600 hover:bg-[#1A5319] hover:border-[#1A5319] hover:text-white'}`}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                toggleWishlist(productNumId);
              }}
              title={isWishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
            >
              {isWishlisted ? (
                <Heart size={14} strokeWidth={0} className="fill-white sm:w-4 sm:h-4 w-[14px] h-[14px]" />
              ) : (
                <Heart size={14} strokeWidth={1.5} className="sm:w-4 sm:h-4 w-[14px] h-[14px]" />
              )}
            </button>
            <button 
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] transition-all duration-300 shadow-sm ${isCompared ? 'bg-[#1A5319] border border-[#1A5319] text-white' : 'bg-white/80 backdrop-blur-md border border-white/60 text-slate-600 hover:bg-[#1A5319] hover:border-[#1A5319] hover:text-white'}`}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                toggleCompare(productNumId);
              }}
              title={isCompared ? "Retirer du comparateur" : "Ajouter au comparateur"}
            >
              <RefreshCw size={14} strokeWidth={isCompared ? 2.5 : 1.5} className="sm:w-4 sm:h-4 w-[14px] h-[14px]" />
            </button>
        </div>
      </div>

      {/* Info Container */}
      <div className={`flex flex-col flex-1 min-w-0 ${isList ? 'h-full pt-0.5 sm:pt-1' : 'h-full px-4 pt-4 pb-5'}`}>
        <h3 className={`font-black text-slate-900 line-clamp-2 sm:line-clamp-2 leading-[1.3] transition-colors group-hover/card:text-[#1A5319] mb-1 sm:mb-2 uppercase tracking-tight italic ${isList ? 'text-[14px] sm:text-[17px]' : 'text-[13px] sm:text-[15px] min-h-[40px] sm:min-h-[46px]'}`}>
          {product.name}
        </h3>

        {/* Size Badge Extraction */}
        {(() => {
          const weightMatch = product.name.match(/(\d+(?:\.\d+)?\s*(?:kg|g|ml|l|L))/i);
          if (weightMatch) {
            return (
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-500 uppercase tracking-tighter">
                  {weightMatch[1].toUpperCase()}
                </span>
              </div>
            );
          }
          return null;
        })()}

        {/* Rating Area */}
        <div className="mb-2 sm:mb-4 opacity-70">
          <ProductRating productId={product.id} starSize={isList ? 12 : 10} textSize={isList ? "text-[11px] sm:text-[13px] ml-1.5" : "text-[10px] sm:text-[12px] ml-1.5 text-slate-500"} />
        </div>

        {/* Price & Cart Area */}
        {isList ? (
          <>
            {/* Price Area List */}
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2.5 mb-2 sm:mb-4">
              <span className="font-medium text-[#1A5319] leading-none text-[15px] sm:text-[18px]">
                {price.toLocaleString('fr-MA', { minimumFractionDigits: 2 }).replace('.', ',')} <span className="text-[13px] sm:text-[15px]">MAD</span>
              </span>
              {isOnSale && oldPrice && (
                <span className="text-slate-500 line-through leading-none font-normal text-[12px] sm:text-[15px]">
                  {oldPrice.toLocaleString('fr-MA', { minimumFractionDigits: 2 }).replace('.', ',')} MAD
                </span>
              )}
            </div>

            {/* Add to Cart Button List */}
            <div className="mt-auto flex justify-start">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl
                  });
                }}
                className="rounded-[6px] bg-[#1A5319] text-white px-3 py-1.5 sm:px-5 sm:py-2 font-bold sm:font-medium text-[12px] sm:text-[14px] hover:bg-[#004d26] transition-colors shadow-sm"
              >
                Ajouter au panier
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-end justify-between mt-auto gap-2">
            {/* Price Area Grid */}
            <div className="flex flex-col justify-end min-w-0">
              {isOnSale && oldPrice ? (
                <span className="text-slate-500 line-through leading-none font-normal text-[11px] sm:text-[12px] mb-1 sm:mb-1.5 truncate">
                  {oldPrice.toLocaleString('fr-MA', { minimumFractionDigits: 2 }).replace('.', ',')} MAD
                </span>
              ) : (
                <span className="leading-none text-[11px] sm:text-[12px] mb-1 sm:mb-1.5 opacity-0 select-none">0</span>
              )}
              <span className="font-medium text-[#1A5319] leading-none text-[14px] sm:text-[16px] truncate">
                {price.toLocaleString('fr-MA', { minimumFractionDigits: 2 }).replace('.', ',')} MAD
              </span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl
                });
              }}
              className="rounded-[8px] flex items-center justify-center transition-colors duration-300 w-8 h-8 sm:w-9 sm:h-9 bg-[#1A5319]/10 text-[#1A5319] lg:group-hover/card:bg-[#1A5319] lg:group-hover/card:text-white shrink-0"
            >
              <ShoppingCart size={16} strokeWidth={2.5} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>
      </Link>
    </motion.div>
  );
}
