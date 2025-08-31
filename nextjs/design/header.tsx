export function Header() {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src="/images/hatesco-logo.png" alt="HATESCO Logo" width={60} height={60} className="h-12 w-auto" />
          <div>
            <h1 className="text-xl font-bold text-foreground">HATESCO</h1>
            <p className="text-sm text-muted-foreground">Inventory Management Solutions</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-foreground hover:text-primary transition-colors">
            Features
          </a>
          <a href="#solutions" className="text-foreground hover:text-primary transition-colors">
            Solutions
          </a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors">
            About
          </a>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </nav>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}