import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Feature Image",
  placeholder = "Upload a feature image for this article",
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `news-feature-images/${timestamp}-${file.name}`;
      console.log('Uploading file to:', filename);
      const storageRef = ref(storage, filename);
      
      // Upload the file
      console.log('Starting upload...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Upload successful, getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      
      onChange(downloadURL);

      toast({
        title: "Success",
        description: "Feature image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        serverResponse: error.serverResponse
      });
      toast({
        title: "Error",
        description: `Failed to upload image: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      {value ? (
        <div className="relative">
          <img 
            src={value} 
            alt="Feature image preview" 
            className="w-full h-48 object-cover rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">{placeholder}</p>
            <div className="flex flex-col items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="feature-image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('feature-image-upload')?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;