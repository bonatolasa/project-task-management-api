import {
  BriefcaseBusiness,
  Building2,
  Cpu,
  Presentation,
} from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Engineering Consulting',
    description:
      'Technical advisory services for planning, design validation, and execution strategy.',
    icon: Presentation,
  },
  {
    title: 'Project Management',
    description:
      'Program controls, schedule oversight, and coordinated delivery across stakeholders.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Technical Solutions',
    description:
      'Practical solutions tailored to operational constraints and performance goals.',
    icon: Cpu,
  },
  {
    title: 'Infrastructure Support',
    description:
      'Reliable support for infrastructure development, upgrades, and lifecycle maintenance.',
    icon: Building2,
  },
];

export const Services = () => {
  return (
    <section id="services" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Services
        </p>
        <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Focused engineering capabilities for complex delivery
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
            >
              <div className="mb-4 inline-flex rounded-md bg-cyan-100 p-2 text-cyan-800">
                <service.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {service.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
