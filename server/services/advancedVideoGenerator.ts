import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AdvancedVideoOptions {
  topic: string;
  duration?: number;
  includeVoiceover?: boolean;
  style?: 'professional' | 'dynamic' | 'cinematic';
}

export class AdvancedVideoGenerator {
  private outputDir = path.join(process.cwd(), 'public', 'generated-videos');
  private tempDir = path.join(this.outputDir, 'temp');

  constructor() {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    [this.outputDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async generateProfessionalVideo(options: AdvancedVideoOptions): Promise<string> {
    const { topic, duration = 20, includeVoiceover = true, style = 'professional' } = options;
    const timestamp = Date.now();
    const outputPath = path.join(this.outputDir, `professional-${timestamp}.mp4`);

    console.log(`🎬 Creating professional video: ${topic}`);
    console.log(`⏱️ Duration: ${duration}s, Style: ${style}, Voiceover: ${includeVoiceover}`);

    try {
      // Generate script for the video
      const script = await this.generateVideoScript(topic, duration);
      console.log(`📝 Generated script: ${script.substring(0, 100)}...`);

      // Generate multiple background images for visual variety
      const backgroundImages = await this.generateBackgroundImages(topic, 4);
      console.log(`🎨 Generated ${backgroundImages.length} background images`);

      // Create voiceover if requested
      let audioPath: string | null = null;
      if (includeVoiceover) {
        audioPath = await this.generateVoiceover(script, timestamp);
        console.log(`🎙️ Generated voiceover: ${audioPath}`);
      }

      // Create the video with advanced effects
      const videoPath = await this.createAdvancedVideo({
        script,
        backgroundImages,
        audioPath,
        outputPath,
        duration,
        style
      });

      // Clean up temporary files
      this.cleanupTempFiles(backgroundImages, audioPath);

      console.log(`✅ Professional video completed: ${path.basename(videoPath)}`);
      return videoPath;

    } catch (error) {
      console.error('❌ Advanced video generation failed:', error);
      throw error;
    }
  }

  private async generateVideoScript(topic: string, duration: number): Promise<string> {
    const wordsPerMinute = 150;
    const targetWords = Math.floor((duration / 60) * wordsPerMinute);

    const prompt = `Create a professional script for a ${duration}-second video about "${topic}". 
    The script should be approximately ${targetWords} words and include:
    - Clear explanation of commercial real estate tokenization
    - Benefits like fractional ownership, liquidity, and accessibility
    - Professional tone suitable for investors
    - Call to action for Commertize.com
    - Natural pacing for voiceover narration`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 500
    });

    return response.choices[0].message.content || "Commercial real estate tokenization transforms traditional property investment into digital shares, enabling fractional ownership and instant liquidity for all investors.";
  }

  private async generateBackgroundImages(topic: string, count: number): Promise<string[]> {
    const images: string[] = [];
    const prompts = [
      "Professional modern office building exterior, glass facade, urban cityscape, commercial real estate photography style",
      "Digital blockchain visualization with golden tokens, professional tech graphics, investment concept",
      "Diverse group of investors reviewing documents in modern office, professional business setting",
      "Financial charts and graphs overlay on city buildings, investment analytics visualization"
    ];

    for (let i = 0; i < count; i++) {
      try {
        const imagePath = path.join(this.tempDir, `bg-${Date.now()}-${i}.png`);
        const prompt = prompts[i % prompts.length];

        console.log(`🎨 Generating image ${i + 1}: ${prompt.substring(0, 50)}...`);

        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          size: "1024x1024",
          quality: "standard",
          n: 1
        });

        // Download the image
        const imageUrl = response.data[0].url;
        if (imageUrl) {
          const downloadResponse = await fetch(imageUrl);
          const buffer = await downloadResponse.arrayBuffer();
          fs.writeFileSync(imagePath, Buffer.from(buffer));
          images.push(imagePath);
          console.log(`✅ Image ${i + 1} generated: ${path.basename(imagePath)}`);
        }
      } catch (error) {
        console.error(`❌ Failed to generate image ${i + 1}:`, error);
        // Create fallback colored background
        const fallbackPath = await this.createFallbackImage(i, topic);
        images.push(fallbackPath);
      }
    }

    return images;
  }

  private async createFallbackImage(index: number, topic: string): Promise<string> {
    const imagePath = path.join(this.tempDir, `fallback-${Date.now()}-${index}.png`);
    const colors = ['#1a365d', '#2d3748', '#1a202c', '#2a4365'];
    const color = colors[index % colors.length];

    const command = `ffmpeg -f lavfi -i color=c=${color}:s=1024x1024:d=1 -vf "drawtext=text='COMMERTIZE\\nTOKENIZATION':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" -frames:v 1 -y ${imagePath}`;

    await execPromise(command);
    return imagePath;
  }

  private async generateVoiceover(script: string, timestamp: number): Promise<string> {
    const audioPath = path.join(this.tempDir, `voiceover-${timestamp}.wav`);

    try {
      // Try using festival text-to-speech (if available)
      const command = `echo "${script.replace(/"/g, '\\"')}" | festival --tts --pipe > ${audioPath}`;
      await execPromise(command);
      
      if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 0) {
        console.log('✅ Voiceover generated with Festival');
        return audioPath;
      }
    } catch (error) {
      console.log('⚠️ Festival not available, creating alternative audio');
    }

    // Fallback: Create tone sequence that matches speech rhythm
    const words = script.split(' ').length;
    const audioDuration = Math.ceil(words / 2.5); // Approximate speaking pace

    const toneCommand = `ffmpeg -f lavfi -i "sine=frequency=220:duration=${audioDuration}" -af "volume=0.3,tremolo=5:0.7" -y ${audioPath}`;
    await execPromise(toneCommand);

    console.log('✅ Alternative audio track generated');
    return audioPath;
  }

  private async createAdvancedVideo(params: {
    script: string;
    backgroundImages: string[];
    audioPath: string | null;
    outputPath: string;
    duration: number;
    style: string;
  }): Promise<string> {
    const { script, backgroundImages, audioPath, outputPath, duration, style } = params;

    console.log('🎥 Creating advanced video with effects...');

    // Calculate timing for each scene
    const sceneCount = backgroundImages.length;
    const sceneDuration = duration / sceneCount;

    // Create complex filter chain for professional effects
    const filterComplex = this.buildAdvancedFilterChain(backgroundImages, sceneDuration, script, style);

    let command = `ffmpeg`;

    // Add background images as inputs
    backgroundImages.forEach(image => {
      command += ` -loop 1 -t ${sceneDuration + 1} -i "${image}"`;
    });

    // Add audio if available
    if (audioPath && fs.existsSync(audioPath)) {
      command += ` -i "${audioPath}"`;
    }

    // Add filter complex and output options
    command += ` -filter_complex "${filterComplex}"`;

    if (audioPath && fs.existsSync(audioPath)) {
      command += ` -map "[final]" -map ${backgroundImages.length}:a`;
    } else {
      command += ` -map "[final]"`;
    }

    command += ` -c:v libx264 -c:a aac -pix_fmt yuv420p -r 30 -t ${duration}`;
    command += ` -b:v 2000k -maxrate 2000k -bufsize 4000k`;
    command += ` -movflags +faststart -y "${outputPath}"`;

    console.log('🎬 Executing advanced FFmpeg command...');
    await execPromise(command);

    if (!fs.existsSync(outputPath)) {
      throw new Error('Video creation failed - output file not found');
    }

    const fileSize = fs.statSync(outputPath).size;
    console.log(`✅ Advanced video created: ${Math.round(fileSize / 1024)}KB`);

    return outputPath;
  }

  private buildAdvancedFilterChain(images: string[], sceneDuration: number, script: string, style: string): string {
    const effects = [];
    const words = script.split(' ');
    const wordsPerScene = Math.ceil(words.length / images.length);

    // Process each image with advanced effects
    images.forEach((_, index) => {
      const sceneWords = words.slice(index * wordsPerScene, (index + 1) * wordsPerScene).join(' ');
      const lines = this.splitIntoLines(sceneWords, 25); // 25 chars per line max

      let filter = `[${index}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2`;

      // Add zoom/pan effect
      filter += `,zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':d=${Math.floor(sceneDuration * 30)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720`;

      // Add text overlays for each line
      lines.forEach((line, lineIndex) => {
        const yPos = 100 + (lineIndex * 50);
        filter += `,drawtext=text='${line.replace(/'/g, "\\'")}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontsize=36:fontcolor=white:x=(w-text_w)/2:y=${yPos}:enable='between(t,${index * sceneDuration},${(index + 1) * sceneDuration})'`;
      });

      // Add fade transitions
      if (index === 0) {
        filter += `,fade=in:0:30`;
      }
      if (index === images.length - 1) {
        filter += `,fade=out:${Math.floor((sceneDuration - 1) * 30)}:30`;
      }

      // Add Commertize branding
      filter += `,drawtext=text='COMMERTIZE.COM':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontsize=24:fontcolor=gold:x=w-text_w-20:y=h-40:enable='between(t,${index * sceneDuration},${(index + 1) * sceneDuration})'`;

      effects.push(`${filter}[v${index}]`);
    });

    // Concatenate all scenes
    const concatInputs = images.map((_, i) => `[v${i}]`).join('');
    effects.push(`${concatInputs}concat=n=${images.length}:v=1:a=0[final]`);

    return effects.join(';');
  }

  private splitIntoLines(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + ' ' + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  private cleanupTempFiles(backgroundImages: string[], audioPath: string | null) {
    backgroundImages.forEach(imagePath => {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }
}