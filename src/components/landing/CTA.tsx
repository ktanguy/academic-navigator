import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section style={{ backgroundColor: '#0D1A63' }}>
      <div className="container py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-6">
            Get started
          </p>
          <h2 className="text-4xl font-bold text-white md:text-5xl leading-tight">
            Your questions<br />deserve real answers.
          </h2>
          <p className="mt-6 text-white/65 text-lg leading-relaxed max-w-lg">
            Browse facilitators who can help, or submit a ticket and let AI route it to the right department — instantly.
          </p>
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
            <a
              href="/directory"
              className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-[#0D1A63] font-semibold text-base hover:bg-white/90 transition-colors"
            >
              Browse Facilitators
            </a>
            <a
              href="/helpdesk"
              className="inline-flex items-center gap-2 text-white/70 font-medium text-base hover:text-white transition-colors"
            >
              Submit a ticket
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
