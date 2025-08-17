import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info } from 'lucide-react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  icon?: 'help' | 'info' | 'none';
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  icon = 'none',
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Auto-adjust position based on viewport
  useEffect(() => {
    if (isVisible && containerRef.current && tooltipRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // Check if tooltip would go off screen
      if (position === 'top' && container.top - tooltip.height < 10) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && container.bottom + tooltip.height > viewport.height - 10) {
        newPosition = 'top';
      } else if (position === 'left' && container.left - tooltip.width < 10) {
        newPosition = 'right';
      } else if (position === 'right' && container.right + tooltip.width > viewport.width - 10) {
        newPosition = 'left';
      }

      setTooltipPosition(newPosition);
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const getPositionClasses = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800';
    }
  };

  const IconComponent = icon === 'help' ? HelpCircle : icon === 'info' ? Info : null;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="flex items-center">
        {children}
        {IconComponent && (
          <IconComponent className="h-4 w-4 ml-1 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: tooltipPosition === 'top' ? 10 : tooltipPosition === 'bottom' ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: tooltipPosition === 'top' ? 10 : tooltipPosition === 'bottom' ? -10 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute z-[9999] ${getPositionClasses()}`}
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-xl backdrop-blur-sm border border-gray-700/50">
              {content}
              <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for inline help text
export function HelpText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Tooltip
      content={children}
      icon="help"
      className={className}
    >
      <span></span>
    </Tooltip>
  );
}

// Pulsing hotspot component
export function PulsingHotspot({ 
  children, 
  tooltip, 
  position = 'top',
  className = '' 
}: { 
  children: React.ReactNode;
  tooltip: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}) {
  return (
    <Tooltip content={tooltip} position={position} className={className}>
      <div className="relative">
        {children}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary-400/30 pointer-events-none"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-primary-400/20 pointer-events-none"
          animate={{ scale: [1, 1.8, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
        />
      </div>
    </Tooltip>
  );
}

export default Tooltip;