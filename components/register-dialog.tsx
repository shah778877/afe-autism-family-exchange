"use client";

import { BadgeCheck, Database, Loader2, LockKeyhole, TriangleAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccountProfile = { username?: string; firstName?: string; surname?: string; dateOfBirth?: string; phone?: string; email?: string; registrationComplete?: boolean; isAdmin?: boolean };

export function RegisterDialog({ hero = false }: { hero?: boolean }) {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [medicalConfirmed, setMedicalConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/profile", { cache: "no-store" }).then(async (response) => {
      if (!active) return;
      if (response.status === 401) { setSignedIn(false); return; }
      const data = await response.json() as { profile?: AccountProfile };
      if (response.ok) { setProfile(data.profile ?? {}); setSignedIn(true); }
      else setSignedIn(false);
    }).catch(() => { if (active) setSignedIn(false); });
    return () => { active = false; };
  }, []);

  async function load(open: boolean) {
    if (!open) { setError(""); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      const data = await response.json() as { profile?: AccountProfile; error?: string };
      if (response.status === 401) { setSignedIn(false); return; }
      if (!response.ok) throw new Error(data.error ?? "AFE could not load your account.");
      setSignedIn(true);
      setProfile(data.profile ?? {});
      setAgeConfirmed(Boolean(data.profile?.registrationComplete));
      setMedicalConfirmed(Boolean(data.profile?.registrationComplete));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "AFE could not load your account."); }
    finally { setLoading(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, ageConfirmed, medicalConfirmed }) });
      const data = await response.json() as { profile?: AccountProfile; error?: string };
      if (!response.ok) throw new Error(data.error ?? "AFE could not save your account.");
      setProfile(data.profile ?? null); setSignedIn(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "AFE could not save your account."); }
    finally { setSaving(false); }
  }

  const complete = profile?.registrationComplete;
  const buttonClass = hero ? "h-12 bg-[#f3a34d] px-6 text-[#213f3c] hover:bg-[#ffc06f]" : "bg-[#08776d] hover:bg-[#06665e]";
  if (signedIn === false) return <Button asChild size={hero ? "lg" : "default"} className={buttonClass}><a href="/signin-with-chatgpt?return_to=%2F">Sign in to AFE</a></Button>;
  return <Dialog onOpenChange={(open) => void load(open)}>
    <DialogTrigger asChild><Button disabled={signedIn === null} size={hero ? "lg" : "default"} className={buttonClass}>{signedIn === null ? "Checking account…" : complete ? "My AFE account" : "Create account"}</Button></DialogTrigger>
    <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-[#d5e4e1] sm:max-w-2xl">
      {loading ? <div className="grid min-h-52 place-items-center"><Loader2 className="size-8 animate-spin text-[#08776d]" /><span className="sr-only">Loading account</span></div> : complete ? <div className="py-4"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#dff3ef] text-[#08776d]"><BadgeCheck className="size-8" /></span><DialogTitle className="mt-5 text-center text-2xl text-[#153c3a]">Your AFE account is stored</DialogTitle><DialogDescription className="mt-2 text-center text-base">Only your username is public. The other details are private.</DialogDescription><div className="mt-6 grid gap-3 rounded-2xl bg-[#edf6f4] p-5 text-sm"><p><strong>Username:</strong> {profile.username}</p><p><strong>Name:</strong> {profile.firstName} {profile.surname}</p><p><strong>Date of birth:</strong> {profile.dateOfBirth}</p><p><strong>Telephone:</strong> {profile.phone}</p><p><strong>Email:</strong> {profile.email}</p></div><div className="mt-4 flex gap-3 rounded-xl border border-[#d5e4e1] p-4"><Database className="mt-0.5 size-5 shrink-0 text-[#08776d]" /><p className="text-sm leading-6 text-[#607a77]">Stored in AFE’s protected account database and linked to your signed-in user ID. No home address, medical information, password, card number or bank details are stored here.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{profile.isAdmin && <Button asChild className="bg-[#08776d] hover:bg-[#06665e]"><a href="/admin">Open AFE Admin</a></Button>}<Button asChild variant="outline" className="border-[#b9d3ce] text-[#086b63]"><a href="/signout-with-chatgpt?return_to=%2F">Sign out of AFE</a></Button></div></div> : <form onSubmit={save}><DialogHeader><DialogTitle className="text-2xl text-[#153c3a]">Create your AFE account</DialogTitle><DialogDescription className="text-base leading-6">Adults aged 18 or over only. Your username is public; every other field below is private.</DialogDescription></DialogHeader><div className="grid gap-4 py-3 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2"><Label htmlFor="username">Username</Label><Input id="username" name="username" required minLength={2} maxLength={40} defaultValue={profile?.username} placeholder="Your public AFE username" /><p className="text-xs text-[#607a77]">Harmful or degrading usernames are blocked.</p></div>
        <div className="grid gap-2"><Label htmlFor="first-name">First name</Label><Input id="first-name" name="firstName" required autoComplete="given-name" defaultValue={profile?.firstName} /></div><div className="grid gap-2"><Label htmlFor="surname">Surname</Label><Input id="surname" name="surname" required autoComplete="family-name" defaultValue={profile?.surname} /></div>
        <div className="grid gap-2"><Label htmlFor="dob">Date of birth</Label><Input id="dob" name="dateOfBirth" required type="date" autoComplete="bday" defaultValue={profile?.dateOfBirth} /><p className="text-xs text-[#607a77]">Used privately to confirm you are 18+.</p></div><div className="grid gap-2"><Label htmlFor="phone">Telephone number</Label><Input id="phone" name="phone" required type="tel" autoComplete="tel" defaultValue={profile?.phone} /></div>
        <div className="grid gap-2 sm:col-span-2"><Label htmlFor="email">Verified email address</Label><Input id="email" value={profile?.email ?? "Taken securely from your sign-in"} readOnly className="bg-[#f2f6f5]" /><p className="text-xs text-[#607a77]">AFE uses the verified email from your secure sign-in; it is never public.</p></div>
        <div className="flex gap-3 rounded-xl border border-[#efc7bd] bg-[#fff3f0] p-4 sm:col-span-2"><TriangleAlert className="mt-0.5 size-5 shrink-0 text-[#b13d2f]" /><div><p className="font-bold text-[#8d3025]">AFE is not a medical service.</p><p className="mt-1 text-sm leading-6 text-[#76514b]">Do not upload diagnoses, medication, medical records, treatment advice or private health information about yourself or a child.</p></div></div>
        <div className="flex items-start gap-3 rounded-xl bg-[#edf6f4] p-4 sm:col-span-2"><Checkbox id="age" checked={ageConfirmed} onCheckedChange={(value) => setAgeConfirmed(value === true)} className="mt-0.5" /><Label htmlFor="age" className="text-sm leading-5">I confirm that I am 18 or over and agree to follow AFE’s safety rules.</Label></div><div className="flex items-start gap-3 rounded-xl bg-[#edf6f4] p-4 sm:col-span-2"><Checkbox id="medical-rule" checked={medicalConfirmed} onCheckedChange={(value) => setMedicalConfirmed(value === true)} className="mt-0.5" /><Label htmlFor="medical-rule" className="text-sm leading-5">I understand that AFE is not for medical advice or medical-record sharing.</Label></div>
        <div className="flex gap-3 rounded-xl border border-[#d5e4e1] p-4 sm:col-span-2"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#08776d]" /><p className="text-sm leading-6 text-[#607a77]">AFE stores no home address during registration. A delivery address is requested only when buying an item for postage.</p></div>{error && <p role="alert" className="rounded-xl bg-[#fff0ed] p-3 text-sm font-semibold text-[#9e3529] sm:col-span-2">{error}</p>}
      </div><DialogFooter><Button type="submit" disabled={!ageConfirmed || !medicalConfirmed || saving} className="w-full bg-[#08776d] hover:bg-[#06665e]">{saving ? <><Loader2 className="animate-spin" /> Saving securely…</> : "Create secure AFE account"}</Button></DialogFooter></form>}
    </DialogContent>
  </Dialog>;
}
