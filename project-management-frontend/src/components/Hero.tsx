import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white pt-28 pb-20"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-120px] h-[280px] w-[640px] -translate-x-1/2 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center lg:px-8">
        <motion.img
          src="/debo-logo.png"
          alt="Debo Engineering logo"
          className="mb-8 h-24 w-auto sm:h-28"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />

        <motion.p
          className="mb-4 text-xs font-semibold tracking-[0.3em] text-cyan-800 sm:text-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          IN PURSUIT OF SERVICE
        </motion.p>

        <motion.h1
          className="max-w-4xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
        >
          Engineering Excellence Built for Reliable Delivery
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
        >
          Debo Engineering partners with organizations to deliver practical,
          high-quality engineering outcomes across planning, execution, and
          long-term operations.
        </motion.p>

        <motion.a
          href="#contact"
          className="mt-10 rounded-md bg-cyan-700 px-8 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.45 }}
        >
          Contact Us
        </motion.a>
      </div>
    </section>
  );
};
