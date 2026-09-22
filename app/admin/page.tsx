import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ArrowLeft, ListChecks, MessageSquareText, ShieldCheck, Users } from "lucide-react";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { listings, profiles, supportMessages } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const db = getDb();
  const [admin] = await db.select({ role: profiles.role, status: profiles.accountStatus }).from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
  if (admin?.role !== "admin" || admin.status !== "active") redirect("/");

  const [accounts, adverts, messages] = await Promise.all([
    db.select().from(profiles).orderBy(desc(profiles.createdAt)).limit(500),
    db.select().from(listings).orderBy(desc(listings.createdAt)).limit(500),
    db.select({ id: supportMessages.id, category: supportMessages.category, subject: supportMessages.subject, message: supportMessages.message, status: supportMessages.status, createdAt: supportMessages.createdAt, username: profiles.displayName, email: profiles.email })
      .from(supportMessages).innerJoin(profiles, eq(supportMessages.userId, profiles.userId)).orderBy(desc(supportMessages.createdAt)).limit(500),
  ]);

  const cards = [
    { label: "Registered accounts", value: accounts.length, icon: Users },
    { label: "Listings", value: adverts.length, icon: ListChecks },
    { label: "Admin messages", value: messages.length, icon: MessageSquareText },
  ];

  return <main className="min-h-screen bg-[#f3f8f7] px-4 py-8 text-[#153c3a] sm:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#08776d]"><ShieldCheck className="size-5" /> Owner-only area</span><h1 className="mt-2 text-4xl font-extrabold tracking-tight">AFE Admin</h1><p className="mt-2 text-[#607a77]">Private back office for accounts, listings and member messages.</p></div><div className="flex gap-2"><a href="/" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#b9d3ce] bg-white px-4 font-bold text-[#086b63]"><ArrowLeft className="size-4" /> Website</a><a href="/signout-with-chatgpt?return_to=%2F" className="inline-flex h-11 items-center rounded-xl bg-[#123f3b] px-4 font-bold text-white">Sign out</a></div></div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#d9e6e3] bg-white p-6 shadow-sm"><Icon className="size-6 text-[#08776d]" /><strong className="mt-4 block text-3xl">{value}</strong><span className="text-sm text-[#607a77]">{label}</span></div>)}</div>

      <section className="mt-8 rounded-2xl border border-[#d9e6e3] bg-white p-5 shadow-sm"><h2 className="text-2xl font-bold">Registered accounts</h2><p className="mt-1 text-sm text-[#607a77]">Private information—owner access only. Never export or share without a lawful reason.</p><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b bg-[#edf6f4] text-xs uppercase tracking-wide"><tr>{["Username", "Name", "Email", "Telephone", "Date of birth", "Status", "Joined"].map(item => <th key={item} className="px-3 py-3">{item}</th>)}</tr></thead><tbody>{accounts.map(account => <tr key={account.userId} className="border-b border-[#edf2f1]"><td className="px-3 py-3 font-bold">{account.displayName}</td><td className="px-3 py-3">{account.firstName} {account.surname}</td><td className="px-3 py-3">{account.email}</td><td className="px-3 py-3">{account.phone || "—"}</td><td className="px-3 py-3">{account.dateOfBirth || "—"}</td><td className="px-3 py-3 capitalize">{account.accountStatus}</td><td className="px-3 py-3">{account.createdAt}</td></tr>)}</tbody></table></div></section>

      <section className="mt-8 rounded-2xl border border-[#d9e6e3] bg-white p-5 shadow-sm"><h2 className="text-2xl font-bold">Listings</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b bg-[#edf6f4] text-xs uppercase tracking-wide"><tr>{["ID", "Seller", "Item", "Type", "Area", "Review", "Status", "Created"].map(item => <th key={item} className="px-3 py-3">{item}</th>)}</tr></thead><tbody>{adverts.map(item => <tr key={item.id} className="border-b border-[#edf2f1]"><td className="px-3 py-3">#{item.id}</td><td className="px-3 py-3 font-bold">{item.sellerDisplayName}</td><td className="px-3 py-3">{item.title}</td><td className="px-3 py-3 capitalize">{item.exchangeType}</td><td className="px-3 py-3">{item.area}</td><td className="px-3 py-3 capitalize">{item.moderationStatus}</td><td className="px-3 py-3 capitalize">{item.listingStatus}</td><td className="px-3 py-3">{item.createdAt}</td></tr>)}</tbody></table></div></section>

      <section className="mt-8 rounded-2xl border border-[#d9e6e3] bg-white p-5 shadow-sm"><h2 className="text-2xl font-bold">Comments, complaints and messages</h2><div className="mt-5 grid gap-4">{messages.length ? messages.map(item => <article key={item.id} className="rounded-xl border border-[#d9e6e3] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="rounded-full bg-[#edf6f4] px-2.5 py-1 text-xs font-bold text-[#08776d]">{item.category}</span><h3 className="mt-2 font-bold">{item.subject}</h3></div><span className="text-xs text-[#607a77]">{item.createdAt}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#365c59]">{item.message}</p><p className="mt-3 text-xs text-[#607a77]">From <strong>{item.username}</strong> · {item.email} · Status: {item.status}</p></article>) : <p className="rounded-xl bg-[#edf6f4] p-4 text-sm text-[#607a77]">No messages yet.</p>}</div></section>
    </div>
  </main>;
}
