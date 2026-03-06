import { motion } from 'framer-motion';

export const About = () => {
  return (
    <section id="about" className="bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
            About Debo Engineering
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Built on technical discipline and long-term client trust
          </h2>
          <p className="mt-6 text-base leading-8 text-slate-600">
            We combine engineering depth with practical execution. Our teams
            support projects from concept development to delivery and handover,
            ensuring quality, safety, and operational continuity at every stage.
          </p>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Our approach is structured, collaborative, and focused on measurable
            outcomes that align with client timelines and standards.
          </p>
        </motion.div>

        <motion.div
          className="rounded-xl border border-slate-200 bg-slate-50 p-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <img
            src="/debo-logo.png"
            alt="Debo Engineering"
            className="mx-auto h-24 w-auto opacity-90"
          />
          <div className="mt-6 space-y-3 text-sm text-slate-700">
            <p>Integrated engineering planning and delivery support</p>
            <p>Performance-focused project coordination and controls</p>
            <p>Consistent technical quality with client-first execution</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
