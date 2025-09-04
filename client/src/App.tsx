import { Switch, Route, useLocation } from "wouter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { InstallPrompt } from "./components/InstallPrompt";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import PropertyDetails from "./pages/PropertyDetails";
import Submit from "./pages/Submit";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import PortfolioOverview from "./pages/PortfolioOverview";
import Settings from "./pages/Settings";
import LikedProperties from "./pages/LikedProperties";
import InvestorQuestionnaire from "./pages/InvestorQuestionnaire";
import About from "./pages/About";
import Team from "./pages/Team";
import TeamSimple from "./pages/TeamSimple";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Disclaimer from "./pages/Disclaimer";
import AMLPolicy from "./pages/AMLPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import KYBPolicy from "./pages/KYBPolicy";
import FAQ from "./pages/FAQ";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import ForgotPassword from "./pages/ForgotPassword";
import EmailVerificationSuccess from "./pages/EmailVerificationSuccess";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserTransactions from "./pages/UserTransactions";
import AdminRoute from "./components/AdminRoute";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { onAuthChange } from "./lib/auth";
import { User } from "firebase/auth";
import { initializeCapacitor } from "./capacitor";
import CookieConsent from "./components/CookieConsent";
import NewsletterReminder from "./components/NewsletterReminder";
import ConfidentialityAgreementPage from "./pages/ConfidentialityAgreementPage";
import ChatGPTWidget from "./components/ChatGPTWidget";
import TransactionDetails from "./pages/TransactionDetails";

import Waitlist from "./pages/Waitlist";
import MarketUpdates from "./pages/MarketUpdates";
import MarketUpdateDetail from "./pages/MarketUpdateDetail";
import NewsArticleDetail from "./pages/NewsArticleDetail";
import CommercialRealEstateTokenization from "./pages/CommercialRealEstateTokenization";
import FractionalOwnership from "./pages/FractionalOwnership";
import AIPoweredCRE from "./pages/AIPoweredCRE";
import StickyMarketMarquee from "./components/StickyMarketMarquee";
import PropertyWhispererPage from "./pages/PropertyWhisperer";
import SponsorDashboard from "./pages/SponsorDashboard";
import DashboardAnalyze from "./pages/DashboardAnalyze";
import DashboardReview from "./pages/DashboardReview";
import SubmitProperty from "./pages/SubmitProperty";
import DealWizardFinancials from "./pages/DealWizardFinancials";
import DealFinancials from "./pages/DealFinancials";
import CommertIzerXDemo from "./pages/CommertIzerXDemo";
import PlumeTest from "./pages/PlumeTest";
import LeadCapture from "./pages/LeadCapture";
import LeadImport from "./pages/LeadImport";
import LinkedInCollector from "./pages/LinkedInCollector";
import LeadDashboard from "./pages/LeadDashboard";
import VideoDemo from "./pages/VideoDemo";
import ProfileManagement from "./pages/ProfileManagement";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useLocation();

  // Initialize Capacitor for native platforms
  useEffect(() => {
    initializeCapacitor().catch(console.error);
  }, []);

  // Scroll to top whenever location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      if (!user) {
        sessionStorage.removeItem('redirectAfterLogin');
        if (!window.location.pathname.startsWith('/admin')) {
          setLocation("/");
        }
      } else {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          setLocation(redirectPath);
        }
      }
    });
    return () => unsubscribe();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      <Switch>
        {/* Admin routes need to be defined first */}
        <Route path="/admin/login">
          <AdminLogin />
        </Route>
        <Route path="/admin/dashboard">
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        </Route>
        <Route path="/admin/users/:userId/transactions">
          <AdminRoute>
            <UserTransactions />
          </AdminRoute>
        </Route>

        {/* Main app routes with shared layout */}
        <Route>
          <Navbar user={user} />
          <main className="flex-grow">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/marketplace">
                {user ? <Marketplace /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/marketplace');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/property/:id" component={PropertyDetails} />
              <Route path="/confidentiality-agreement/:id" component={ConfidentialityAgreementPage} />
              <Route path="/submit-original" component={Submit} />
              <Route path="/account" component={Account} />
              <Route path="/dashboard-original" component={Dashboard} />
              <Route path="/portfolio">
                {user ? <PortfolioOverview /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/portfolio');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/investor-contact">
                {() => {
                  sessionStorage.setItem('redirectAfterLogin', '/marketplace');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/about" component={About} />
              <Route path="/team" component={Team} />
              <Route path="/team-simple" component={TeamSimple} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route path="/disclaimer" component={Disclaimer} />
              <Route path="/aml-policy" component={AMLPolicy} />
              <Route path="/cookie-policy" component={CookiePolicy} />
              <Route path="/kyb-policy" component={KYBPolicy} />
              <Route path="/faq" component={FAQ} />
              <Route path="/news" component={News} />
              <Route path="/news/:id" component={NewsArticle} />
              <Route path="/news-articles/:identifier" component={NewsArticleDetail} />
              
              {/* SEO Landing Pages */}
              <Route path="/commercial-real-estate-tokenization" component={CommercialRealEstateTokenization} />
              <Route path="/fractional-ownership" component={FractionalOwnership} />
              <Route path="/ai-powered-cre" component={AIPoweredCRE} />
              
              <Route path="/market-updates" component={MarketUpdates} />
              <Route path="/market-updates/:id" component={MarketUpdateDetail} />
              <Route path="/forgot-password" component={ForgotPassword} />
              <Route path="/verify-email" component={EmailVerificationSuccess} />
              <Route path="/settings">
                {user ? <Settings /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/settings');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/profile">
                {user ? <ProfileManagement /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/profile');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/liked-properties">
                {user ? <LikedProperties /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/liked-properties');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/transactions">
                {user ? <TransactionDetails /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/transactions');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/questionnaire">
                {user ? <InvestorQuestionnaire /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/questionnaire');
                  setLocation("/account");
                  return null;
                }}
              </Route>

              <Route path="/waitlist" component={Waitlist} />
              <Route path="/property-whisperer" component={PropertyWhispererPage} />
              <Route path="/sponsor-dashboard">
                {user ? <SponsorDashboard /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/sponsor-dashboard');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/commertizer-x-demo" component={CommertIzerXDemo} />
              <Route path="/plume-test" component={PlumeTest} />
              <Route path="/lead-capture" component={LeadCapture} />
              <Route path="/lead-import" component={LeadImport} />
              <Route path="/linkedin-collector" component={LinkedInCollector} />
              <Route path="/lead-dashboard" component={LeadDashboard} />
              
              {/* Property Whisperer Sponsor-facing routes */}
              <Route path="/dashboard">
                {user ? <SponsorDashboard /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/dashboard');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/dashboard/analyze">
                {user ? <DashboardAnalyze /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/dashboard/analyze');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/dashboard/review">
                {user ? <DashboardReview /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/dashboard/review');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/submit">
                {user ? <SubmitProperty /> : () => {
                  sessionStorage.setItem('redirectAfterLogin', '/submit');
                  setLocation("/account");
                  return null;
                }}
              </Route>
              <Route path="/deals/new/financials" component={DealWizardFinancials} />
              
              {/* Video Generation Demo */}
              <Route path="/video-demo" component={VideoDemo} />
              
              {/* Property Whisperer Investor-facing routes */}
              <Route path="/deals/:id/financials" component={DealFinancials} />
            </Switch>
          </main>
          <StickyMarketMarquee position="bottom" />
          <Footer />
          <CookieConsent />
          <NewsletterReminder />
          {/* Hide RUNE.CTZ chatbox on marketplace and property pages - CommertizerX chatbox appears there instead */}
          {location !== '/marketplace' && !location.startsWith('/property/') && <ChatGPTWidget />}
        </Route>
      </Switch>
      <InstallPrompt />
      <Toaster />
    </div>
  );
}

export default App;