import { motion } from 'framer-motion';

const expertiseAreas = [
  'Industrial Systems Engineering',
  'Civil and Structural Coordination',
  'Construction Supervision',
  'Quality and Compliance Management',
  'Asset Reliability Programs',
  'Operations Readiness and Handover',
];

export const Expertise = () => {
  return (
    <section id="expertise" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Projects and Expertise
        </p>
        <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Core areas where we deliver dependable results
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expertiseAreas.map((item, index) => (
            <motion.div
              key={item}
              className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
