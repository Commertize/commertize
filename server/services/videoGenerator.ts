import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import OpenAI from 'openai';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface VideoGenerationOptions {
  text: string;
  duration?: number; // seconds, max 140 for Basic X plan
  size?: 'square' | 'landscape' | 'portrait';
  style?: 'slideshow' | 'animated_text' | 'logo_reveal';
}

class VideoGenerator {
  private outputDir = path.join(process.cwd(), 'public', 'generated-videos');
  private logoPath = path.join(process.cwd(), 'public', 'assets', 'commertize-logo.png');

  constructor() {
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generatePromotionalVideo(options: VideoGenerationOptions): Promise<string> {
    const {
      text,
      duration = 15, // Default 15 seconds
      size = 'square',
      style = 'animated_text'
    } = options;

    const timestamp = Date.now();
    const filename = `x-video-${style}-${timestamp}.mp4`;
    const outputPath = path.join(this.outputDir, filename);

    console.log(`🎬 Starting video generation: ${filename}`);
    console.log(`📝 Text: ${text.substring(0, 50)}...`);
    console.log(`⏱️ Duration: ${duration}s, Size: ${size}, Style: ${style}`);

    try {
      switch (style) {
        case 'animated_text':
          return await this.createAnimatedTextVideo(text, outputPath, duration, size);
        case 'slideshow':
          return await this.createSlideshowVideo(text, outputPath, duration, size);
        case 'logo_reveal':
          return await this.createLogoRevealVideo(text, outputPath, duration, size);
        default:
          return await this.createAnimatedTextVideo(text, outputPath, duration, size);
      }
    } catch (error) {
      console.error('❌ Video generation failed:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }

  private async createAnimatedTextVideo(
    text: string,
    outputPath: string,
    duration: number,
    size: 'square' | 'landscape' | 'portrait'
  ): Promise<string> {
    const dimensions = this.getDimensions(size);
    const tempImagePath = path.join(this.outputDir, `temp-bg-${Date.now()}.png`);

    try {
      // Create background image with Commertize branding
      console.log(`🎨 Creating background for video: ${path.basename(outputPath)}`);
      await this.createBackgroundImage(tempImagePath, dimensions.width, dimensions.height, text);
      
      if (!fs.existsSync(tempImagePath)) {
        throw new Error(`Background image not created: ${tempImagePath}`);
      }
      
      console.log(`📷 Background created: ${path.basename(tempImagePath)}`);

      return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg()
          .input(tempImagePath)
          .inputOptions(['-loop 1', '-t ' + duration])
          .videoCodec('libx264')
          .outputOptions([
            '-pix_fmt yuv420p',
            '-r 30',
            '-y' // Overwrite output file
          ])
          .output(outputPath);

        // Add zoom and fade effects for dynamic imagery
        ffmpegCommand
          .videoFilters([
            'scale=720:720',
            'zoompan=z=\'min(zoom+0.0015,1.5)\':d=25*12:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s=720x720',
            'fade=in:0:30,fade=out:330:30'
          ])
          .on('start', (commandLine) => {
            console.log(`🎥 FFmpeg starting enhanced video: ${path.basename(outputPath)}`);
            console.log(`📋 Command: ${commandLine}`);
          })
          .on('progress', (progress) => {
            if (progress.percent && progress.percent > 0) {
              console.log(`⏳ Enhanced video progress: ${Math.round(progress.percent)}%`);
            }
          })
          .on('end', async () => {
            console.log(`🎬 Enhanced video completed: ${path.basename(outputPath)}`);
            
            // Add audio track to the video
            try {
              await this.addAudioToVideo(outputPath, duration);
              console.log(`🔊 Audio added to video: ${path.basename(outputPath)}`);
            } catch (audioError) {
              console.log(`⚠️ Audio addition failed, video without sound: ${audioError.message}`);
            }
            
            // Clean up temp file
            if (fs.existsSync(tempImagePath)) {
              fs.unlinkSync(tempImagePath);
              console.log(`🧹 Cleaned up temp file: ${path.basename(tempImagePath)}`);
            }
            
            // Verify video was created
            if (fs.existsSync(outputPath)) {
              const stats = fs.statSync(outputPath);
              console.log(`✅ Enhanced video with imagery created: ${path.basename(outputPath)} (${stats.size} bytes)`);
              resolve(outputPath);
            } else {
              console.error(`❌ Enhanced video file not found: ${outputPath}`);
              reject(new Error('Enhanced video file was not created'));
            }
          })
          .on('error', (err: any) => {
            console.error(`❌ FFmpeg error for ${path.basename(outputPath)}:`, err.message);
            console.error('Full FFmpeg error:', err);
            
            // Clean up temp file on error
            if (fs.existsSync(tempImagePath)) {
              fs.unlinkSync(tempImagePath);
            }
            
            reject(new Error(`FFmpeg failed: ${err.message}`));
          });

        ffmpegCommand.run();
      });
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
      throw error;
    }
  }

  private async createSlideshowVideo(
    text: string,
    outputPath: string,
    duration: number,
    size: 'square' | 'landscape' | 'portrait'
  ): Promise<string> {
    const dimensions = this.getDimensions(size);
    
    // Generate multiple background images for slideshow effect
    const tempImages: string[] = [];
    const slides = Math.min(5, Math.max(3, Math.floor(duration / 3))); // 3-5 slides

    try {
      for (let i = 0; i < slides; i++) {
        const tempImagePath = path.join(this.outputDir, `temp-slide-${i}-${Date.now()}.png`);
        await this.createBackgroundImage(tempImagePath, dimensions.width, dimensions.height, text, i);
        tempImages.push(tempImagePath);
      }

      return new Promise((resolve, reject) => {
        let command = ffmpeg();
        
        // Add all images as inputs
        tempImages.forEach(imagePath => {
          command = command.input(imagePath);
        });

        command
          .complexFilter([
            // Create slideshow with crossfade transitions
            ...tempImages.map((_, i) => `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v${i}]`),
            tempImages.length > 1 ? 
              `[v0][v1]xfade=transition=fade:duration=0.5:offset=${duration/slides}[v01]` +
              (tempImages.length > 2 ? `;[v01][v2]xfade=transition=fade:duration=0.5:offset=${2*duration/slides}[v012]` : '') +
              (tempImages.length > 3 ? `;[v012][v3]xfade=transition=fade:duration=0.5:offset=${3*duration/slides}[v0123]` : '') +
              (tempImages.length > 4 ? `;[v0123][v4]xfade=transition=fade:duration=0.5:offset=${4*duration/slides}[final]` : '') 
              : '[v0]copy[final]'
          ])
          .outputOptions([
            '-map [final]',
            '-c:v libx264',
            '-t ' + duration,
            '-pix_fmt yuv420p',
            '-r 30'
          ])
          .output(outputPath)
          .on('end', () => {
            // Clean up temp files
            tempImages.forEach(imagePath => {
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            });
            console.log(`✅ Generated slideshow video: ${path.basename(outputPath)}`);
            resolve(outputPath);
          })
          .on('error', (err: any) => {
            console.error('FFmpeg slideshow error:', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      // Clean up temp files on error
      tempImages.forEach(imagePath => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
      throw error;
    }
  }

  private async createLogoRevealVideo(
    text: string,
    outputPath: string,
    duration: number,
    size: 'square' | 'landscape' | 'portrait'
  ): Promise<string> {
    const dimensions = this.getDimensions(size);
    const tempBgPath = path.join(this.outputDir, `temp-logo-bg-${Date.now()}.png`);

    try {
      // Create branded background
      await this.createBackgroundImage(tempBgPath, dimensions.width, dimensions.height, text);

      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(tempBgPath)
          .inputOptions(['-loop 1'])
          .input(this.logoPath)
          .inputOptions(['-loop 1'])
          .complexFilter([
            '[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[bg]',
            '[1:v]scale=200:200:force_original_aspect_ratio=decrease[logo]',
            '[bg][logo]overlay=(W-w)/2:(H-h)/2:enable=\'between(t,2,' + (duration-1) + ')\''
          ])
          .outputOptions([
            '-c:v libx264',
            '-t ' + duration,
            '-pix_fmt yuv420p',
            '-r 30'
          ])
          .output(outputPath)
          .on('end', () => {
            // Clean up temp file
            if (fs.existsSync(tempBgPath)) {
              fs.unlinkSync(tempBgPath);
            }
            console.log(`✅ Generated logo reveal video: ${path.basename(outputPath)}`);
            resolve(outputPath);
          })
          .on('error', (err: any) => {
            console.error('FFmpeg logo reveal error:', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(tempBgPath)) {
        fs.unlinkSync(tempBgPath);
      }
      throw error;
    }
  }

  private async createBackgroundImage(
    outputPath: string,
    width: number,
    height: number,
    text: string,
    variation = 0
  ): Promise<void> {
    // Create professional background with text content
    const colors = [
      ['#1a1a2e', '#16213e'],
      ['#16213e', '#0f3460'], 
      ['#0f3460', '#533483'],
      ['#533483', '#8e44ad'],
      ['#8e44ad', '#be8d00']
    ];
    
    const colorPair = colors[variation % colors.length];
    
    // Wrap text intelligently
    const wrapText = (text: string, maxChars: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + ' ' + word).length <= maxChars) {
          currentLine = currentLine ? currentLine + ' ' + word : word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };
    
    const textLines = wrapText(text, 35);
    const lineHeight = 30;
    const startY = height/2 - ((textLines.length - 1) * lineHeight / 2);
    
    // Create professional video background with dynamic content
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
          </linearGradient>
          <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#grad)" />
        
        <!-- Geometric elements for visual interest -->
        <circle cx="${width*0.15}" cy="${height*0.15}" r="40" fill="#FFD700" opacity="0.1"/>
        <circle cx="${width*0.85}" cy="${height*0.85}" r="60" fill="#0ea5e9" opacity="0.1"/>
        <rect x="0" y="${height-120}" width="${width}" height="3" fill="#FFD700" opacity="0.4"/>
        <rect x="0" y="120" width="${width}" height="3" fill="#FFD700" opacity="0.4"/>
        
        <!-- Company branding -->
        <text x="${width/2}" y="80" text-anchor="middle" fill="white" font-size="36" font-family="Arial, sans-serif" font-weight="bold">
          COMMERTIZE
        </text>
        <text x="${width/2}" y="110" text-anchor="middle" fill="url(#textGrad)" font-size="16" font-family="Arial, sans-serif">
          Commercial Real Estate Tokenization
        </text>
        
        <!-- Dynamic content text -->
        ${textLines.map((line, index) => `
          <text x="${width/2}" y="${startY + index * lineHeight}" text-anchor="middle" fill="white" font-size="18" font-family="Arial, sans-serif" font-weight="500">
            ${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </text>
        `).join('')}
        
        <!-- Call to action -->
        <text x="${width/2}" y="${height - 60}" text-anchor="middle" fill="#FFD700" font-size="20" font-family="Arial, sans-serif" font-weight="bold">
          Commertize.com
        </text>
        
        <!-- Visual elements -->
        <rect x="${width-150}" y="${height-100}" width="130" height="80" fill="none" stroke="#FFD700" stroke-width="2" opacity="0.3" rx="8"/>
        <text x="${width-85}" y="${height-55}" text-anchor="middle" fill="white" font-size="12" font-family="Arial, sans-serif" font-weight="bold">
          TOKENIZATION
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
      
    console.log(`🎨 Created dynamic video background with content: ${text.substring(0, 30)}...`);
  }

  private getDimensions(size: 'square' | 'landscape' | 'portrait') {
    switch (size) {
      case 'square':
        return { width: 720, height: 720 };
      case 'landscape':
        return { width: 1280, height: 720 };
      case 'portrait':
        return { width: 720, height: 1280 };
      default:
        return { width: 720, height: 720 };
    }
  }

  private escapeText(text: string): string {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/:/g, '\\:');
  }

  async generateSimpleGif(text: string, duration = 3): Promise<string> {
    const timestamp = Date.now();
    const filename = `x-gif-${timestamp}.gif`;
    const outputPath = path.join(this.outputDir, filename);
    const tempImagePath = path.join(this.outputDir, `temp-gif-bg-${timestamp}.png`);

    try {
      // Create background
      await this.createBackgroundImage(tempImagePath, 720, 720, text);

      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(tempImagePath)
          .inputOptions(['-loop 1', '-t ' + duration])
          .videoFilters(['scale=720:720', 'fps=10'])
          .outputOptions([
            '-gifflags +transdiff',
            '-y'
          ])
          .output(outputPath)
          .on('start', (commandLine) => {
            console.log(`🎨 Creating GIF: ${path.basename(outputPath)}`);
          })
          .on('end', () => {
            // Clean up temp file
            if (fs.existsSync(tempImagePath)) {
              fs.unlinkSync(tempImagePath);
            }
            console.log(`✅ Generated GIF: ${path.basename(outputPath)}`);
            resolve(outputPath);
          })
          .on('error', (err: any) => {
            console.error('FFmpeg GIF error:', err);
            // Clean up temp file on error
            if (fs.existsSync(tempImagePath)) {
              fs.unlinkSync(tempImagePath);
            }
            reject(err);
          })
          .run();
      });
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
      throw error;
    }
  }

  private async addAudioToVideo(videoPath: string, duration: number): Promise<void> {
    try {
      // Generate a simple audio tone for professional sound
      const tempAudioPath = videoPath.replace('.mp4', '_audio.wav');
      const videoWithAudioPath = videoPath.replace('.mp4', '_with_audio.mp4');
      
      // Create a subtle professional audio track using FFmpeg tone generator
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(`sine=frequency=440:sample_rate=48000:duration=${duration}`)
          .inputOptions(['-f lavfi'])
          .outputOptions(['-ac 2', '-ar 48000'])
          .audioFilters([
            'volume=0.1', // Very quiet background tone
            'highpass=f=200', // Professional frequency filtering
            'lowpass=f=2000'
          ])
          .output(tempAudioPath)
          .on('end', () => resolve())
          .on('error', (err: any) => reject(err))
          .run();
      });

      // Combine video with audio
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(videoPath)
          .input(tempAudioPath)
          .outputOptions([
            '-c:v copy', // Copy video stream
            '-c:a aac', // Encode audio
            '-strict experimental',
            '-shortest' // Match shortest stream duration
          ])
          .output(videoWithAudioPath)
          .on('end', () => {
            // Replace original video with audio version
            if (fs.existsSync(videoWithAudioPath)) {
              fs.renameSync(videoWithAudioPath, videoPath);
            }
            // Clean up temp audio file
            if (fs.existsSync(tempAudioPath)) {
              fs.unlinkSync(tempAudioPath);
            }
            resolve();
          })
          .on('error', (err: any) => {
            // Clean up temp files on error
            if (fs.existsSync(tempAudioPath)) {
              fs.unlinkSync(tempAudioPath);
            }
            if (fs.existsSync(videoWithAudioPath)) {
              fs.unlinkSync(videoWithAudioPath);
            }
            reject(err);
          })
          .run();
      });

    } catch (error) {
      console.error('Audio generation failed:', error);
      throw error;
    }
  }
}

export default new VideoGenerator();