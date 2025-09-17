"use client"
import React from "react";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main 
      className="mx-auto min-h-screen bg-background text-foreground"
    >
      <div className="relative mx-auto">
        <Hero />
      </div>
    </main>
  );
}
