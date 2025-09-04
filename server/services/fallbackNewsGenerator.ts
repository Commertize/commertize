import { db } from '../../db/index.js';
import { newsArticles } from '../../db/schema.js';

interface FallbackArticle {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  readTime: number;
  category: string;
}

// Pre-written professional news templates for when OpenAI is unavailable
const fallbackTemplates: Record<string, FallbackArticle[]> = {
  'CRE': [
    {
      title: "Commercial Real Estate Market Demonstrates Institutional-Grade Resilience Amid Complex Economic Environment",
      summary: "Comprehensive analysis reveals that commercial real estate markets are exhibiting sophisticated adaptive strategies, with institutional investors employing increasingly nuanced approaches to asset selection and portfolio optimization in response to evolving economic conditions.",
      content: `<h2>Executive Market Overview</h2>
      <p>The commercial real estate sector continues to demonstrate remarkable adaptability in the face of complex macroeconomic conditions, with sophisticated institutional investors pivoting toward quality-focused acquisition strategies. Recent comprehensive market analysis indicates that while transaction volumes have moderated, the emphasis on premium assets with strong fundamentals has intensified. This shift reflects a broader evolution in investment philosophy, where institutional capital is increasingly concentrated on properties offering predictable cash flows, strategic locations, and demonstrable resilience against economic volatility. The sector's focus on quality over quantity has created opportunities for platforms like Commertize to bridge the gap between institutional-grade assets and retail investor access.</p>
      
      <h2>Institutional Investment Strategies and Capital Flow Analysis</h2>
      <p>Institutional investors are implementing increasingly sophisticated portfolio strategies, with major pension funds and sovereign wealth funds allocating capital toward assets that demonstrate both defensive characteristics and growth potential. According to recent market research, approximately 68% of institutional capital is now focused on core and core-plus properties, with particular emphasis on assets located in primary and secondary markets with diversified economic bases. This strategic shift has created a tiered market structure where premium properties continue to attract significant investor interest, while secondary assets face increased scrutiny regarding their long-term viability. The flight-to-quality trend has particularly benefited properties with strong ESG credentials, modern infrastructure, and established tenant bases with creditworthy lease profiles.</p>
      
      <h2>Regional Market Performance and Geographic Diversification</h2>
      <p>Geographic diversification strategies are becoming increasingly sophisticated as investors seek to balance risk and return across different metropolitan statistical areas. Gateway cities including New York, Los Angeles, Chicago, and Boston continue to demonstrate resilience due to their established infrastructure, diverse economic foundations, and deep labor pools. However, secondary markets such as Austin, Nashville, Denver, and Raleigh-Durham are attracting significant institutional attention for their favorable demographic trends, business-friendly environments, and relative value propositions. This geographic rebalancing is creating opportunities for investors to access high-quality commercial real estate in emerging markets while maintaining exposure to established urban centers.</p>
      
      <h2>Technology Integration and PropTech Innovation Impact</h2>
      <p>The commercial real estate industry is experiencing a technological renaissance, with PropTech innovations fundamentally altering how properties are evaluated, managed, and traded. Advanced analytics platforms are enabling more sophisticated underwriting processes, while blockchain technology is facilitating more efficient transaction processing and ownership structures. Smart building technologies are becoming standard requirements for institutional-grade properties, with energy management systems, IoT sensors, and predictive maintenance platforms contributing to operational efficiency and tenant satisfaction. These technological advances are particularly relevant for tokenization platforms, as they provide the infrastructure necessary for transparent, efficient fractional ownership models.</p>
      
      <h2>Investment Implications for Portfolio Managers</h2>
      <p>Portfolio managers are increasingly recognizing the value of commercial real estate as both an inflation hedge and a diversification tool within broader investment strategies. The sector's ability to generate consistent income streams while providing potential for capital appreciation makes it particularly attractive in current market conditions. However, the traditional barriers to commercial real estate investment—including high minimum investments, limited liquidity, and complex due diligence requirements—continue to constrain access for many investors. This dynamic has created significant opportunities for innovative platforms that can democratize access while maintaining institutional-quality standards and due diligence processes.</p>
      
      <h2>Future Market Outlook and Strategic Positioning</h2>
      <p>Looking ahead, the commercial real estate market is expected to continue evolving toward greater efficiency, transparency, and accessibility. Demographic trends, including urbanization and changing work patterns, will continue to influence property demand across different sectors. The integration of technology and finance is expected to accelerate, creating new investment vehicles and ownership structures that can better serve both institutional and retail investor needs. Market experts anticipate continued growth in alternative ownership models, including tokenization and fractional ownership platforms, as investors seek more flexible and accessible ways to participate in commercial real estate markets.</p>
      
      <h2>Commertize Platform Strategic Advantages</h2>
      <p>These evolving market dynamics position Commertize's tokenization platform as a critical bridge between institutional-quality commercial real estate and accessible investment opportunities. Our platform addresses the fundamental challenge of democratizing access to premium commercial properties while maintaining the rigorous due diligence and professional management standards expected by sophisticated investors. By tokenizing carefully selected commercial assets, Commertize enables investors to participate in institutional-quality properties with lower minimum investments, enhanced liquidity, and transparent performance tracking. Our approach combines traditional real estate expertise with innovative blockchain technology, creating a comprehensive solution that serves both the growing demand for alternative investment options and the need for efficient, transparent property markets. This strategic positioning allows Commertize users to benefit from the stability and income potential of commercial real estate while participating in the technological evolution of property investment.</p>`,
      tags: ["Commercial Real Estate", "Institutional Investment", "Market Analysis", "Investment Strategy"],
      readTime: 8,
      category: "CRE"
    }
  ],
  'Tokenization': [
    {
      title: "Real Estate Tokenization Gains Institutional Momentum",
      summary: "Major financial institutions are exploring blockchain-based real estate tokenization as a means to enhance liquidity and accessibility in commercial property markets.",
      content: `<h2>Institutional Adoption</h2>
      <p>Leading financial institutions are increasingly recognizing the potential of real estate tokenization to transform traditional property investment models. This technology enables fractional ownership of high-value commercial assets, making them accessible to a broader range of investors.</p>
      
      <h2>Technology Infrastructure</h2>
      <p>Blockchain technology provides the foundation for secure, transparent property tokenization. Smart contracts automate many traditional real estate processes, reducing costs and improving efficiency while maintaining regulatory compliance.</p>
      
      <h2>Market Benefits</h2>
      <p>Tokenization offers several advantages including enhanced liquidity, lower barriers to entry, and improved transparency in property transactions. These benefits align with evolving investor preferences for accessible, efficient investment vehicles.</p>
      
      <h2>Commertize's Leadership Role</h2>
      <p>Commertize is at the forefront of this transformation, providing a comprehensive platform for commercial real estate tokenization. Our technology enables investors to participate in premium commercial properties through secure, regulated tokens. By combining institutional-grade due diligence with blockchain innovation, Commertize is democratizing access to commercial real estate investment while maintaining the highest standards of transparency and security.</p>`,
      tags: ["Tokenization", "Blockchain", "Real Estate Innovation"],
      readTime: 6,
      category: "Tokenization"
    }
  ],
  'RWA': [
    {
      title: "Real World Asset Tokenization Expands Beyond Real Estate",
      summary: "The tokenization of real world assets is gaining traction across multiple sectors, with real estate leading the charge in demonstrating practical applications.",
      content: `<h2>Expanding Scope</h2>
      <p>Real World Asset (RWA) tokenization is evolving beyond its initial focus on real estate to encompass various asset classes. This expansion demonstrates the versatility and potential of blockchain technology in traditional finance.</p>
      
      <h2>Infrastructure Development</h2>
      <p>The development of robust tokenization infrastructure is enabling more sophisticated applications of blockchain technology to physical assets. These improvements are making tokenization more accessible and practical for institutional use.</p>
      
      <h2>Regulatory Progress</h2>
      <p>Regulatory frameworks are evolving to accommodate tokenized assets, providing greater clarity and confidence for institutional adoption. This progress is crucial for the long-term growth of the RWA tokenization market.</p>
      
      <h2>Commertize's Strategic Position</h2>
      <p>As the RWA tokenization market expands, Commertize's focus on commercial real estate positions us as a leader in one of the most established and proven applications of this technology. Our platform demonstrates how tokenization can transform traditional asset classes, making commercial real estate investment more accessible and efficient. The lessons learned and infrastructure developed through real estate tokenization provide a strong foundation for the broader RWA ecosystem.</p>`,
      tags: ["RWA", "Asset Tokenization", "Blockchain Finance"],
      readTime: 5,
      category: "RWA"
    }
  ],
  'Markets': [
    {
      title: "Financial Markets Adapt to Real Estate Tokenization Trends",
      summary: "Traditional financial markets are evolving to accommodate real estate tokenization, with new infrastructure and investment vehicles emerging.",
      content: `<h2>Market Evolution</h2>
      <p>Financial markets are experiencing a significant transformation as real estate tokenization gains acceptance among institutional and retail investors. This evolution represents a fundamental shift in how property investment is structured and accessed.</p>
      
      <h2>Infrastructure Development</h2>
      <p>New market infrastructure is being developed to support tokenized real estate transactions, including specialized trading platforms and custody solutions designed for digital property assets.</p>
      
      <h2>Investment Vehicle Innovation</h2>
      <p>Traditional investment vehicles are being reimagined for the tokenized economy, offering investors new ways to access real estate markets with enhanced liquidity and transparency.</p>
      
      <h2>Commertize's Market Position</h2>
      <p>Commertize is positioned at the intersection of traditional real estate markets and emerging tokenization infrastructure. Our platform bridges the gap between established commercial real estate practices and innovative blockchain technology, providing investors with access to tokenized commercial properties through a regulated, transparent marketplace. This positions our users to benefit from both the stability of commercial real estate and the efficiency gains of tokenization technology.</p>`,
      tags: ["Financial Markets", "Market Infrastructure", "Investment Innovation"],
      readTime: 5,
      category: "Markets"
    }
  ],
  'Crypto': [
    {
      title: "Cryptocurrency Markets Embrace Real World Asset Integration",
      summary: "The cryptocurrency ecosystem is expanding to include real world assets, with real estate leading the integration between digital and traditional finance.",
      content: `<h2>Ecosystem Expansion</h2>
      <p>The cryptocurrency market is witnessing unprecedented growth in Real World Asset (RWA) integration, with tokenized real estate serving as a bridge between traditional finance and digital assets.</p>
      
      <h2>Institutional Adoption</h2>
      <p>Major cryptocurrency institutions are developing infrastructure to support real world asset tokenization, recognizing the potential for stable, yield-generating digital assets backed by physical properties.</p>
      
      <h2>Market Maturation</h2>
      <p>This trend represents a maturation of the cryptocurrency market, moving beyond purely speculative assets to include productive, income-generating real world assets.</p>
      
      <h2>Commertize's Crypto Integration</h2>
      <p>Commertize leverages blockchain technology to tokenize commercial real estate, creating digital assets that combine the stability of property investment with the efficiency of cryptocurrency infrastructure. Our platform enables investors to hold tokenized real estate alongside traditional crypto holdings, providing portfolio diversification and stable income streams. This integration represents the future of asset digitization and decentralized finance.</p>`,
      tags: ["Cryptocurrency", "Digital Assets", "Blockchain Integration"],
      readTime: 6,
      category: "Crypto"
    }
  ],
  'Digital Assets': [
    {
      title: "Digital Asset Management Evolves with Real Estate Tokenization",
      summary: "Digital asset management platforms are adapting to include tokenized real estate, offering new portfolio diversification opportunities.",
      content: `<h2>Portfolio Evolution</h2>
      <p>Digital asset management is evolving to include tokenized real estate as a core component of diversified digital portfolios, offering stability and income generation alongside traditional digital assets.</p>
      
      <h2>Technology Integration</h2>
      <p>Advanced digital asset management platforms are integrating real estate tokenization capabilities, providing seamless access to property investments through familiar digital interfaces.</p>
      
      <h2>Risk Management</h2>
      <p>Tokenized real estate offers digital asset portfolios enhanced risk management through diversification into stable, income-producing assets backed by physical properties.</p>
      
      <h2>Commertize's Digital Asset Leadership</h2>
      <p>Commertize specializes in creating high-quality tokenized commercial real estate assets that integrate seamlessly into digital asset portfolios. Our platform provides institutional-grade due diligence and management for tokenized properties, ensuring that digital asset investors can access premium commercial real estate with the same ease and transparency they expect from other digital investments.</p>`,
      tags: ["Digital Assets", "Portfolio Management", "Asset Tokenization"],
      readTime: 5,
      category: "Digital Assets"
    }
  ],
  'Regulation': [
    {
      title: "Regulatory Frameworks Advance for Real Estate Tokenization",
      summary: "Regulatory bodies are developing comprehensive frameworks for real estate tokenization, providing clarity and confidence for institutional adoption.",
      content: `<h2>Regulatory Clarity</h2>
      <p>Regulatory bodies worldwide are establishing clear frameworks for real estate tokenization, addressing compliance requirements and investor protection while enabling innovation in property investment.</p>
      
      <h2>Compliance Standards</h2>
      <p>New compliance standards are emerging specifically for tokenized real estate, ensuring that digital property investments meet the same regulatory requirements as traditional real estate securities.</p>
      
      <h2>Market Confidence</h2>
      <p>Clear regulatory guidance is building institutional confidence in tokenized real estate markets, encouraging broader adoption and investment in this emerging asset class.</p>
      
      <h2>Commertize's Regulatory Compliance</h2>
      <p>Commertize operates within established regulatory frameworks, ensuring that all tokenized properties on our platform meet current compliance requirements. Our commitment to regulatory compliance provides investors with confidence that their tokenized real estate investments are properly structured and legally compliant. We actively monitor regulatory developments to ensure our platform continues to meet evolving standards for tokenized asset offerings.</p>`,
      tags: ["Regulation", "Compliance", "Legal Framework"],
      readTime: 6,
      category: "Regulation"
    }
  ],
  'Technology': [
    {
      title: "PropTech Innovation Drives Real Estate Tokenization Forward",
      summary: "Property technology innovations are accelerating real estate tokenization adoption, making property investment more accessible and efficient.",
      content: `<h2>Innovation Acceleration</h2>
      <p>Property technology (PropTech) innovations are rapidly advancing real estate tokenization capabilities, creating more efficient and accessible property investment solutions.</p>
      
      <h2>Platform Development</h2>
      <p>Advanced tokenization platforms are being developed with sophisticated features for property management, investor relations, and transaction processing, streamlining the entire property investment lifecycle.</p>
      
      <h2>Integration Solutions</h2>
      <p>New technology solutions are enabling seamless integration between traditional real estate operations and blockchain-based tokenization systems, bridging the gap between established practices and innovative approaches.</p>
      
      <h2>Commertize's Technology Leadership</h2>
      <p>Commertize leverages cutting-edge PropTech innovations to deliver a comprehensive real estate tokenization platform. Our technology stack integrates advanced property analysis, blockchain tokenization, and investor management tools to create a seamless experience for both property sponsors and investors. By combining proven real estate practices with innovative technology, Commertize is setting new standards for efficiency and accessibility in commercial property investment.</p>`,
      tags: ["PropTech", "Technology Innovation", "Platform Development"],
      readTime: 5,
      category: "Technology"
    }
  ]
};

export class FallbackNewsGenerator {
  async generateFallbackArticle(category: string): Promise<FallbackArticle | null> {
    const templates = fallbackTemplates[category];
    if (!templates || templates.length === 0) {
      return null;
    }

    // Select a random template from the category
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Add current date context
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Update content with current date
    const updatedContent = template.content.replace(
      '<h2>Market Overview</h2>',
      `<p><em>Market Update - ${currentDate}</em></p><h2>Market Overview</h2>`
    );

    return {
      ...template,
      content: updatedContent,
      title: template.title // Keep original title without day updates
    };
  }

  async publishFallbackArticle(category: string): Promise<boolean> {
    try {
      const article = await this.generateFallbackArticle(category);
      if (!article) {
        console.error(`No fallback template available for category: ${category}`);
        return false;
      }

      // Generate unique slug
      const baseSlug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const timestamp = Date.now();
      const slug = `${baseSlug}-${timestamp}`;

      // Get category-specific image
      const categoryImageMap: Record<string, string> = {
        'CRE': '/generated-images/fallback-cre-news.jpg',
        'Tokenization': '/generated-images/fallback-tokenization-news.jpg', 
        'RWA': '/generated-images/fallback-rwa-news.jpg',
        'Crypto': '/generated-images/fallback-crypto-news.jpg',
        'Digital Assets': '/generated-images/fallback-digital-assets-news.jpg',
        'Markets': '/generated-images/fallback-markets-news.jpg',
        'Regulation': '/generated-images/fallback-cre-news.jpg', // Use CRE image as fallback
        'Technology': '/generated-images/fallback-tokenization-news.jpg' // Use tokenization image as fallback
      };
      
      const imageUrl = categoryImageMap[category] || '/generated-images/fallback-cre-news.jpg';

      // Insert into database
      const [newArticle] = await db.insert(newsArticles).values({
        title: article.title,
        slug: slug,
        summary: article.summary,
        content: article.content,
        category: article.category,
        tags: article.tags,
        imageUrl: imageUrl, // Use category-specific image
        readTime: article.readTime,
        publishedAt: new Date(),
        aiGenerated: 'fallback' // Mark as fallback content
      }).returning();

      console.log(`✅ Published fallback article: ${newArticle.title}`);
      return true;
    } catch (error) {
      console.error('Error publishing fallback article:', error);
      return false;
    }
  }
}

export const fallbackNewsGenerator = new FallbackNewsGenerator();