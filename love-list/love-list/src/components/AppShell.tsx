"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PasscodeLock } from "./PasscodeLock";

export function AppShell({
  initiallyUnlocked,
  children,
}: {
  initiallyUnlocked: boolean;
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);

  return (
    <AnimatePresence mode="wait">
      {unlocked ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="lock"
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.4, ease: "easeIn" }}
        >
          <PasscodeLock onUnlock={() => setUnlocked(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
