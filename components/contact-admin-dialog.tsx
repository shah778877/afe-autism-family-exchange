"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, MessageSquareText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ContactAdminDialog() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/support-messages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
      const data = await response.json() as { error?: string };
      if (response.status === 401) { window.location.href = "/signin-with-chatgpt?return_to=%2F%23contact-afe"; return; }
      if (!response.ok) throw new Error(data.error ?? "AFE could not send your message.");
      setSent(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "AFE could not send your message."); }
    finally { setSending(false); }
  }

  return <Dialog onOpenChange={(open) => { if (!open) { setError(""); setSent(false); } }}>
    <DialogTrigger asChild><Button size="lg" className="h-12 bg-[#08776d] px-6 hover:bg-[#06665e]"><MessageSquareText /> Contact AFE Admin</Button></DialogTrigger>
    <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-[#d5e4e1] sm:max-w-xl">
      {sent ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto size-14 text-[#08776d]" /><DialogTitle className="mt-4 text-2xl">Message sent privately</DialogTitle><DialogDescription className="mt-2 text-base">AFE Admin can now see it in the secure back office.</DialogDescription></div> : <form onSubmit={submit}>
        <DialogHeader><DialogTitle className="text-2xl">Message AFE Admin</DialogTitle><DialogDescription className="text-base leading-6">Send a comment, complaint, safety concern or account question. You must be signed in so we can respond securely.</DialogDescription></DialogHeader>
        <div className="mt-5 grid gap-4"><div className="grid gap-2"><Label>Message type</Label><Select name="category" defaultValue="General comment"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["General comment", "Complaint", "Safety concern", "Account help", "Other"].map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label htmlFor="support-subject">Subject</Label><Input id="support-subject" name="subject" required minLength={3} maxLength={100} /></div><div className="grid gap-2"><Label htmlFor="support-message">Message</Label><Textarea id="support-message" name="message" required minLength={10} maxLength={2000} className="min-h-36" /></div><div className="flex gap-3 rounded-xl bg-[#fff3f0] p-4 text-sm leading-6 text-[#76514b]"><ShieldAlert className="mt-0.5 size-5 shrink-0 text-[#b13d2f]" /><p>Do not include medical records, card details, passwords or a child’s private information. If anyone is in immediate danger, call 999.</p></div>{error && <p role="alert" className="rounded-xl bg-[#fff0ed] p-3 text-sm font-semibold text-[#9e3529]">{error}</p>}</div>
        <DialogFooter className="mt-5"><Button type="submit" disabled={sending} className="w-full bg-[#08776d] hover:bg-[#06665e]">{sending ? <><Loader2 className="animate-spin" /> Sending…</> : "Send privately to AFE Admin"}</Button></DialogFooter>
      </form>}
    </DialogContent>
  </Dialog>;
}
