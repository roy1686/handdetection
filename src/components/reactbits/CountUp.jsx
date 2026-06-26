import React, { useEffect, useRef, useState } from 'react';

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2, // Duration in seconds
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
}) {
  const ref = useRef(null);
  const [count, setCount] = useState(from);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView && startWhen) {
      if (onStart) onStart();
      
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        
        const currentCount = Math.floor(easeProgress * (to - from) + from);
        setCount(direction === 'up' ? currentCount : to - currentCount);
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setCount(to);
          if (onEnd) onEnd();
        }
      };
      
      const timeout = setTimeout(() => window.requestAnimationFrame(step), delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [inView, startWhen, to, from, duration, delay, direction, onStart, onEnd]);

  const formattedCount = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return (
    <span ref={ref} className={className}>
      {formattedCount}
    </span>
  );
}
