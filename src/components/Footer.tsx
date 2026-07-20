const Footer = () => {
  return (
    <footer className="px-6 md:px-12 lg:px-20 py-16 bg-card border-t border-border/30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <span className="text-display text-2xl font-semibold text-foreground italic">SpaceFlow</span>
        <div className="flex gap-10">
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-body tracking-[0.15em] uppercase"
            >
              {link}
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-body">
          © 2026 SpaceFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
