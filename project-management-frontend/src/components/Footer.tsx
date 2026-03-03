export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center lg:px-8">
        <img src="/debo-logo.png" alt="Debo Engineering logo" className="h-10 w-auto" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
          In Pursuit of Service
        </p>
        <p className="text-sm text-slate-500">
          Copyright {new Date().getFullYear()} Debo Engineering. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};
