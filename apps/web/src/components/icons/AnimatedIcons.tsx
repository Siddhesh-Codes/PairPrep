'use client';

import type { HTMLAttributes, MouseEvent, SVGProps } from 'react';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import type { Variants } from 'motion/react';
import { motion, useAnimate, useAnimation } from 'motion/react';

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AArrowUpIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const letterVariants: Variants = {
  normal: { opacity: 1, scale: 1 },
  animate: {
    opacity: [0, 1],
    scale: [0.8, 1],
    transition: { duration: 0.3 },
  },
};

const arrowVariants: Variants = {
  normal: { opacity: 1, y: 0 },
  animate: {
    opacity: [0, 1],
    y: [10, 0],
    transition: { duration: 0.3, delay: 0.2 },
  },
};

export const AArrowUpIcon = forwardRef<AnimatedIconHandle, AArrowUpIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 24, ...props }, ref) => {
    const controls = useAnimation();
    const controlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      controlledRef.current = true;
      return {
        startAnimation: () => controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      };
    });

    const handleMouseEnter = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (controlledRef.current) {
          onMouseEnter?.(event);
          return;
        }
        controls.start('animate');
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (controlledRef.current) {
          onMouseLeave?.(event);
          return;
        }
        controls.start('normal');
      },
      [controls, onMouseLeave],
    );

    return (
      <div
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path animate={controls} d="M3.5 13h6" variants={letterVariants} />
          <motion.path animate={controls} d="m2 16 4.5-9 4.5 9" variants={letterVariants} />
          <motion.path animate={controls} d="M18 16V7" variants={arrowVariants} />
          <motion.path animate={controls} d="m14 11 4-4 4 4" variants={arrowVariants} />
        </svg>
      </div>
    );
  },
);

AArrowUpIcon.displayName = 'AArrowUpIcon';

interface PlugConnectedIconProps extends Omit<
  SVGProps<SVGSVGElement>,
  | 'ref'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDragStart'
  | 'onDrop'
  | 'values'
> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

export const PlugConnectedIcon = forwardRef<AnimatedIconHandle, PlugConnectedIconProps>(
  (
    { size = 24, color = 'currentColor', strokeWidth = 2, className = '', ...props },
    ref,
  ) => {
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      animate('.plug-upper-part', { y: 2, x: -2 }, { duration: 0.35, ease: 'easeOut' });
      animate('.plug-lower-leg', { opacity: 0 }, { duration: 0.35, ease: 'easeOut' });
      animate('.plug-lower-part', { y: -2, x: 2 }, { duration: 0.35, ease: 'easeOut' });
    }, [animate]);

    const stop = useCallback(async () => {
      animate(
        '.plug-upper-part, .plug-lower-leg, .plug-lower-part',
        { y: 0, x: 0, opacity: 1 },
        { duration: 0.3, ease: 'easeInOut' },
      );
    }, [animate]);

    useImperativeHandle(ref, () => ({
      startAnimation: start,
      stopAnimation: stop,
    }));

    return (
      <motion.svg
        ref={scope}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        onHoverStart={start}
        onHoverEnd={stop}
        {...props}
      >
        <motion.path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <motion.path
          d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5z"
          className="plug-lower-part"
        />
        <motion.path
          d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5z"
          className="plug-upper-part"
        />
        <motion.path d="M3 21l2.5 -2.5" className="plug-lower-part" />
        <motion.path d="M18.5 5.5l2.5 -2.5" className="plug-upper-part" />
        <motion.path d="M10 11l-2 2" className="plug-lower-part plug-lower-leg" />
        <motion.path d="M13 14l-2 2" className="plug-lower-part plug-lower-leg" />
      </motion.svg>
    );
  },
);

PlugConnectedIcon.displayName = 'PlugConnectedIcon';
