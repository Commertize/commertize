import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Play, Download, Share } from 'lucide-react';

export default function VideoDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<any>(null);
  const [formData, setFormData] = useState({
    text: 'Transform your commercial real estate into digital tokens with Commertize tokenization platform.',
    mediaType: 'video',
    duration: 15
  });
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/x/test-video-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGeneratedMedia(result.data);
        toast({
          title: "Media Generated Successfully!",
          description: `${formData.mediaType.toUpperCase()} created with ${(result.data.fileSize / 1024 / 1024).toFixed(2)}MB`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePost = async () => {
    setIsPosting(true);
    try {
      const response = await fetch('/api/x/post-with-media-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.text + " #Tokenization #RealWorldAssets #CommercialRealEstate #PropTech",
          mediaType: formData.mediaType,
          duration: formData.duration
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Posted to X Successfully!",
          description: `Tweet ID: ${result.data.tweetId}`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Post Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enhanced X Media System</h1>
        <p className="text-muted-foreground">
          Test the new video and GIF generation capabilities for X posts
        </p>
        <div className="flex gap-2 mt-4">
          <Badge variant="secondary">Video Posts</Badge>
          <Badge variant="secondary">GIF Generation</Badge>
          <Badge variant="secondary">Smart Media Selection</Badge>
          <Badge variant="secondary">X Basic Plan Optimized</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Media Generation</CardTitle>
            <CardDescription>
              Create videos, GIFs, or images for X posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text">Content Text</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter your post content..."
                className="min-h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mediaType">Media Type</Label>
                <Select 
                  value={formData.mediaType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mediaType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video (15s)</SelectItem>
                    <SelectItem value="gif">GIF (3s)</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="3"
                  max="140"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full" 
              disabled={isGenerating}
            >
              <Play className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : `Generate ${formData.mediaType.toUpperCase()}`}
            </Button>
          </CardContent>
        </Card>

        {/* Preview & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Media</CardTitle>
            <CardDescription>
              Preview and post your generated content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedMedia ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {generatedMedia.mediaType.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {(generatedMedia.fileSize / 1024 / 1024).toFixed(2)}MB
                    </div>
                    <div>
                      <span className="font-medium">File:</span> {generatedMedia.filename}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge variant={generatedMedia.fileExists ? "default" : "destructive"} className="ml-1">
                        {generatedMedia.fileExists ? "Ready" : "Error"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    onClick={handlePost} 
                    disabled={isPosting || !generatedMedia.fileExists}
                    className="flex-1"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    {isPosting ? 'Posting...' : 'Post to X'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generate media to see preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Capabilities Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Enhanced X Media Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Video Generation</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 15-second promotional videos</li>
                <li>• Animated text with branding</li>
                <li>• Professional gradient backgrounds</li>
                <li>• Logo overlay integration</li>
                <li>• Multiple styles: text, slideshow, reveal</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">GIF Creation</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 3-second animated content</li>
                <li>• Optimized for engagement</li>
                <li>• Compact file sizes</li>
                <li>• Smooth animations</li>
                <li>• Professional appearance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Smart Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AI media type selection</li>
                <li>• X Basic plan optimized</li>
                <li>• Automatic fallback to images</li>
                <li>• Rate limit compliance</li>
                <li>• Professional branding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}