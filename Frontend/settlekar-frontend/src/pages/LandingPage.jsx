import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Receipt,
  ArrowLeftRight,
  CreditCard,
  BarChart3,
  Bell,
  FileDown,
  Users,
  PlusCircle,
  Wallet,
  CheckCircle,
  GraduationCap,
  Plane,
  Calendar,
  Heart,
  ArrowRight,
  Sparkles,
  TrendingUp,
  IndianRupee,
  Equal,
  Percent,
  SlidersHorizontal,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Section wrapper (reused)                                           */
/* ------------------------------------------------------------------ */
function Section({ children, id, className = '' }) {
  return (
    <section id={id} className={`px-6 py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mb-14 text-center"
    >
      <h2 className="text-3xl font-bold text-text-primary md:text-4xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-4 max-w-2xl text-text-secondary">{subtitle}</p>}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Navigation Bar                                                  */
/* ------------------------------------------------------------------ */
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-page/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            Settle<span className="text-accent">Kar</span>
          </span>
          <span className="text-[10px] tracking-widest text-text-muted uppercase">
            Expense Management
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-5">
          <a
            href="#features"
            className="hidden text-base font-medium text-text-secondary transition-colors hover:text-text-primary md:inline-block"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hidden text-base font-medium text-text-secondary transition-colors hover:text-text-primary md:inline-block"
          >
            How it Works
          </a>

          <Link
            to="/login"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-card"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-light"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Hero Section                                                    */
/* ------------------------------------------------------------------ */
function HeroMockCard() {
  const items = [
    { label: 'Dinner at Nando\'s', amount: '- ₹1,240', color: 'text-danger' },
    { label: 'Uber to Airport', amount: '- ₹380', color: 'text-danger' },
    { label: 'Settled with Riya', amount: '+ ₹800', color: 'text-success' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
      className="relative hidden lg:block"
    >
      {/* Glow */}
      <div className="absolute -inset-6 rounded-3xl bg-accent/20 blur-3xl" />

      {/* Card */}
      <div className="relative w-[370px] rounded-2xl border border-border bg-bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Group Balance</p>
            <p className="text-2xl font-bold text-text-primary">₹4,620</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
            <TrendingUp size={12} /> +12%
          </span>
        </div>

        {/* Mini bar */}
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
          <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-accent to-accent-light" />
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg bg-bg-elevated/60 px-4 py-3"
            >
              <span className="text-sm text-text-secondary">{item.label}</span>
              <span className={`text-sm font-semibold ${item.color}`}>{item.amount}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-5 flex items-center gap-2">
          <div className="flex -space-x-2">
            {['bg-accent', 'bg-success', 'bg-warning', 'bg-danger'].map((bg, i) => (
              <div
                key={i}
                className={`h-7 w-7 rounded-full border-2 border-bg-card ${bg} flex items-center justify-center text-[10px] font-bold text-white`}
              >
                {['A', 'R', 'S', 'M'][i]}
              </div>
            ))}
          </div>
          <span className="text-xs text-text-muted">4 members</span>
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <Section className="relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center gap-12 lg:flex-row lg:justify-between">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl text-center lg:text-left"
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-xs font-medium text-accent-light">
            <Sparkles size={14} /> Smart Expense Management
          </span>
          <h1 className="mt-4 text-4xl leading-tight font-extrabold text-text-primary sm:text-5xl md:text-6xl">
            Split Expenses.{' '}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              Settle Smarter.
            </span>
          </h1>
          <p className="mt-6 text-lg text-text-secondary">
            The smartest way to split bills, track expenses, and settle debts with friends,
            roommates, and travel buddies.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03] hover:bg-accent-light"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>
            <button
              onClick={() =>
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-card px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated"
            >
              See How it Works
            </button>
          </div>
        </motion.div>

        {/* Mock card */}
        <HeroMockCard />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Problem Statement Banner                                        */
/* ------------------------------------------------------------------ */
function ProblemBanner() {
  const pains = [
    'Tired of manual Excel sheets?',
    'Chasing friends on WhatsApp for money?',
    'Confused about who owes whom?',
  ];
  return (
    <Section className="bg-bg-sidebar">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 md:grid-cols-3"
      >
        {pains.map((text) => (
          <motion.div
            key={text}
            variants={fadeUp}
            className="rounded-xl border border-border bg-bg-card px-6 py-8 text-center"
          >
            <p className="text-lg font-semibold text-text-primary">{text}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-10 text-center text-xl font-bold text-accent-light"
      >
        We solve all of this &mdash; automatically.
      </motion.p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Key Features Section                                            */
/* ------------------------------------------------------------------ */
function Features() {
  const features = [
    {
      icon: Receipt,
      title: 'Smart Expense Splitting',
      desc: 'Split bills equally, by percentage, or custom amounts with a single tap.',
    },
    {
      icon: ArrowLeftRight,
      title: 'Min-Transaction Settlement',
      desc: 'Our algorithm minimises the number of transactions needed to settle all debts.',
    },
    {
      icon: CreditCard,
      title: 'Pay Directly via Razorpay',
      desc: 'Settle up instantly in-app using UPI, cards, or net banking.',
    },
    {
      icon: BarChart3,
      title: 'Visual Debt Graphs',
      desc: 'Interactive charts to visualise balances, spending patterns, and contributions.',
    },
    {
      icon: Bell,
      title: 'Instant Notifications',
      desc: 'Get notified when expenses are added or when someone settles a debt.',
    },
    {
      icon: FileDown,
      title: 'Export Ledger as CSV',
      desc: 'Download your full expense history for record-keeping or tax purposes.',
    },
  ];

  return (
    <Section id="features">
      <SectionTitle
        title="Everything you need to manage shared expenses"
        subtitle="Powerful features designed to make group finances effortless."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={fadeUp}
            className="group rounded-xl border border-border bg-bg-card p-6 transition-colors hover:border-accent/30 hover:bg-bg-elevated"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
              <Icon size={24} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
            <p className="text-sm leading-relaxed text-text-secondary">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  5. How It Works                                                    */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  const steps = [
    {
      icon: Users,
      title: 'Create a Group',
      desc: 'Add your friends, roommates, or travel buddies.',
    },
    {
      icon: PlusCircle,
      title: 'Log Expenses',
      desc: 'Split equally, by percentage, or custom amounts.',
    },
    {
      icon: Wallet,
      title: 'View Balances',
      desc: 'See who owes whom in real-time.',
    },
    {
      icon: CheckCircle,
      title: 'Settle Up',
      desc: 'Pay directly in-app via Razorpay.',
    },
  ];

  return (
    <Section id="how-it-works" className="bg-bg-sidebar">
      <SectionTitle title="How SettleKar Works" subtitle="Four simple steps to stress-free expense sharing." />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Dashed connector (desktop only) */}
        <div className="pointer-events-none absolute top-14 left-[12.5%] right-[12.5%] hidden h-px border-t-2 border-dashed border-accent/30 lg:block" />

        {steps.map(({ icon: Icon, title, desc }, i) => (
          <motion.div key={title} variants={fadeUp} className="relative flex flex-col items-center text-center">
            {/* Circle with step number */}
            <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/25">
              <Icon size={24} />
            </div>
            <span className="mb-1 text-xs font-bold tracking-widest text-accent-light uppercase">
              Step {i + 1}
            </span>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  6. Split Types                                                     */
/* ------------------------------------------------------------------ */
function SplitTypes() {
  const types = [
    {
      icon: Equal,
      title: 'Equal',
      desc: 'Divided automatically among all members.',
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: Percent,
      title: 'Percentage',
      desc: 'You decide the share for each person.',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      icon: SlidersHorizontal,
      title: 'Custom',
      desc: 'Set exact amounts per person.',
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  return (
    <Section>
      <SectionTitle title="Flexible Splitting Options" subtitle="Choose the method that fits your situation." />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 md:grid-cols-3"
      >
        {types.map(({ icon: Icon, title, desc, color, bg }) => (
          <motion.div
            key={title}
            variants={scaleIn}
            className="rounded-xl border border-border bg-bg-card p-8 text-center transition-colors hover:border-accent/20"
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${bg} ${color}`}
            >
              <Icon size={26} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  7. Use Cases                                                       */
/* ------------------------------------------------------------------ */
function UseCases() {
  const cases = [
    {
      icon: GraduationCap,
      title: 'College Students & Roommates',
      desc: 'Split rent, groceries, and late-night snacks without awkward conversations.',
    },
    {
      icon: Plane,
      title: 'Travel Groups',
      desc: 'Track every expense from flights to food on your next trip.',
    },
    {
      icon: Calendar,
      title: 'Event Organizers',
      desc: 'Manage budgets for parties, reunions, and team outings.',
    },
    {
      icon: Heart,
      title: 'Friends & Family',
      desc: 'Keep personal relationships healthy by keeping finances transparent.',
    },
  ];

  return (
    <Section className="bg-bg-sidebar">
      <SectionTitle title="Built for Everyone" subtitle="No matter how you share expenses, we have you covered." />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {cases.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={fadeUp}
            className="rounded-xl border border-border bg-bg-card p-6 text-center transition-colors hover:border-accent/20"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon size={24} />
            </div>
            <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  8. Stats Bar                                                       */
/* ------------------------------------------------------------------ */
function StatsBar() {
  const stats = [
    { value: '500+', label: 'Groups Created' },
    { value: '\u20B92L+', label: 'Settled' },
    { value: '98%', label: 'User Satisfaction' },
  ];

  return (
    <Section>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-8 rounded-2xl border border-border bg-gradient-to-r from-bg-card to-bg-elevated p-10 md:grid-cols-3"
      >
        {stats.map(({ value, label }) => (
          <motion.div key={label} variants={fadeUp} className="text-center">
            <p className="text-4xl font-extrabold text-accent">{value}</p>
            <p className="mt-1 text-sm text-text-secondary">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  9. Settlement Optimization                                         */
/* ------------------------------------------------------------------ */
function PersonCircle({ name, className = '' }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated text-xs font-bold text-text-primary ring-2 ring-border ${className}`}
    >
      {name}
    </div>
  );
}

function SettlementOptimization() {
  return (
    <Section className="bg-bg-sidebar">
      <SectionTitle
        title="Smart Settlement Algorithm"
        subtitle="Our min-cash-flow algorithm reduces the number of transactions needed so everyone settles up faster."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-10 lg:grid-cols-2"
      >
        {/* Before */}
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-bg-card p-8">
          <h4 className="mb-6 text-center text-sm font-bold tracking-widest text-danger uppercase">
            Before &mdash; 6 Transactions
          </h4>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-6">
              <PersonCircle name="A" />
              <PersonCircle name="B" />
              <PersonCircle name="C" />
              <PersonCircle name="D" />
            </div>
            <div className="grid w-full grid-cols-2 gap-2 text-xs text-text-secondary sm:grid-cols-3">
              {['A \u2192 B (\u20B9300)', 'A \u2192 C (\u20B9200)', 'B \u2192 D (\u20B9400)', 'C \u2192 A (\u20B9100)', 'D \u2192 B (\u20B9150)', 'C \u2192 D (\u20B9250)'].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-md bg-danger/10 px-3 py-2 text-center font-medium text-danger"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>
        </motion.div>

        {/* After */}
        <motion.div variants={fadeUp} className="rounded-xl border border-accent/30 bg-bg-card p-8">
          <h4 className="mb-6 text-center text-sm font-bold tracking-widest text-success uppercase">
            After &mdash; 3 Transactions
          </h4>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-6">
              <PersonCircle name="A" className="ring-success" />
              <PersonCircle name="B" className="ring-success" />
              <PersonCircle name="C" className="ring-success" />
              <PersonCircle name="D" className="ring-success" />
            </div>
            <div className="grid w-full grid-cols-3 gap-2 text-xs text-text-secondary">
              {['A \u2192 B (\u20B9200)', 'A \u2192 D (\u20B9200)', 'C \u2192 D (\u20B9250)'].map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-success/10 px-3 py-2 text-center font-medium text-success"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  10. Final CTA                                                      */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  return (
    <Section>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card p-12 text-center md:p-20"
      >
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[100px]" />
        </div>

        <div className="relative">
          <h2 className="text-3xl font-extrabold text-text-primary md:text-5xl">
            Ready to split smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-text-secondary">
            Join hundreds of users who&apos;ve simplified their expense management.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03] hover:bg-accent-light"
          >
            Sign Up for Free <ArrowRight size={18} />
          </Link>
          <p className="mt-4 text-xs text-text-muted">No credit card required</p>
        </div>
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  11. Footer                                                         */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-border bg-bg-sidebar px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 md:flex-row md:justify-between">
        {/* Logo + tagline */}
        <div className="text-center md:text-left">
          <span className="text-lg font-bold text-text-primary">
            Settle<span className="text-accent">Kar</span>
          </span>
          <p className="mt-1 text-xs text-text-muted">
            Split expenses. Stay friends.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-6 text-sm text-text-secondary">
          <a href="#" className="transition-colors hover:text-text-primary">Privacy Policy</a>
          <a href="#" className="transition-colors hover:text-text-primary">Terms of Use</a>
          <a href="#" className="transition-colors hover:text-text-primary">Contact</a>
        </div>

        {/* Credit */}
        <p className="text-xs text-text-muted">
          Built with <span className="text-danger">&hearts;</span> for hackathon
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing Page (composed)                                            */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-page font-sans">
      <Navbar />
      <Hero />
      <ProblemBanner />
      <Features />
      <HowItWorks />
      <SplitTypes />
      <UseCases />
      <StatsBar />
      <SettlementOptimization />
      <FinalCTA />
      <Footer />
    </div>
  );
}
