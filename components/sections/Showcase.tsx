"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface ShowcaseItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  video?: string;
  images?: string[]; // For looping images
  iconType?: 'tencent' | 'meta' | 'ms';
}

const showcaseItems: ShowcaseItem[] = [
  {
    id: "hunyuan-2.1",
    name: "Hunyuan3D-2.1",
    description: "High-quality 3D model generation with advanced texture mapping",
    video: "/hallowhydrilla.mp4",
    iconType: 'tencent',
  },
  {
    id: "hunyuan-2",
    name: "Hunyuan3D-2",
    description: "Professional 3D asset creation with photorealistic rendering",
    image: "/tenc-3d.jpg",
    iconType: 'tencent',
  },
  {
    id: "sam3d",
    name: "SAM3D",
    description: "Segment Anything Model for 3D object detection and segmentation",
    image: "/sam-3d.jpg",
    iconType: 'meta',
  },
  {
    id: "hunyuan-2mini-turbo",
    name: "Hunyuan3D-2mini-Turbo",
    description: "Fast 3D model generation optimized for real-time workflows",
    image: "/turbo.png",
    iconType: 'tencent',
  },
  {
    id: "trellis-2",
    name: "Trellis 2",
    description: "Advanced 3D mesh generation with intelligent topology optimization",
    images: [
      "/3d-images/89f0abbe-6ec0-4e57-81bc-0c482f4c2aa1.jpg",
      "/3d-images/6e596451-4fdd-4221-89b5-3921b6bcb1cc.jpg",
      "/3d-images/73cffa71-0ff3-4e31-8d96-03fd65487289.jpg",
      "/3d-images/7ec37d29-7878-4236-bacb-3295804c6158.jpg",
      "/3d-images/182762e0-c273-480b-8083-4874676e32c9.jpg",
    ],
    iconType: 'ms',
  },
];

export default function Showcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [imageLoopIndex, setImageLoopIndex] = useState(0);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check for low-power mode and data-saver mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check for data-saver mode
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const isDataSaver = connection?.saveData === true;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Only autoplay if not in data-saver mode and not reduced motion
    setShouldAutoplay(!isDataSaver && !prefersReducedMotion);
  }, []);

  // Calculate how many cards to show per view based on screen size
  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1280) return 4; // xl
    if (window.innerWidth >= 1024) return 3; // lg
    if (window.innerWidth >= 640) return 2; // sm
    return 1; // mobile
  };

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, showcaseItems.length - cardsPerView);

  const scrollToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
    
    if (scrollContainerRef.current && cardRefs.current[clampedIndex]) {
      const card = cardRefs.current[clampedIndex];
      const container = scrollContainerRef.current;
      const cardLeft = card.offsetLeft;
      const containerPadding = parseInt(getComputedStyle(container).paddingLeft || '0');
      
      // Scroll to align card with snap point
      const scrollLeft = cardLeft - containerPadding;
      
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth',
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  // Handle scroll snap and update index, prevent vertical scroll lock
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = 380;
      const gap = 24; // gap-6
      const cardWithGap = cardWidth + gap;
      const newIndex = Math.round(scrollLeft / cardWithGap);
      setCurrentIndex(Math.min(Math.max(0, newIndex), maxIndex));
    };

    // Only prevent default for horizontal wheel events
    const handleWheel = (e: WheelEvent) => {
      // Only prevent if scrolling horizontally
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        container.scrollLeft += e.deltaX;
      }
      // Allow vertical scrolling
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [maxIndex]);

  // Image loop animation for Trellis 2 card
  useEffect(() => {
    const trellisItem = showcaseItems.find(item => item.id === 'trellis-2');
    if (!trellisItem?.images) return;

    const interval = setInterval(() => {
      setImageLoopIndex((prev) => (prev + 1) % trellisItem.images!.length);
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full bg-white py-16 sm:py-20 md:py-24 pb-24 sm:pb-28 md:pb-32">
      <div className="w-full">
        {/* Carousel Container - Full width, no padding */}
        <div className="relative">
          {/* Scrollable Cards Container - Smooth horizontal scroll with snap */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 sm:gap-8 md:gap-10 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {showcaseItems.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200/30 shadow-sm flex-shrink-0 snap-start snap-always w-[85vw] sm:w-[380px]"
                style={{
                  scrollSnapAlign: 'center',
                }}
              >
                {/* Card Image Container - All hover effects clipped inside */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
                  {/* Background Media Layer - Video, Image, or Looping Images */}
                  <div className="absolute inset-0 transform scale-100 group-hover:scale-[1.05] transition-transform duration-700 ease-out">
                    {item.video ? (
                      <video
                        ref={index === 0 ? videoRef : null}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay={shouldAutoplay}
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        style={{
                          willChange: 'transform',
                          contentVisibility: 'auto',
                        }}
                        onLoadedMetadata={(e) => {
                          // Prevent repaint/reflow during load
                          const video = e.currentTarget;
                          video.style.opacity = '0';
                          requestAnimationFrame(() => {
                            video.style.opacity = '1';
                            video.style.transition = 'opacity 0.3s ease-in';
                          });
                        }}
                      >
                        <source src={item.video} type="video/mp4" />
                      </video>
                    ) : item.images ? (
                      <Image
                        src={item.images[imageLoopIndex]}
                        alt={item.name}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        style={{
                          willChange: 'transform',
                          contentVisibility: 'auto',
                        }}
                      />
                    ) : item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        style={{
                          willChange: 'transform',
                          contentVisibility: 'auto',
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)`
                        }} />
                      </div>
                    )}
                  </div>
                  
                  {/* Logo/Brand Name - Top Left */}
                  <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10">
                    <div className="flex items-center gap-2.5">
                      {item.iconType && (
                        <div className="relative w-5 h-5 flex-shrink-0 flex items-center justify-center">
                          {item.iconType === 'tencent' && (
                            <Image
                              src="/tencent.png"
                              alt="Tencent"
                              width={20}
                              height={20}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          {item.iconType === 'meta' && (
                            <Image
                              src="/meta.png"
                              alt="Meta"
                              width={20}
                              height={20}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          {item.iconType === 'ms' && (
                            <Image
                              src="/ms.png"
                              alt="Microsoft"
                              width={20}
                              height={20}
                              className="w-5 h-5 object-contain brightness-0 invert"
                            />
                          )}
                        </div>
                      )}
                      <span 
                        className="text-base sm:text-lg font-semibold text-white"
                        style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>

                  {/* Gradient Overlay - Subtle darkening on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 via-black/30 to-transparent group-hover:from-black/90 group-hover:via-black/55 group-hover:via-black/35 transition-all duration-500 ease-out" />
                  
                  {/* Card Content - Moves upward on hover when button appears, extra bottom padding on mobile for button */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-7 pb-20 md:pb-7 z-10 transform translate-y-0 md:group-hover:translate-y-[-53px] transition-transform duration-500 ease-out">
                    {/* Create Label */}
                    <div className="mb-3 sm:mb-4">
                      <span 
                        className="text-xs sm:text-sm font-medium text-white/95 uppercase tracking-widest"
                        style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                      >
                        Create
                      </span>
                    </div>
                    
                    {/* Description Text - Adjusted size */}
                    <p 
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-[1.1]"
                      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                    >
                      &ldquo;{item.description}&rdquo;
                    </p>
                  </div>

                  {/* Create 3D Button - Small, left-aligned, slides up from bottom on hover */}
                  <div className="absolute bottom-0 left-0 z-20 p-4 sm:p-5 md:p-6">
                    <Link
                      href="/generate"
                      className="inline-block transform translate-y-0 md:translate-y-[calc(100%+16px)] md:group-hover:translate-y-0 transition-transform duration-500 ease-out"
                      style={{
                        backgroundColor: '#262626',
                        color: '#fff',
                        paddingTop: 'calc(0.25rem * 3)',
                        paddingBottom: 'calc(0.25rem * 3)',
                        paddingLeft: 'calc(0.25rem * 5)',
                        paddingRight: 'calc(0.25rem * 5)',
                        borderRadius: 'calc(0.625rem - 2px)',
                        fontSize: '0.8125rem',
                        lineHeight: '100%',
                        fontWeight: 500,
                        fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        willChange: 'transform',
                        transitionProperty: 'transform, translate',
                        transitionDuration: '0.5s',
                        transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
                        width: 'fit-content',
                        textDecoration: 'none',
                      }}
                    >
                      Create 3D
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons - Positioned below cards */}
          <div className="absolute -bottom-12 sm:-bottom-14 md:-bottom-16 right-4 sm:right-6 md:right-8 lg:right-12 flex gap-2 z-30">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md border border-gray-300/50 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md border border-gray-300/50 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

