"use client";

import Image from "next/image";
import {
  ArrowRight, BadgeCheck, Bike, BookOpen, CheckCircle2, Gift, HandHeart,
  Headphones, HeartHandshake, Home, LockKeyhole, MapPin, MessageCircle,
  Search, ShieldCheck, Store, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketplaceBeta } from "@/components/marketplace-beta";
import { AccessibilityPanel } from "@/components/accessibility-panel";
import { RegisterDialog } from "@/components/register-dialog";
import { ContactAdminDialog } from "@/components/contact-admin-dialog";

const listings = [
  { name: "Autism-friendly book set", price: "£10", area: "Manchester", icon: BookOpen, colour: "bg-[#d9f0eb] text-[#086b63]", condition: "Excellent" },
  { name: "Balance bike", price: "£35", area: "Leeds", icon: Bike, colour: "bg-[#fff0cf] text-[#8a5a00]", condition: "Good" },
  { name: "Sensory light projector", price: "£18", area: "Birmingham", icon: Home, colour: "bg-[#e8e4ff] text-[#5745a5]", condition: "Good" },
  { name: "Ear defenders", price: "Free", area: "Liverpool", icon: Headphones, colour: "bg-[#ffe2dc] text-[#a43f32]", condition: "Pass it on" },
];

const support = [
  { name: "National Autistic Society", detail: "Autism information, guidance and parent-to-parent support.", href: "https://www.autism.org.uk/advice-and-guidance/help-and-support", label: "Autism support" },
  { name: "Contact", detail: "Advice for families with disabled children, benefits and practical support.", href: "https://contact.org.uk/help-for-families/", label: "Family advice" },
  { name: "IPSEA", detail: "Free and independent information about SEND law and education rights.", href: "https://www.ipsea.org.uk/", label: "Education rights" },
  { name: "Samaritans", detail: "Free emotional support, any time, day or night. Call 116 123.", href: "https://www.samaritans.org/how-we-can-help/contact-samaritan/", label: "Urgent support" },
];

const rules = [
  "No harmful, degrading, threatening or discriminatory names or wording",
  "Never share phone numbers or move payments off the platform",
  "Do not discuss or post diagnoses, medication, medical records or private health information",
  "Report concerns—accounts can be restricted immediately while reviewed",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#153c3a]">
      <div className="bg-[#123f3b] px-4 py-2.5 text-center text-sm font-medium text-white">
        Need urgent emotional support? Call Samaritans free on <a className="underline decoration-white/50 underline-offset-4" href="tel:116123">116 123</a> — no account needed.
      </div>

      <header className="sticky top-0 z-40 border-b border-[#dce8e5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <a className="flex items-center gap-3" href="#top" aria-label="Autism Family Exchange home">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#08776d] text-white shadow-sm"><HeartHandshake className="size-6" /></span>
            <span className="leading-tight"><strong className="block text-xl tracking-[-0.04em]">AFE</strong><span className="text-xs font-semibold text-[#08776d] sm:text-sm">Autism Family Exchange</span></span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#365c59] lg:flex" aria-label="Main navigation">
            <a className="hover:text-[#08776d]" href="#marketplace">Marketplace</a>
            <a className="hover:text-[#08776d]" href="#support">Find support</a>
            <a className="hover:text-[#08776d]" href="#community">Community safety</a>
            <a className="hover:text-[#08776d]" href="#partners">For organisations</a>
          </nav>
          <div className="flex items-center gap-2">
            <AccessibilityPanel />
            <span className="hidden rounded-full bg-[#fff0cf] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#6e4c07] sm:inline-flex">Private preview</span>
            <RegisterDialog />
          </div>
        </div>
      </header>

      <section id="top" className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-8 lg:pb-20 lg:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#123f3b] shadow-[0_30px_80px_rgba(18,63,59,0.18)]">
          <Image src="/family-sensory-hero.webp" alt="A parent and child calmly exploring sensory toys together" width={1942} height={809} priority className="absolute inset-0 h-full w-full object-cover object-center opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#123f3b] via-[#123f3b]/95 to-[#123f3b]/5" />
          <div className="relative max-w-2xl px-7 py-14 text-white sm:px-12 sm:py-20 lg:px-16 lg:py-24">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur"><ShieldCheck className="size-4" /> AFE private preview · Adults 18+ only</span>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">Useful things. Trusted help. People who understand.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#e7f4f1]">Buy, sell, swap or give away anything that can help autistic people and their families—from books and bikes to toys, clothing and sensory equipment.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <RegisterDialog hero />
              <Button asChild variant="outline" size="lg" className="h-12 border-white/40 bg-white/10 px-6 text-white hover:bg-white hover:text-[#123f3b]"><a href="#support">Find help without registering</a></Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#d7ebe7]">
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> No listing fee</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> Everything autism</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> Safe messaging being built</span>
            </div>
          </div>
        </div>
      </section>

      <section id="marketplace" className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><span className="eyebrow">Community marketplace</span><h2 className="section-title">Anything useful. One trusted place.</h2><p className="section-copy">Browse books, bikes, toys, clothing, learning materials, communication aids, sensory equipment and more from families and verified specialist shops.</p></div>
          <div className="relative w-full md:max-w-sm"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#6a8582]" /><Input className="h-12 rounded-xl border-[#c9dbd7] bg-white pl-11 text-base" placeholder="What are you looking for?" aria-label="Search the autism marketplace" /></div>
        </div>
        <MarketplaceBeta />
        <div className="mt-7 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["All items", "Books", "Toys", "Sensory", "Bikes & outdoors", "Clothing", "Communication", "Learning", "Home & sleep"].map((item, index) => <button key={item} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${index === 0 ? "bg-[#123f3b] text-white" : "border border-[#cfe0dd] bg-white text-[#365c59] hover:border-[#08776d]"}`}>{item}</button>)}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map(({ name, price, area, icon: Icon, colour, condition }) => (
            <article key={name} className="group overflow-hidden rounded-2xl border border-[#d9e6e3] bg-white shadow-[0_10px_30px_rgba(18,63,59,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(18,63,59,0.11)]">
              <div className={`grid h-44 place-items-center ${colour}`}><Icon className="size-16 stroke-[1.4] transition group-hover:scale-105" /></div>
              <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-[#173f3c]">{name}</h3><strong className="text-lg text-[#08776d]">{price}</strong></div><p className="mt-2 text-sm text-[#607a77]">{condition}</p><div className="mt-4 flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 text-[#607a77]"><MapPin className="size-4" /> {area}</span><span className="font-bold text-[#08776d]">Example</span></div></div>
            </article>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[{ icon: Tag, title: "Sell almost anything", text: "Free to list, with a planned flat 50p platform fee only after a successful sale." }, { icon: Gift, title: "Swap or pass it on", text: "Planned swaps and in-person collection remain free and are arranged by adults." }, { icon: Store, title: "Specialist shops", text: "Approved autism-focused businesses will be able to open a shopfront." }].map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-4 rounded-2xl border border-[#d9e6e3] bg-white p-5"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e4f3f0] text-[#08776d]"><Icon /></span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-[#607a77]">{text}</p></div></div>)}
        </div>
      </section>

      <section id="support" className="bg-[#edf6f4] py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div><span className="eyebrow">Free support directory</span><h2 className="section-title">You do not need an account to ask for help.</h2><p className="section-copy">Choose what you need and go directly to an established support organisation. We do not receive your private information, charge a referral fee or act as the support provider. Organisations shown during the preview are independent resources—not confirmed AFE partners unless clearly stated.</p><a href="tel:116123" className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-[#e14f3d] px-5 py-4 font-bold text-white shadow-sm"><HeartHandshake className="size-5" /><span>Samaritans — call free on 116 123<small className="block font-medium text-white/80">24 hours a day</small></span></a></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {support.map((item) => <a key={item.name} href={item.href} target="_blank" rel="noreferrer" className="group rounded-2xl border border-[#d2e4e0] bg-white p-5 transition hover:border-[#68aaa2] hover:shadow-md"><span className="text-xs font-bold uppercase tracking-[0.12em] text-[#08776d]">{item.label}</span><h3 className="mt-2 text-lg font-bold">{item.name}</h3><p className="mt-2 text-sm leading-6 text-[#607a77]">{item.detail}</p><span className="mt-4 flex items-center gap-1 text-sm font-bold text-[#08776d]">Visit their website <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span></a>)}
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div><span className="eyebrow">AFE safety plan</span><h2 className="section-title">Connection without giving away your private life.</h2><p className="section-copy">Before public trading opens, AFE will connect account checks, protected messaging, reporting and moderation. Personal contact details will not appear on public profiles.</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{[{ icon: BadgeCheck, title: "Account checks", text: "Planned email, mobile and age checks for adult members." }, { icon: MessageCircle, title: "Protected messaging", text: "Planned filters, reporting and warnings against sharing contact details." }, { icon: LockKeyhole, title: "Privacy by design", text: "We will collect only the account details needed to run the service." }, { icon: ShieldCheck, title: "Fast intervention", text: "Reported accounts will be restrictable while concerns are reviewed." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl bg-white p-5 shadow-[0_8px_26px_rgba(18,63,59,0.06)]"><Icon className="size-6 text-[#08776d]" /><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-[#607a77]">{text}</p></div>)}</div></div>
        <div className="rounded-[2rem] bg-[#123f3b] p-7 text-white sm:p-10"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-white/10"><ShieldCheck /></span><div><p className="text-sm font-semibold text-[#a9d7d1]">Community standard</p><h3 className="text-2xl font-bold">Respect is not optional.</h3></div></div><ul className="mt-7 space-y-4">{rules.map(rule => <li key={rule} className="flex gap-3 text-[#e5f1ef]"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#63d2c6]" /><span>{rule}</span></li>)}</ul><Button className="mt-8 h-11 bg-white text-[#123f3b] hover:bg-[#e7f4f1]">Read the community rules</Button></div>
      </section>

      <section id="contact-afe" className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-[#d5e4e1] bg-white p-8 shadow-sm sm:p-10 lg:flex-row lg:items-center"><div><span className="eyebrow">Contact AFE</span><h2 className="mt-2 text-3xl font-bold tracking-tight">Comment, complaint or safety concern?</h2><p className="mt-3 max-w-3xl text-base leading-7 text-[#607a77]">Signed-in members can send a private message directly to AFE Admin. Messages are not shown publicly. For immediate danger call 999; for urgent emotional support call Samaritans on 116 123.</p></div><ContactAdminDialog /></div>
      </section>

      <section id="partners" className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[#f1d3c9] bg-[#fff4ef] p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#aa4738]"><HandHeart className="size-5" /> Charities, grant providers & housing organisations</span><h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Help families find your support—free of charge.</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-[#6d5651]">We want trusted organisations across every UK region to be easy to find. Listings take people directly to your own website, application page or helpline. We do not charge organisations or collect referral fees.</p></div><Button size="lg" className="h-12 bg-[#a94334] px-6 hover:bg-[#8d3428]">List your organisation <ArrowRight /></Button></div>
        </div>
      </section>

      <footer className="bg-[#0d302d] text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8"><div><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#0b7f74]"><HeartHandshake /></span><span><strong className="block text-lg tracking-tight">AFE</strong><span className="text-xs text-[#bbd3d0]">Autism Family Exchange</span></span></div><p className="mt-4 max-w-md text-sm leading-6 text-[#bbd3d0]">An adult-only marketplace and support community created to help autistic people and their families exchange useful items, find trusted information and feel understood.</p></div><div><h3 className="font-bold">Explore</h3><div className="mt-4 grid gap-3 text-sm text-[#bbd3d0]"><a href="#marketplace">Marketplace</a><a href="#support">Support directory</a><a href="#community">Community safety</a><a href="#partners">Organisations</a></div></div><div><h3 className="font-bold">Important</h3><div className="mt-4 grid gap-3 text-sm text-[#bbd3d0]"><a href="#community">Privacy and safety</a><a href="#community">Community terms</a><a href="#community">Report a concern</a><a href="tel:116123">Urgent help: 116 123</a></div></div></div><div className="border-t border-white/10 px-5 py-5 text-center text-xs text-[#9ab7b3]">AFE is currently a private prototype. Independent resource links do not imply endorsement or partnership.</div></footer>
    </main>
  );
}
