import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Noise texture overlay ─── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* ─── Gradient blobs ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "hsl(217 91% 60%)" }}
        />
        <div
          className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: "hsl(262 80% 65%)" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-10 blur-[90px]"
          style={{ background: "hsl(187 100% 50%)" }}
        />
      </div>

      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <header className="z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-20 group-hover:opacity-30 transition-opacity blur-sm" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 6h18M3 12h12M3 18h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="19" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <span
              className="text-xl font-black tracking-tight"
              style={{ fontFamily: "'DM Sans', 'Cabinet Grotesk', sans-serif", letterSpacing: "-0.04em" }}
            >
              QMaster
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { name: "Features", href: "#features" },
              { name: "How it works", href: "#how-it-works" },
              { name: "Testimonials", href: "#testimonials" }, 
              { name: "Pricing", href: "#pricing" }, 
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <AuthButton />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative z-10 pt-24 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Badge
            variant="outline"
            className="mb-6 border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-semibold tracking-widest uppercase px-4 py-1.5"
          >
            Queue management, simplified
          </Badge>

          <h1
            className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.04em" }}
          >
            Your queue.
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Your rules.
              </span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Give your customers a frictionless waiting experience. QMaster lets business owners spin up smart queues —
            temporary or permanent — with scheduling and guest reservations built in.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/sign-up">
              <Button
                size="lg" 
                className="h-12 px-8 text-base font-semibold cursor-pointer bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/25 transition-all duration-200"
              >
                Start for free
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base font-semibold cursor-pointer border-border/60 hover:bg-muted/50"
            >
              See demo
            </Button>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-muted-foreground">
            Trusted by <span className="text-foreground font-semibold">500+</span> businesses · No credit card required
          </p>
        </div>

        {/* ─── Hero visual: queue card mockup ─── */}
        <div className="relative z-10 max-w-3xl mx-auto mt-20">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-3xl blur-2xl scale-105" />

            {/* Main card */}
            <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Faux window chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40 bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted/60 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    qmaster.app / dashboard
                  </div>
                </div>
              </div>

              {/* Queue UI mockup */}
              <div className="p-6 grid grid-cols-3 gap-4">
                {/* Queue list */}
                <div className="col-span-2 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">Morning Queue · Barbershop</h3>
                    <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px] font-semibold">
                      LIVE
                    </Badge>
                  </div>

                  {[
                    { num: 1, name: "Marko Horvat", wait: "Now serving", active: true },
                    { num: 2, name: "Ana Kovač", wait: "~8 min", active: false },
                    { num: 3, name: "Guest #331", wait: "~16 min", active: false },
                    { num: 4, name: "Luka Perić", wait: "~24 min", active: false },
                  ].map((person) => (
                    <div
                      key={person.num}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                        person.active
                          ? "bg-blue-500/10 border border-blue-500/30"
                          : "bg-muted/30 border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          person.active
                            ? "bg-blue-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {person.num}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${person.active ? "text-blue-400" : ""}`}>
                          {person.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{person.wait}</p>
                      </div>
                      {person.active && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-0 text-[10px]">Serving</Badge>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats sidebar */}
                <div className="space-y-3">
                  {[
                    { label: "In queue", value: "4" },
                    { label: "Served today", value: "23" },
                    { label: "Avg wait", value: "9m" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-muted/40 border border-border/40 p-4 text-center">
                      <p className="text-2xl font-black">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                  <Button size="sm" className="w-full h-9 text-xs bg-blue-500 hover:bg-blue-600 border-0">
                    Call next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6 border-t border-border/30" id="features"> 
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">Everything you need</p>
            <h2
              className="text-4xl md:text-5xl font-black tracking-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Built for real businesses
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: "blue",
                title: "Temporary queues",
                desc: "Spin up a live queue in seconds for walk-in events, pop-ups, or one-off services. Share a link and you're done.",
              },
              {
                icon: (
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                color: "violet",
                title: "Scheduled queues",
                desc: "Set recurring queues with opening hours, capacity limits, and automatic resets. Perfect for daily operations.",
              },
              {
                icon: (
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                  </svg>
                ),
                color: "cyan",
                title: "Guest reservations",
                desc: "Customers join your queue without an account. Collect a name, number, or any info you need — fully customisable.",
              },
              {
                icon: (
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                color: "blue",
                title: "Live notifications",
                desc: "SMS or in-app alerts keep customers updated on their position so they don't have to stand and wait.",
              },
              {
                icon: (
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                color: "violet",
                title: "Analytics dashboard",
                desc: "Track peak hours, average wait times, and no-show rates to optimise your workflow every single day.",
              },
              {
                icon: (
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                color: "cyan",
                title: "Mobile-first",
                desc: "Manage your queue from anywhere. The operator dashboard is fully responsive — phone, tablet, or desktop.",
              },
            ].map((feature) => {
              const colorMap: Record<string, string> = {
                blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
                violet: "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400",
                cyan: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
              };
              const classes = colorMap[feature.color];
              return (
                <Card
                  key={feature.title}
                  className="group bg-card/60 border-border/40 hover:border-border hover:bg-card/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${classes} border flex items-center justify-center mb-5`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-base mb-2 tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6 border-t border-border/30" id="how-it-works">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">How it works</p>
            <h2
              className="text-4xl md:text-5xl font-black tracking-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Up and running in minutes
            </h2>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[27px] top-12 bottom-12 w-px bg-gradient-to-b from-blue-500/50 via-violet-500/50 to-cyan-500/50 hidden md:block" />

            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Create your business profile",
                  desc: "Sign up and configure your business — name, category, operating hours. Takes about two minutes.",
                  color: "bg-blue-500",
                },
                {
                  step: "02",
                  title: "Set up your queue type",
                  desc: "Choose a temporary queue for today, or a permanent queue with a recurring schedule. Customise capacity, fields, and messages.",
                  color: "bg-violet-500",
                },
                {
                  step: "03",
                  title: "Share the link",
                  desc: "Every queue gets a unique URL and QR code. Place it at your entrance, on your website, or send it directly to customers.",
                  color: "bg-cyan-500",
                },
                {
                  step: "04",
                  title: "Manage in real time",
                  desc: "Call the next customer, skip, remove, or add notes — all from your dashboard. Customers get notified automatically.",
                  color: "bg-blue-500",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div
                    className={`relative z-10 w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                  >
                    <span className="text-white font-black text-sm">{item.step}</span>
                  </div>
                  <div className="pt-3.5">
                    <h3 className="font-bold text-lg mb-1.5 tracking-tight">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SOCIAL PROOF
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-6 border-t border-border/30" id="testimonials">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: "We went from a chaotic waiting room to zero complaints in a week. QMaster just works.",
                name: "Ivan Blažić",
                role: "Owner, Barbershop Zen",
              },
              {
                quote: "The scheduled queue feature is perfect for our clinic. Patients love knowing their exact slot.",
                name: "Dr. Petra Novak",
                role: "GP, Ordinacija Novak",
              },
              {
                quote: "Set it up in 10 minutes. My staff spends less time at the door and more time with customers.",
                name: "Maja Šimić",
                role: "Manager, Salon Luxe",
              },
            ].map((t) => (
              <Card key={t.name} className="bg-card/60 border-border/40">
                <CardContent className="pt-6 pb-6 px-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
        PRICING
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6 border-t border-border/30" id="pricing">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* FREE */}
          <div className="relative rounded-3xl border border-border/40 bg-card/70 backdrop-blur-xl p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-3xl blur-2xl" />
            
            <div className="relative">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">Perfect to get started</p>

              <div className="text-4xl font-black mb-6">€0</div>

              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li>• 1 active queue</li>
                <li>• 20 daily tickets</li>
              </ul>

              <Button className="w-full h-11 font-semibold cursor-pointer bg-gradient-to-r from-blue-300 to-violet-400 hover:from-blue-400 hover:to-violet-500 border-0 shadow-lg shadow-blue-500/25">
                Start free
              </Button>
            </div>
          </div>

          {/* BASIC */}
          <div className="relative rounded-3xl border border-border/40 bg-card/70 backdrop-blur-xl p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-3xl blur-2xl" />

            {/* Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              Most popular
            </div>
            
            <div className="relative">
              <h3 className="text-xl font-semibold mb-2">Basic</h3>
              <p className="text-muted-foreground mb-6">For growing businesses</p>

              <div className="text-4xl font-black mb-6">
                €9<span className="text-base font-medium">/mo</span>
              </div>

              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li>• 5 active queues</li>
                <li>• 250 daily tickets</li>
              </ul>

              <Button
                className="w-full h-11 font-semibold cursor-pointer bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/25"
              >
                Get Basic
              </Button>
            </div>
          </div>

          {/* PRO */}
          <div className="relative rounded-3xl border border-border/40 bg-card/70 backdrop-blur-xl p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-3xl blur-2xl" />
            
            <div className="relative">
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">For enterprises</p>

              <div className="text-4xl font-black mb-6">
                €29<span className="text-base font-medium">/mo</span>
              </div>

              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li>• <b>Unlimited</b> active queues</li>
                <li>• <b>Unlimited</b> daily tickets</li>
              </ul>

              <Button className="w-full h-11 font-semibold cursor-pointer bg-gradient-to-r from-blue-300 to-violet-400 hover:from-blue-400 hover:to-violet-500 border-0 shadow-lg shadow-blue-500/25">
                Go Pro
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6 border-t border-border/30">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-violet-500/30 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl border border-border/40 bg-card/70 backdrop-blur-xl px-12 py-14">
              <h2
                className="text-4xl md:text-5xl font-black tracking-tight mb-4"
                style={{ letterSpacing: "-0.03em" }}
              >
                Ready to master
                <br />
                your queue?
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Join hundreds of businesses already running smarter queues with QMaster. Free plan available.
              </p>
              <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="h-12 px-10 text-base cursor-pointer font-semibold bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/25"
              >
                Get started free
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-border/30 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M3 6h18M3 12h12M3 18h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="19" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">QMaster</span>
          </div>
          <p>© 2026 QMaster. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <Link key={l} href="#" className="hover:text-foreground transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}