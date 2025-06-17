"use client";
import { motion } from "framer-motion";

interface SegmentedControlProps {
  tabs: { name: string; count: number }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SegmentedControl({
  tabs,
  activeTab,
  setActiveTab,
}: SegmentedControlProps) {
  return (
    <div className="segmented-control">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={`segmented-control-button ${
            activeTab === tab.name ? "" : "inactive"
          }`}
        >
          {activeTab === tab.name && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-background shadow-md"
              style={{ borderRadius: 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.name}</span>
          <span
            className={`relative z-10 ml-2 rounded-full px-2 py-0.5 text-xs transition-colors
              ${
                activeTab === tab.name
                  ? "bg-primary/20 text-primary"
                  : "bg-border text-muted-foreground"
              }
            `}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
