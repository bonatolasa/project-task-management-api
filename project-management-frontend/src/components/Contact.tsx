import { motion } from 'framer-motion';

export const Contact = () => {
  return (
    <section id="contact" className="bg-slate-50 py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Contact
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Let’s discuss your next engineering project
          </h2>

          <div className="mt-8 space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Address:</span> Addis Ababa,
              Ethiopia
            </p>
            <p>
              <span className="font-semibold">Email:</span> info@deboengineering.com
            </p>
            <p>
              <span className="font-semibold">Phone:</span> +251 000 000 000
            </p>
          </div>
        </motion.div>

        <motion.form
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="grid gap-4">
            <label className="text-sm font-medium text-slate-700">
              Name
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-700 transition focus:ring-2"
                placeholder="Your full name"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-700 transition focus:ring-2"
                placeholder="you@company.com"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Message
              <textarea
                rows={5}
                className="mt-1 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-700 transition focus:ring-2"
                placeholder="Tell us about your requirements"
              />
            </label>

            <button
              type="button"
              className="mt-2 rounded-md bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              Send Message
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};
