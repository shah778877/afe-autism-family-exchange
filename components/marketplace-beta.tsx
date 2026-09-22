"use client";

import Image from "next/image";
import { ArrowLeft, Camera, CheckCircle2, CreditCard, Eye, Loader2, MapPin, PackageCheck, Plus, ShieldCheck, Truck } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Listing = {
  id: number;
  title: string;
  description: string;
  category: string;
  condition: string;
  exchangeType: "sell" | "giveaway" | "swap";
  pricePence: number | null;
  postagePence: number | null;
  deliveryMethod: string;
  area: string;
  moderationStatus: string;
  imageUrl: string | null;
  isOwner: boolean;
};

const MAX_SOURCE_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_STORED_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_PHOTO_EDGE = 1600;

async function optimisePhoto(file: File) {
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
    throw new Error("Photographs must be JPG, PNG or WebP files.");
  }
  if (file.size > MAX_SOURCE_PHOTO_BYTES) {
    throw new Error("One of the original photographs is larger than 10 MB.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("AFE could not prepare that photograph.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const encode = (quality: number) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("AFE could not prepare that photograph.")), "image/webp", quality);
  });
  let blob = await encode(0.82);
  if (blob.size > MAX_STORED_PHOTO_BYTES) blob = await encode(0.68);
  if (blob.size > MAX_STORED_PHOTO_BYTES) throw new Error("One photograph is still too large after resizing. Please choose a simpler image.");
  const safeName = file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "afe-listing-photo";
  return new File([blob], `${safeName}.webp`, { type: "image/webp" });
}

function priceLabel(listing: Listing) {
  if (listing.exchangeType === "giveaway") return "Free";
  if (listing.exchangeType === "swap") return "Swap";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format((listing.pricePence ?? 0) / 100);
}

export function MarketplaceBeta() {
  const [items, setItems] = useState<Listing[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/listings", { cache: "no-store" });
      const data = await response.json() as { listings?: Listing[] };
      if (!response.ok) throw new Error();
      setItems(data.listings ?? []);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const refresh = () => void load();
    window.addEventListener("afe-listing-created", refresh);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("afe-listing-created", refresh);
    };
  }, [load]);

  return (
    <>
      <CreateListingDialog />
      {items.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><span className="eyebrow">Private beta activity</span><h3 className="text-2xl font-extrabold tracking-tight">Member listings</h3></div>
            <span className="text-sm font-semibold text-[#607a77]">Safety-reviewed before wider publication</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-[#d9e6e3] bg-white shadow-[0_10px_30px_rgba(18,63,59,0.05)]">
                <div className="relative grid h-44 place-items-center bg-[#d9f0eb] text-[#08776d]">
                  {item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" /> : <Camera className="size-12 stroke-[1.5]" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3"><h4 className="font-bold">{item.title}</h4><strong className="text-lg text-[#08776d]">{priceLabel(item)}</strong></div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#607a77]">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 text-[#607a77]"><MapPin className="size-4" /> {item.area}</span>{item.moderationStatus === "pending" && item.isOwner ? <span className="rounded-full bg-[#fff0cf] px-2 py-1 text-xs font-bold text-[#6e4c07]">Awaiting review</span> : <span className="font-bold text-[#08776d]">Approved</span>}</div>
                  <Button variant="outline" className="mt-4 w-full border-[#b9d3ce] text-[#086b63] hover:bg-[#edf6f4]" onClick={() => setSelected(item)}><Eye className="size-4" /> {item.isOwner && item.moderationStatus === "pending" ? "Preview buyer view" : "View listing"}</Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      {unavailable && <p className="mt-4 text-sm text-[#607a77]">Member listings are temporarily unavailable while the private-beta storage is prepared.</p>}
      <ListingDetailsDialog listing={selected} open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }} />
    </>
  );
}

function money(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

function ListingDetailsDialog({ listing, open, onOpenChange }: { listing: Listing | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [checkout, setCheckout] = useState(false);
  if (!listing) return null;
  const postage = listing.deliveryMethod === "collection" ? 0 : (listing.postagePence ?? 0);
  const total = (listing.pricePence ?? 0) + postage;
  const sellerFee = listing.exchangeType === "sell" ? 50 : 0;

  return <Dialog open={open} onOpenChange={(value) => { onOpenChange(value); if (!value) setCheckout(false); }}>
    <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-[#d5e4e1] sm:max-w-2xl">
      {!checkout ? <>
        <DialogHeader><DialogTitle className="text-2xl text-[#153c3a]">{listing.title}</DialogTitle><DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"><span>{listing.category}</span><span>{listing.condition}</span><span className="flex items-center gap-1"><MapPin className="size-4" /> {listing.area}</span></DialogDescription></DialogHeader>
        <div className="relative mt-2 grid min-h-64 place-items-center overflow-hidden rounded-2xl bg-[#d9f0eb] text-[#08776d]">
          {listing.imageUrl ? <Image src={listing.imageUrl} alt={`Photograph of ${listing.title}`} fill sizes="(max-width: 640px) 100vw, 640px" className="object-cover" /> : <Camera className="size-16 stroke-[1.4]" />}
        </div>
        {listing.isOwner && listing.moderationStatus === "pending" && <div className="rounded-xl border border-[#efcf87] bg-[#fff7e5] p-4 text-sm leading-6 text-[#6e4c07]"><strong>Owner test preview:</strong> this shows how the advert will look to buyers after AFE approves it. It is not yet public.</div>}
        <p className="whitespace-pre-wrap text-base leading-7 text-[#365c59]">{listing.description}</p>
        <div className="grid gap-3 rounded-2xl bg-[#edf6f4] p-5 sm:grid-cols-3">
          <div><span className="text-xs font-bold uppercase tracking-wide text-[#607a77]">Item</span><strong className="mt-1 block text-lg">{priceLabel(listing)}</strong></div>
          <div><span className="text-xs font-bold uppercase tracking-wide text-[#607a77]">Delivery</span><strong className="mt-1 block text-lg capitalize">{listing.deliveryMethod === "either" ? "Post or collection" : listing.deliveryMethod}</strong></div>
          <div><span className="text-xs font-bold uppercase tracking-wide text-[#607a77]">Postage</span><strong className="mt-1 block text-lg">{listing.deliveryMethod === "collection" ? "Not required" : postage ? money(postage) : "Seller to confirm"}</strong></div>
        </div>
        <DialogFooter><Button className="w-full bg-[#08776d] hover:bg-[#06665e]" onClick={() => setCheckout(true)}>{listing.isOwner ? "Preview buyer checkout" : listing.exchangeType === "sell" ? "Buy now" : listing.exchangeType === "giveaway" ? "Request item" : "Propose swap"}</Button></DialogFooter>
      </> : <>
        <button className="mb-1 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#08776d]" onClick={() => setCheckout(false)}><ArrowLeft className="size-4" /> Back to listing</button>
        <DialogHeader><DialogTitle className="text-2xl text-[#153c3a]">Buyer checkout preview</DialogTitle><DialogDescription className="text-base leading-6">This test does not take payment or save delivery details. Stripe will be connected only after the full journey has been checked.</DialogDescription></DialogHeader>
        {listing.exchangeType === "sell" ? <>
          <div className="grid gap-3 rounded-2xl border border-[#d5e4e1] p-5">
            <div className="flex justify-between"><span>Item</span><strong>{money(listing.pricePence ?? 0)}</strong></div>
            {listing.deliveryMethod !== "collection" && <div className="flex justify-between"><span>Postage</span><strong>{postage ? money(postage) : "To be confirmed"}</strong></div>}
            <div className="flex justify-between border-t pt-3 text-lg"><strong>Buyer total</strong><strong>{postage ? money(total) : money(listing.pricePence ?? 0)}</strong></div>
            <p className="text-sm leading-6 text-[#607a77]">AFE’s 50p platform fee is deducted from the seller’s proceeds. It is not added to the buyer’s total.</p>
          </div>
          {listing.deliveryMethod !== "collection" ? <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2 sm:col-span-2"><Label htmlFor="preview-recipient">Recipient name</Label><Input id="preview-recipient" placeholder="Only requested when buying" /></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="preview-address">Delivery address</Label><Input id="preview-address" placeholder="Not stored in this test" /></div><div className="grid gap-2"><Label htmlFor="preview-postcode">Postcode</Label><Input id="preview-postcode" /></div><div className="grid gap-2"><Label htmlFor="preview-phone">Telephone</Label><Input id="preview-phone" type="tel" /></div></div> : <div className="flex gap-3 rounded-xl bg-[#edf6f4] p-4"><PackageCheck className="mt-0.5 size-5 shrink-0 text-[#08776d]" /><p className="text-sm leading-6 text-[#365c59]">Collection order: no delivery address is requested. Buyer and seller arrange a safe collection through protected AFE messaging.</p></div>}
          <Button disabled className="h-12 w-full bg-[#08776d]"><CreditCard /> Stripe test payment—not connected yet</Button>
          <div className="flex gap-3 text-sm leading-6 text-[#607a77]"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#08776d]" /><p>AFE will never store card details. The seller pays one 50p successful-sale fee plus Stripe’s processing charge.</p></div>
        </> : <div className="rounded-2xl bg-[#edf6f4] p-6 text-center"><Truck className="mx-auto size-9 text-[#08776d]" /><h3 className="mt-3 font-bold">No online payment required</h3><p className="mt-2 text-sm leading-6 text-[#607a77]">Giveaways and swaps remain free. During the private beta, swaps are collection only and arrangements stay inside AFE messaging.</p></div>}
      </>}
    </DialogContent>
  </Dialog>;
}

function FieldSelect({ name, label, defaultValue, items }: { name: string; label: string; defaultValue: string; items: string[] }) {
  const labels: Record<string, string> = { sell: "Sell", giveaway: "Give away", swap: "Swap", post: "Post", collection: "Collection", either: "Post or collection" };
  return <div className="grid gap-2"><Label>{label}</Label><Select name={name} defaultValue={defaultValue}><SelectTrigger className="h-11 w-full border-[#c9dbd7]"><SelectValue /></SelectTrigger><SelectContent>{items.map((item) => <SelectItem key={item} value={item}>{labels[item] ?? item}</SelectItem>)}</SelectContent></Select></div>;
}

function CreateListingDialog() {
  const [open, setOpen] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [optimising, setOptimising] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    form.set("ageConfirmed", String(ageConfirmed));
    try {
      const selected = form.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
      if (selected.length > 4) throw new Error("Choose no more than four photographs.");
      form.delete("photos");
      if (selected.length) setOptimising(true);
      for (const file of selected) form.append("photos", await optimisePhoto(file));
      setOptimising(false);
      const response = await fetch("/api/listings", { method: "POST", body: form });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "AFE could not save that listing.");
      setSuccess(true);
      window.dispatchEvent(new Event("afe-listing-created"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AFE could not save that listing.");
    } finally {
      setOptimising(false);
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) { setError(""); setSuccess(false); setAgeConfirmed(false); } }}>
      <DialogTrigger asChild><Button className="mt-6 h-12 bg-[#08776d] px-6 hover:bg-[#06665e]"><Plus className="size-5" /> List an item</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-[#d5e4e1] sm:max-w-2xl">
        {success ? <div className="py-8 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#dff3ef] text-[#08776d]"><CheckCircle2 className="size-8" /></span><DialogTitle className="mt-5 text-2xl text-[#153c3a]">Listing received safely</DialogTitle><DialogDescription className="mx-auto mt-3 max-w-md text-base leading-6">It is visible to you as “Awaiting review”. AFE will check the public name, wording and photographs before anyone else can see it.</DialogDescription><Button className="mt-6 bg-[#08776d] hover:bg-[#06665e]" onClick={() => setOpen(false)}>Done</Button></div> : <form onSubmit={submit}>
          <DialogHeader><DialogTitle className="text-2xl text-[#153c3a]">Create an AFE listing</DialogTitle><DialogDescription className="text-base leading-6">Your registered AFE username appears automatically. Describe the item honestly. Never include an address, telephone number, email, child’s name, school, diagnosis, medication or private health information.</DialogDescription></DialogHeader>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2"><Label htmlFor="area">Town or general area</Label><Input id="area" name="area" required maxLength={60} placeholder="For example, Manchester" /><p className="text-xs leading-5 text-[#607a77]">Do not enter your street or full postcode. Your registered username is added automatically.</p></div>
            <div className="grid gap-2 sm:col-span-2"><Label htmlFor="title">Item title</Label><Input id="title" name="title" required minLength={5} maxLength={80} placeholder="What are you listing?" /></div>
            <div className="grid gap-2 sm:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" required minLength={20} maxLength={1200} className="min-h-28" placeholder="Condition, size, what is included and anything a family should know." /></div>
            <FieldSelect name="category" label="Category" defaultValue="Sensory" items={["Books", "Toys", "Sensory", "Bikes & outdoors", "Clothing", "Communication", "Learning", "Home & sleep", "Other"]} />
            <FieldSelect name="condition" label="Condition" defaultValue="Good" items={["New", "Excellent", "Good", "Fair", "Pass it on"]} />
            <FieldSelect name="exchangeType" label="Listing type" defaultValue="sell" items={["sell", "giveaway", "swap"]} />
            <div className="grid gap-2"><Label htmlFor="price">Price in pounds</Label><Input id="price" name="price" type="number" min="0.50" max="10000" step="0.01" defaultValue="5.00" /><p className="text-xs leading-5 text-[#607a77]">Ignored for giveaways and swaps.</p></div>
            <FieldSelect name="deliveryMethod" label="Delivery" defaultValue="collection" items={["post", "collection", "either"]} />
            <div className="grid gap-2"><Label htmlFor="postage">Postage charge in pounds</Label><Input id="postage" name="postage" type="number" min="0" max="100" step="0.01" defaultValue="0.00" /><p className="text-xs leading-5 text-[#607a77]">Ignored for collection. Swaps are collection only during testing.</p></div>
            <div className="grid gap-2"><Label htmlFor="photos">Photographs</Label><Input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple /><p className="text-xs leading-5 text-[#607a77]">Up to 4 images. AFE resizes them, reduces the file size and removes hidden location metadata before upload.</p></div>
            <div className="rounded-xl border border-[#c9dbd7] bg-white p-4 sm:col-span-2"><p className="font-bold text-[#153c3a]">Successful sale fee</p><p className="mt-1 text-sm leading-6 text-[#607a77]">Listing is free. If this item sells through AFE, one 50p platform fee is deducted from your proceeds. Stripe’s payment-processing charge also applies. Nothing is charged for an unsold listing.</p></div>
            <div className="flex items-start gap-3 rounded-xl bg-[#edf6f4] p-4 sm:col-span-2"><Checkbox id="listing-age" checked={ageConfirmed} onCheckedChange={(value) => setAgeConfirmed(value === true)} className="mt-0.5 data-[state=checked]:border-[#08776d] data-[state=checked]:bg-[#08776d]" /><Label htmlFor="listing-age" className="text-sm font-medium leading-5 text-[#365c59]">I confirm I am 18 or over, this listing follows AFE’s safety rules, and it contains no private information.</Label></div>
            <div className="flex gap-3 rounded-xl border border-[#d5e4e1] p-4 sm:col-span-2"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#08776d]" /><p className="text-sm leading-6 text-[#607a77]">Every new listing is held for review. Unsafe names, descriptions or photographs are not published.</p></div>
            {error && <p role="alert" className="rounded-xl bg-[#fff0ed] p-3 text-sm font-semibold text-[#9e3529] sm:col-span-2">{error}</p>}
          </div>
          <DialogFooter className="mt-6"><Button type="submit" disabled={!ageConfirmed || submitting} className="w-full bg-[#08776d] hover:bg-[#06665e]">{submitting ? <><Loader2 className="animate-spin" /> {optimising ? "Optimising photographs…" : "Saving securely…"}</> : "Submit for safety review"}</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>
  );
}
