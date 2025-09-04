import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Settings, LogOut, Star, ClipboardList, Receipt, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/auth";

interface NavbarProps {
  user: User | null;
}

interface UserData {
  firstName: string;
  lastName: string;
}

const Navbar = ({ user }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [learnMenuOpen, setLearnMenuOpen] = useState(false);
  const [sponsorsMenuOpen, setSponsorsMenuOpen] = useState(false);
  const [investorsMenuOpen, setInvestorsMenuOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [insightsMenuOpen, setInsightsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const scrollToSection = (sectionId: string) => {
    // Check if we're on the home page
    const currentPath = window.location.pathname;
    
    if (currentPath === '/') {
      // We're on home page, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page first, then scroll to section
      setLocation('/');
      // Use setTimeout to ensure page loads before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-[50000] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <img 
            src="/assets/commertize-logo.png" 
            alt="Commertize Logo" 
            className="h-6 sm:h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => scrollToSection('about')} 
            className="text-sm font-light hover:text-foreground/80"
          >
            Mission
          </button>
          <Link href="/marketplace" className="text-sm font-light hover:text-foreground/80">
            Marketplace
          </Link>
          
          {/* For Sponsors Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setSponsorsMenuOpen(true)}
            onMouseLeave={() => setSponsorsMenuOpen(false)}
          >
            <button className="flex items-center text-sm font-light hover:text-foreground/80 gap-1">
              For Sponsors
              <ChevronDown className="h-3 w-3" />
            </button>
            {sponsorsMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-background border rounded-md shadow-lg z-50">
                <div className="p-4 space-y-3">
                  <Link 
                    href="/submit" 
                    className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-light">Submit Property</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      List your commercial property for tokenization
                    </div>
                  </Link>
                  <Link 
                    href="/sponsor-dashboard" 
                    className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-light">Sponsor Dashboard</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Manage your property listings and investments
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* For Investors Dropdown */}
          {user && (
            <div 
              className="relative"
              onMouseEnter={() => setInvestorsMenuOpen(true)}
              onMouseLeave={() => setInvestorsMenuOpen(false)}
            >
              <button className="flex items-center text-sm font-light hover:text-foreground/80 gap-1">
                For Investors
                <ChevronDown className="h-3 w-3" />
              </button>
              {investorsMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-background border rounded-md shadow-lg z-50">
                  <div className="p-4 space-y-3">
                    <Link 
                      href="/portfolio" 
                      className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="font-light">Portfolio</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        View and manage your investment portfolio
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Insights Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setInsightsMenuOpen(true)}
            onMouseLeave={() => setInsightsMenuOpen(false)}
          >
            <button className="flex items-center text-sm font-light hover:text-foreground/80 gap-1">
              Intelligence
              <ChevronDown className="h-3 w-3" />
            </button>
            {insightsMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-background border rounded-md shadow-lg z-50">
                <div className="p-4 space-y-3">
                  <Link 
                    href="/market-updates" 
                    className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-light">Market Insights</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      AI-powered CRE tokenization and RWA market intelligence
                    </div>
                  </Link>
                  <Link 
                    href="/news" 
                    className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-light">News</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Latest insights on CRE and digital investing
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link href="/waitlist" className="text-sm font-light hover:text-foreground/80 text-primary">
            Join Waitlist
          </Link>
          


          {/* Company Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setCompanyMenuOpen(true)}
            onMouseLeave={() => setCompanyMenuOpen(false)}
          >
            <button className="flex items-center text-sm font-light hover:text-foreground/80 gap-1">
              Company
              <ChevronDown className="h-3 w-3" />
            </button>
            {companyMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-background border rounded-md shadow-lg z-50">
                <div className="p-4 space-y-3">
                  <Link 
                    href="/team" 
                    className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-light">Team</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Meet the Commertize leadership team
                    </div>
                  </Link>
                  <Link 
                    href="/faq" 
                    className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-light">FAQ</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Frequently asked questions about tokenized real estate investing
                    </div>
                  </Link>
                  <button 
                    onClick={() => scrollToSection('contact')} 
                    className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left w-full"
                  >
                    <div className="font-light">Contact</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Get in touch with our team
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-primary ring-1 ring-primary/30">
                      <AvatarImage src={user.photoURL || undefined} alt={userData ? `${userData.firstName} ${userData.lastName}` : "User"} />
                      <AvatarFallback className="bg-background text-foreground font-light">
                        {userData ? getInitials(userData.firstName, userData.lastName) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="cursor-default">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-light leading-none">
                        {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/liked-properties" className="cursor-pointer">
                      <Star className="mr-2 h-4 w-4" />
                      <span>Liked Properties</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/transactions" className="cursor-pointer">
                      <Receipt className="mr-2 h-4 w-4" />
                      <span>Transaction Details</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/questionnaire" className="cursor-pointer">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      <span>Questionnaire</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/account">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-[#d4a017]/10 transition-all duration-300 group"
            >
              <Menu className="h-6 w-6 text-[#d4a017] group-hover:text-[#be8d00] transition-colors duration-300 stroke-[2.5]" />
            </Button>
          </SheetTrigger>
          <SheetContent className="z-[60000]">
            <div className="flex flex-col gap-4 mt-8">
              <button 
                onClick={() => {
                  scrollToSection('about');
                  setIsOpen(false);
                }} 
                className="text-sm font-light text-left"
              >
                Mission
              </button>
              <Link 
                href="/marketplace"
                className="text-sm font-light hover:text-foreground/80"
                onClick={() => setIsOpen(false)}
              >
                Marketplace
              </Link>
              
              <div className="space-y-2">
                <p className="text-sm font-light text-muted-foreground">For Sponsors</p>
                <div className="pl-4 space-y-2">
                  <Link 
                    href="/submit"
                    className="text-sm font-light hover:text-foreground/80 block"
                    onClick={() => setIsOpen(false)}
                  >
                    Submit Property
                  </Link>
                  <Link 
                    href="/sponsor-dashboard"
                    className="text-sm font-light hover:text-foreground/80 block"
                    onClick={() => setIsOpen(false)}
                  >
                    Sponsor Dashboard
                  </Link>
                </div>
              </div>

              {user && (
                <div className="space-y-2">
                  <p className="text-sm font-light text-muted-foreground">For Investors</p>
                  <div className="pl-4 space-y-2">
                    <Link 
                      href="/portfolio"
                      className="text-sm font-light hover:text-foreground/80 block"
                      onClick={() => setIsOpen(false)}
                    >
                      Portfolio
                    </Link>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-light text-muted-foreground">Intelligence</p>
                <div className="pl-4 space-y-2">
                  <Link 
                    href="/market-updates"
                    className="text-sm font-light hover:text-foreground/80 block"
                    onClick={() => setIsOpen(false)}
                  >
                    Market Insights
                  </Link>
                  <Link 
                    href="/news"
                    className="text-sm font-light hover:text-foreground/80 block"
                    onClick={() => setIsOpen(false)}
                  >
                    News
                  </Link>
                </div>
              </div>
              <Link 
                href="/waitlist"
                className="text-sm font-light hover:text-foreground/80 text-primary"
                onClick={() => setIsOpen(false)}
              >
                Join Waitlist
              </Link>
              


              <div className="space-y-2">
                <p className="text-sm font-light text-muted-foreground">Company</p>
                <div className="pl-4 space-y-2">
                  <Link 
                    href="/team"
                    className="text-sm font-light hover:text-foreground/80 block"
                    onClick={() => setIsOpen(false)}
                  >
                    Team
                  </Link>
                  <Link 
                    href="/faq"
                    className="text-sm font-light hover:text-foreground/80 block"
                    onClick={() => setIsOpen(false)}
                  >
                    FAQ
                  </Link>
                  <button 
                    onClick={() => {
                      scrollToSection('contact');
                      setIsOpen(false);
                    }} 
                    className="text-sm font-light text-left"
                  >
                    Contact
                  </button>
                </div>
              </div>
              {user ? (
                <>
                  <Link 
                    href="/portfolio"
                    className="text-sm font-light hover:text-foreground/80"
                    onClick={() => setIsOpen(false)}
                  >
                    Portfolio
                  </Link>
                  <Link href="/settings" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Link href="/liked-properties" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Star className="mr-2 h-4 w-4" />
                      Liked Properties
                    </Button>
                  </Link>
                  <Link href="/transactions" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Receipt className="mr-2 h-4 w-4" />
                      Transaction Details
                    </Button>
                  </Link>
                  <Link href="/questionnaire" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Questionnaire
                    </Button>
                  </Link>
                  <Button onClick={handleSignOut} variant="destructive" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <Link href="/account" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;