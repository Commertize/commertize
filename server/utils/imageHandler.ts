import OpenAI from 'openai';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Create local images directory if it doesn't exist
const imagesDir = path.join(process.cwd(), 'public', 'generated-images');
if (!existsSync(imagesDir)) {
  mkdirSync(imagesDir, { recursive: true });
}

export async function generateAndStoreImage(
  prompt: string, 
  filename: string
): Promise<string | null> {
  try {
    console.log('Generating image with prompt:', prompt);
    
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    if (imageResponse.data && imageResponse.data[0] && imageResponse.data[0].url) {
      const dalleImageUrl = imageResponse.data[0].url;
      console.log('Generated DALL-E image:', dalleImageUrl);
      
      // Download and store locally
      try {
        const fetch = (await import('node-fetch')).default;
        const downloadResponse = await fetch(dalleImageUrl);
        
        if (!downloadResponse.ok) {
          throw new Error(`Failed to download image: ${downloadResponse.status}`);
        }
        
        const imageBuffer = await downloadResponse.arrayBuffer();
        
        // Ensure directory exists
        if (!existsSync(imagesDir)) {
          mkdirSync(imagesDir, { recursive: true });
        }
        
        // Save to public directory
        const imagePath = path.join(imagesDir, `${filename}.png`);
        writeFileSync(imagePath, Buffer.from(imageBuffer));
        
        // Return the public URL
        const publicUrl = `/generated-images/${filename}.png`;
        console.log('Successfully stored image locally at:', publicUrl);
        
        return publicUrl;
      } catch (storageError: any) {
        console.error('Failed to store image locally:', storageError?.message);
        // Fall back to DALL-E URL if storage fails
        console.log('Falling back to DALL-E URL:', dalleImageUrl);
        return dalleImageUrl;
      }
    }
    
    // If DALL-E fails, generate a professional gradient image as fallback
    console.warn('DALL-E generation failed, creating professional fallback image');
    return createProfessionalFallbackImage(filename, prompt);
  } catch (error: any) {
    console.error('Error generating image:', error?.message);
    // Generate professional fallback instead of returning null
    console.log('Creating professional fallback image due to error');
    return createProfessionalFallbackImage(filename, prompt);
  }
}

async function createProfessionalFallbackImage(filename: string, prompt: string): Promise<string> {
  try {
    const { createCanvas } = await import('canvas');
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');
    
    // Professional gradient backgrounds
    const gradients = [
      ['#1e3a8a', '#3b82f6', '#60a5fa'], // Blue professional
      ['#1f2937', '#374151', '#6b7280'], // Dark professional  
      ['#0f172a', '#1e293b', '#334155'], // Navy professional
      ['#581c87', '#7c3aed', '#a855f7'], // Purple professional
      ['#134e4a', '#059669', '#10b981']  // Teal professional
    ];
    
    // Category-based gradient selection
    let selectedGradient = gradients[0]; // Default blue
    if (prompt.includes('commercial') || prompt.includes('real estate')) {
      selectedGradient = gradients[1]; // Dark for CRE
    } else if (prompt.includes('blockchain') || prompt.includes('crypto')) {
      selectedGradient = gradients[3]; // Purple for blockchain
    } else if (prompt.includes('technology') || prompt.includes('digital')) {
      selectedGradient = gradients[4]; // Teal for tech
    }
    
    // Create professional gradient
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, selectedGradient[0]);
    gradient.addColorStop(0.5, selectedGradient[1]);
    gradient.addColorStop(1, selectedGradient[2]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add professional geometric elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(800, 200, 150, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(200, 800, 200, 0, Math.PI * 2);
    ctx.fill();
    
    // Add COMMERTIZE branding
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COMMERTIZE', 512, 450);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('Commercial Real Estate Tokenization', 512, 500);
    
    // Add professional icon/symbol
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.rect(412, 550, 200, 120);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fill();
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    const imagePath = path.join(imagesDir, `${filename}.png`);
    writeFileSync(imagePath, buffer);
    
    const publicUrl = `/generated-images/${filename}.png`;
    console.log('✅ Professional fallback image created:', publicUrl);
    
    return publicUrl;
  } catch (fallbackError) {
    console.error('Failed to create fallback image:', fallbackError);
    // Return a default gradient image URL that we'll create
    return createDefaultGradientImage(filename);
  }
}

function createDefaultGradientImage(filename: string): string {
  try {
    // Create a simple professional SVG fallback
    const svg = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <circle cx="800" cy="200" r="150" fill="rgba(255,255,255,0.1)" />
        <circle cx="200" cy="800" r="200" fill="rgba(255,255,255,0.05)" />
        <text x="512" y="450" text-anchor="middle" fill="#FFD700" font-size="48" font-weight="bold" font-family="Arial, sans-serif">COMMERTIZE</text>
        <text x="512" y="500" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="24" font-family="Arial, sans-serif">Commercial Real Estate Tokenization</text>
        <rect x="412" y="550" width="200" height="120" fill="rgba(255,215,0,0.3)" stroke="#FFD700" stroke-width="4" />
      </svg>
    `;
    
    // Convert SVG to base64 and save
    const svgBuffer = Buffer.from(svg);
    const imagePath = path.join(imagesDir, `${filename}.svg`);
    writeFileSync(imagePath, svgBuffer);
    
    const publicUrl = `/generated-images/${filename}.svg`;
    console.log('✅ Default gradient image created:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Failed to create default image:', error);
    // Return a basic data URL as last resort
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFlM2E4YTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNiODJmNjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MGE1ZmE7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkKSIgLz48dGV4dCB4PSI1MTIiIHk9IjUxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRDcwMCIgZm9udC1zaXplPSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsIj5DT01NRVJUSV5FPC90ZXh0Pjwvc3ZnPg==';
  }
}

export function generateImagePrompt(category: string, title?: string): string {
  // Base styles for variety
  const styles = [
    "professional, modern illustration",
    "sleek digital art with clean lines",
    "contemporary business graphic design",
    "minimalist professional visualization",
    "modern corporate illustration"
  ];
  
  // Color schemes for variety
  const colorSchemes = [
    "with blue and gold accents",
    "with deep blue and white tones",
    "with professional grey and gold highlights",
    "with navy blue and silver elements",
    "with sophisticated dark blue and golden tones"
  ];
  
  // Perspectives for variety
  const perspectives = [
    "aerial perspective view",
    "modern architectural angle",
    "dynamic business perspective",
    "clean frontal composition",
    "isometric professional view"
  ];
  
  // Randomly select elements for uniqueness
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const randomColor = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
  const randomPerspective = perspectives[Math.floor(Math.random() * perspectives.length)];
  
  const basePrompt = `Create a ${randomStyle} suitable for a financial technology website. Clean and professional design, high quality, business-appropriate style ${randomColor}, ${randomPerspective}.`;
  
  const categoryPrompts: Record<string, string> = {
    'CRE': 'Commercial real estate buildings, office towers, modern architecture',
    'Tokenization': 'Digital blockchain tokens, cryptocurrency, tokenized assets visualization',
    'RWA': 'Real world assets digitization, physical to digital transformation',
    'Crypto': 'Cryptocurrency, digital finance, blockchain technology',
    'Digital Assets': 'Digital finance, technology and assets, fintech innovation',
    'Regulation': 'Legal compliance, regulatory framework, professional legal environment',
    'Technology': 'Modern technology, innovation, digital transformation',
    'Markets': 'Financial markets, trading, investment analysis'
  };
  
  const categoryDesc = categoryPrompts[category] || 'commercial real estate and technology';
  
  // Add timestamp-based uniqueness factor
  const currentTime = new Date();
  const timeOfDay = currentTime.getHours() < 12 ? 'morning light' : currentTime.getHours() < 17 ? 'midday lighting' : 'evening ambiance';
  
  return `${basePrompt} Focus on ${categoryDesc}. ${title ? `Related to: ${title}. ` : ''}Professional business setting with ${timeOfDay}. Unique composition style ID: ${Date.now()}`;
}