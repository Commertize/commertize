export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export function generateWelcomeEmailTemplate(data: WelcomeEmailData): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Commertize</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#ffffff; font-family:'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-feature-settings: 'rlig' 1, 'calt' 1; letter-spacing: -0.01em;">

<div style="max-width:600px; margin:0 auto; background:#ffffff;">

<!-- COMMERTIZE HEADER -->
<div style="background:#ffffff; padding:40px 30px; text-align:center; border-bottom:1px solid #e5e7eb;">
<h1 style="margin:0; color:#be8d00; font-size:28px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; font-family:'Space Grotesk', sans-serif;">COMMERTIZE</h1>
<p style="margin:10px 0 0; color:#666666; font-size:14px; font-family:'Space Grotesk', sans-serif;">Revolutionizing Commercial Real Estate Investment</p>
</div>

<!-- BUILDING HERO IMAGE -->
<div style="position:relative; height:350px; background-image:url('https://5ad05f8f-7184-4ade-a952-71ff781ec6e0-00-q5a5y2bf6gr7.spock.replit.dev/building-hd.jpg'); background-size:cover; background-position:center;">
<div style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(255,255,255,0.9); display:flex; align-items:center; justify-content:center; text-align:center; padding:30px;">
<div>
<h2 style="margin:0 0 15px; color:#191a1e; font-size:42px; font-weight:600; line-height:1.1; font-family:'Space Grotesk', sans-serif;">The Future of</h2>
<h3 style="margin:0 0 20px; color:#be8d00; font-size:48px; font-weight:700; line-height:1; font-family:'Space Grotesk', sans-serif;">Commercial Real Estate</h3>
<p style="margin:0; color:#4b5563; font-size:18px; line-height:1.4; font-family:'Space Grotesk', sans-serif;">Where Traditional Assets Meet Blockchain Innovation</p>
</div>
</div>
</div>

<!-- WELCOME MESSAGE -->
<div style="padding:50px 30px; background:#ffffff; text-align:center;">
<h2 style="margin:0 0 25px; color:#191a1e; font-size:32px; font-weight:600; font-family:'Space Grotesk', sans-serif;">Welcome to the Revolution, ${data.userName}</h2>
<p style="margin:0 0 30px; color:#4b5563; font-size:18px; line-height:1.6; font-family:'Space Grotesk', sans-serif;">You've just joined the most advanced platform transforming how the world invests in commercial real estate. We're democratizing access to premium properties through cutting-edge blockchain technology.</p>
</div>

<!-- HOW WE'RE REVOLUTIONIZING CRE -->
<div style="padding:0 30px 40px; background:#ffffff;">
<h3 style="margin:0 0 35px; color:#191a1e; font-size:28px; font-weight:600; text-align:center; font-family:'Space Grotesk', sans-serif;">How Commertize is Revolutionizing the Industry</h3>

<!-- REVOLUTION POINT 1 -->
<div style="background:#fafafa; border-left:4px solid #be8d00; padding:30px; margin-bottom:25px; border-radius:8px;">
<h4 style="margin:0 0 15px; color:#191a1e; font-size:20px; font-weight:600; font-family:'Space Grotesk', sans-serif;">🏗️ Breaking Down Barriers</h4>
<p style="margin:0; color:#4b5563; font-size:16px; line-height:1.6; font-family:'Space Grotesk', sans-serif;">Traditional commercial real estate has been locked away behind million-dollar minimums and complex partnerships. We've shattered these barriers, allowing you to own fractional shares of premium properties starting from just $1,000.</p>
</div>

<!-- REVOLUTION POINT 2 -->
<div style="background:#fafafa; border-left:4px solid #be8d00; padding:30px; margin-bottom:25px; border-radius:8px;">
<h4 style="margin:0 0 15px; color:#191a1e; font-size:20px; font-weight:600; font-family:'Space Grotesk', sans-serif;">⚡ Creating Instant Liquidity</h4>
<p style="margin:0; color:#4b5563; font-size:16px; line-height:1.6; font-family:'Space Grotesk', sans-serif;">Real estate has always been illiquid—until now. Our blockchain-powered marketplace lets you buy and sell property tokens 24/7, transforming real estate into a liquid asset class for the first time in history.</p>
</div>

<!-- REVOLUTION POINT 3 -->
<div style="background:#fafafa; border-left:4px solid #be8d00; padding:30px; margin-bottom:25px; border-radius:8px;">
<h4 style="margin:0 0 15px; color:#191a1e; font-size:20px; font-weight:600; font-family:'Space Grotesk', sans-serif;">🔍 Delivering Unprecedented Transparency</h4>
<p style="margin:0; color:#4b5563; font-size:16px; line-height:1.6; font-family:'Space Grotesk', sans-serif;">Every transaction, every rental payment, every ownership detail is recorded on the blockchain. You'll have complete visibility into your investments with real-time performance data and automated dividend distributions.</p>
</div>

<!-- REVOLUTION POINT 4 -->
<div style="background:#fafafa; border-left:4px solid #be8d00; padding:30px; margin-bottom:35px; border-radius:8px;">
<h4 style="margin:0 0 15px; color:#191a1e; font-size:20px; font-weight:600; font-family:'Space Grotesk', sans-serif;">🌍 Globalizing Investment Opportunities</h4>
<p style="margin:0; color:#4b5563; font-size:16px; line-height:1.6; font-family:'Space Grotesk', sans-serif;">Geography no longer limits your investment potential. Access premium commercial properties from New York to London to Tokyo, all from a single platform, with the same level of security and transparency.</p>
</div>

</div>

<!-- WHAT THIS MEANS FOR YOU -->
<div style="padding:40px 30px; background:#f8f9fa;">
<h3 style="margin:0 0 35px; color:#191a1e; font-size:28px; font-weight:600; text-align:center; font-family:'Space Grotesk', sans-serif;">What This Revolution Means for You</h3>

<div style="display:grid; gap:25px;">

<!-- BENEFIT 1 -->
<div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:25px; text-align:center;">
<div style="width:60px; height:60px; background:#be8d00; border-radius:50%; margin:0 auto 20px; display:flex; align-items:center; justify-content:center; font-size:24px;">💰</div>
<h4 style="margin:0 0 12px; color:#191a1e; font-size:18px; font-weight:600; font-family:'Space Grotesk', sans-serif;">Build Wealth with Lower Minimums</h4>
<p style="margin:0; color:#4b5563; font-size:15px; line-height:1.5; font-family:'Space Grotesk', sans-serif;">Start your commercial real estate portfolio with just $1,000 instead of millions. Access the same institutional-quality properties that were once reserved for the ultra-wealthy.</p>
</div>

<!-- BENEFIT 2 -->
<div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:25px; text-align:center;">
<div style="width:60px; height:60px; background:#be8d00; border-radius:50%; margin:0 auto 20px; display:flex; align-items:center; justify-content:center; font-size:24px;">📈</div>
<h4 style="margin:0 0 12px; color:#191a1e; font-size:18px; font-weight:600; font-family:'Space Grotesk', sans-serif;">Earn Consistent Returns</h4>
<p style="margin:0; color:#4b5563; font-size:15px; line-height:1.5; font-family:'Space Grotesk', sans-serif;">Target 6-12% annual returns from carefully vetted commercial properties with proven income streams. Receive quarterly dividend payments automatically distributed to your wallet.</p>
</div>

<!-- BENEFIT 3 -->
<div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:25px; text-align:center;">
<div style="width:60px; height:60px; background:#be8d00; border-radius:50%; margin:0 auto 20px; display:flex; align-items:center; justify-content:center; font-size:24px;">🔄</div>
<h4 style="margin:0 0 12px; color:#191a1e; font-size:18px; font-weight:600; font-family:'Space Grotesk', sans-serif;">Trade When You Want</h4>
<p style="margin:0; color:#4b5563; font-size:15px; line-height:1.5; font-family:'Space Grotesk', sans-serif;">Unlike traditional real estate, you're not locked in for years. Our 24/7 marketplace lets you buy and sell property tokens whenever you want, giving you unprecedented flexibility.</p>
</div>

<!-- BENEFIT 4 -->
<div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:25px; text-align:center;">
<div style="width:60px; height:60px; background:#be8d00; border-radius:50%; margin:0 auto 20px; display:flex; align-items:center; justify-content:center; font-size:24px;">🛡️</div>
<h4 style="margin:0 0 12px; color:#191a1e; font-size:18px; font-weight:600; font-family:'Space Grotesk', sans-serif;">Invest with Confidence</h4>
<p style="margin:0; color:#4b5563; font-size:15px; line-height:1.5; font-family:'Space Grotesk', sans-serif;">Every property is thoroughly vetted by our expert team and secured by smart contracts. Your ownership is immutable and your investments are protected by cutting-edge blockchain technology.</p>
</div>

</div>
</div>

<!-- CALL TO ACTION -->
<div style="padding:50px 30px; background:#ffffff; text-align:center;">
<h3 style="margin:0 0 20px; color:#191a1e; font-size:24px; font-weight:600; font-family:'Space Grotesk', sans-serif;">Ready to Start Building Your Portfolio?</h3>
<p style="margin:0 0 30px; color:#4b5563; font-size:16px; line-height:1.6; font-family:'Space Grotesk', sans-serif;">Explore our curated selection of premium commercial properties and take your first step into the future of real estate investment.</p>

<div style="margin-bottom:25px;">
<a href="https://commertize.com/marketplace" style="background:#be8d00; color:#ffffff; padding:16px 40px; text-decoration:none; border-radius:8px; font-size:18px; font-weight:600; display:inline-block; font-family:'Space Grotesk', sans-serif;">Explore Properties</a>
</div>

<p style="margin:0; color:#6b7280; font-size:14px; font-family:'Space Grotesk', sans-serif;">
Questions? Our investment specialists are here to help: <a href="mailto:support@commertize.com" style="color:#be8d00; text-decoration:none; font-family:'Space Grotesk', sans-serif;">support@commertize.com</a>
</p>
</div>

<!-- FOOTER -->
<div style="padding:40px 30px; background:#ffffff; color:#4b5563; text-align:center; border-top:1px solid #e5e7eb;">
<h4 style="margin:0 0 15px; color:#be8d00; font-size:20px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; font-family:'Space Grotesk', sans-serif;">COMMERTIZE</h4>
<p style="margin:0 0 20px; font-size:14px; color:#6b7280; font-family:'Space Grotesk', sans-serif;">Democratizing access to commercial real estate through blockchain innovation</p>

<div style="border-top:1px solid #e5e7eb; padding-top:25px; margin-top:25px;">
<p style="margin:0 0 15px; font-size:12px; color:#9ca3af; line-height:1.4; font-family:'Space Grotesk', sans-serif;">
This email was sent to ${data.userEmail}. Certain offerings are available only to accredited investors. Nothing herein constitutes investment advice. Digital assets carry risk and may lose value.
</p>
<p style="margin:0; font-size:12px; color:#9ca3af; font-family:'Space Grotesk', sans-serif;">
© 2025 Commertize, Inc. All rights reserved.
</p>
</div>

</div>

</div>

</body>
</html>`;
}