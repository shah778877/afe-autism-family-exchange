"use client";

import { Accessibility, RotateCcw, TextCursorInput } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Preferences = { largeText: boolean; underlineLinks: boolean; reduceMotion: boolean };
const initial: Preferences = { largeText: false, underlineLinks: false, reduceMotion: false };

export function AccessibilityPanel() {
  const [preferences, setPreferences] = useState<Preferences>(initial);

  useEffect(() => {
    const stored = window.localStorage.getItem("afe-accessibility");
    if (stored) {
      try { setPreferences({ ...initial, ...JSON.parse(stored) }); } catch { /* Keep safe defaults. */ }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("afe-large-text", preferences.largeText);
    root.classList.toggle("afe-underline-links", preferences.underlineLinks);
    root.classList.toggle("afe-reduce-motion", preferences.reduceMotion);
    window.localStorage.setItem("afe-accessibility", JSON.stringify(preferences));
  }, [preferences]);

  const option = (key: keyof Preferences, title: string, detail: string) => <div className="flex items-center justify-between gap-5 rounded-xl border border-[#d5e4e1] p-4"><div><Label htmlFor={`afe-${key}`} className="font-bold">{title}</Label><p className="mt-1 text-sm leading-5 text-[#607a77]">{detail}</p></div><Switch id={`afe-${key}`} checked={preferences[key]} onCheckedChange={(value) => setPreferences((current) => ({ ...current, [key]: value }))} /></div>;

  return <Dialog>
    <DialogTrigger asChild><Button variant="outline" size="sm" className="border-[#c9dbd7] text-[#153c3a]" aria-label="Open accessibility settings"><Accessibility className="size-4" /><span className="hidden sm:inline">Accessibility</span></Button></DialogTrigger>
    <DialogContent className="rounded-2xl border-[#d5e4e1] sm:max-w-lg"><DialogHeader><DialogTitle className="flex items-center gap-2 text-2xl text-[#153c3a]"><TextCursorInput className="text-[#08776d]" /> Accessibility settings</DialogTitle><DialogDescription className="text-base leading-6">Choose a calmer and easier reading experience. These preferences stay on this device.</DialogDescription></DialogHeader><div className="grid gap-3">{option("largeText", "Larger text", "Increase the site’s base text size.")}{option("underlineLinks", "Underline links", "Make links easier to recognise.")}{option("reduceMotion", "Reduce movement", "Turn off non-essential animation and smooth scrolling.")}</div><Button variant="outline" onClick={() => setPreferences(initial)}><RotateCcw className="size-4" /> Reset settings</Button></DialogContent>
  </Dialog>;
}
