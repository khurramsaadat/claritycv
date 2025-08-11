export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2024 ClarityCV. Built with Next.js, Tailwind CSS, and Shadcn UI.</p>
          <div className="flex items-center space-x-4">
            <a 
              href="https://nextjs.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Next.js
            </a>
            <a 
              href="https://tailwindcss.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Tailwind CSS
            </a>
            <a 
              href="https://ui.shadcn.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Shadcn UI
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
