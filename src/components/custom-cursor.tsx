import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cursorText, setCursorText] = useState("");
  
  // Real mouse coordinates
  const mouseRef = useRef({ x: 0, y: 0 });
  
  // Animated follower coordinates (lerp)
  const followerRef = useRef({ x: 0, y: 0 });
  
  // Ref for the follower DOM element
  const followerElementRef = useRef<HTMLDivElement>(null);
  
  // Ref for the inner dot DOM element
  const dotElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable custom cursor on devices that support a precise pointer (desktop)
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    // Enable default cursor hiding styles
    document.documentElement.classList.add("custom-cursor-active");
    setActive(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      
      // Instantly position the inner dot
      if (dotElementRef.current) {
        dotElementRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleMouseLeave = () => {
      setActive(false);
    };

    const handleMouseEnter = () => {
      setActive(true);
    };

    // Global listener for interactive hovers
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      
      const clickable = target.closest("a, button, [role='button'], [data-cursor], input, select, textarea");
      if (clickable) {
        setHovered(true);
        const text = clickable.getAttribute("data-cursor");
        setCursorText(text || "");
      } else {
        setHovered(false);
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);

    // Lerp loop for the outer circle (follower)
    let animationFrameId: number;
    const tick = () => {
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;
      
      const currentX = followerRef.current.x;
      const currentY = followerRef.current.y;
      
      // Lerp logic: current = current + (target - current) * factor
      // factor 0.12 gives a premium sluggish/elastic lag
      const nextX = currentX + (targetX - currentX) * 0.12;
      const nextY = currentY + (targetY - currentY) * 0.12;
      
      followerRef.current.x = nextX;
      followerRef.current.y = nextY;
      
      if (followerElementRef.current) {
        followerElementRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
      }
      
      animationFrameId = requestAnimationFrame(tick);
    };
    
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!active) return null;

  return (
    <>
      {/* Precision Inner Dot */}
      <div
        ref={dotElementRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-orange mix-blend-difference transition-transform duration-200"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
      
      {/* Outer Follower Circle */}
      <div
        ref={followerElementRef}
        className={`pointer-events-none fixed left-0 top-0 z-[99] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-brand-orange/40 bg-transparent transition-all duration-300 ${
          hovered 
            ? "size-14 border-brand-orange bg-brand-orange/10 mix-blend-normal" 
            : "size-8"
        }`}
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        {cursorText && (
          <span className="text-[9px] font-bold tracking-widest text-brand-orange uppercase animate-fade-in">
            {cursorText}
          </span>
        )}
      </div>
    </>
  );
}
