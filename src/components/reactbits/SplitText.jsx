import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export default function SplitText({
  text,
  className = '',
  delay = 100,
  animationFrom = { y: 20, opacity: 0 },
  animationTo = { y: 0, opacity: 1 },
  easing = 'easeOut',
  threshold = 0.1,
  rootMargin = '-50px',
  onLetterAnimationComplete,
}) {
  const letters = text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef();
  const animatedCount = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <p ref={ref} className={`inline-block ${className}`}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={animationFrom}
          animate={inView ? animationTo : animationFrom}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 200,
            delay: index * (delay / 1000),
            ease: easing,
          }}
          className="inline-block"
          onAnimationComplete={() => {
            animatedCount.current += 1;
            if (animatedCount.current === letters.length && onLetterAnimationComplete) {
              onLetterAnimationComplete();
            }
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </p>
  );
}
