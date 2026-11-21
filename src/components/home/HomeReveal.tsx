"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

export default function HomeReveal({ children, className, onScroll = false }: { children: ReactNode; className?: string; onScroll?: boolean }) {
  const reduceMotion = useReducedMotion()
  const visible = { opacity: 1, y: 0 }

  return (
    <motion.div
      className={`${className ?? ""} motion-reduce:transform-none! motion-reduce:opacity-100!`}
      initial={reduceMotion ? false : { opacity: 0.9, y: 6 }}
      animate={!onScroll || reduceMotion ? visible : undefined}
      whileInView={onScroll && !reduceMotion ? visible : undefined}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
