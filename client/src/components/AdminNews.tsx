import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import { 
  Loader2, 
  Trash2, 
  Edit, 
  Plus, 
  Calendar, 
  Clock, 
  TrendingUp,
  Save,
  X,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  featured: boolean;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  readTime: string;
  imageUrl?: string;
}

export function AdminNews() {
  const { toast } = useToast();
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);

  const { data: articles = [], refetch, isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "news"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsArticle[];
    }
  });

  const createArticle = useMutation({
    mutationFn: async (articleData: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, "news"), {
        ...articleData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "News article created successfully",
      });
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error creating article:", error);
      toast({
        title: "Error",
        description: "Failed to create news article",
        variant: "destructive",
      });
    }
  });

  const updateArticle = useMutation({
    mutationFn: async (article: NewsArticle) => {
      const articleRef = doc(db, "news", article.id);
      const { id, createdAt, ...updateData } = article;
      await updateDoc(articleRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "News article updated successfully",
      });
      setEditingArticle(null);
      refetch();
    },
    onError: (error) => {
      console.error("Error updating article:", error);
      toast({
        title: "Error",
        description: "Failed to update news article",
        variant: "destructive",
      });
    }
  });

  const deleteArticle = useMutation({
    mutationFn: async (articleId: string) => {
      await deleteDoc(doc(db, "news", articleId));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "News article deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete news article",
        variant: "destructive",
      });
    }
  });

  const estimateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleCreateArticle = (articleData: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!articleData.title || !articleData.description || !articleData.content || !articleData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createArticle.mutate(articleData);
  };

  const handleUpdateArticle = (articleData: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingArticle) return;

    if (!articleData.title || !articleData.description || !articleData.content || !articleData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateArticle.mutate({
      ...editingArticle,
      ...articleData
    });
  };

  const NewsForm = ({ 
    article, 
    onSubmit, 
    isLoading 
  }: { 
    article?: NewsArticle | null; 
    onSubmit: (articleData: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>) => void;
    isLoading: boolean;
  }) => {
    const [formData, setFormData] = useState({
      title: article?.title || '',
      description: article?.description || '',
      content: article?.content || '',
      category: article?.category || '',
      featured: article?.featured || false,
      published: article?.published || false,
      imageUrl: article?.imageUrl || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        ...formData,
        readTime: estimateReadTime(formData.content)
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
            placeholder="Enter article title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
            placeholder="Brief description of the article"
            rows={3}
            required
          />
        </div>

        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) => setFormData(prev => ({...prev, imageUrl: url}))}
          label="Feature Image"
          placeholder="Upload a feature image for this article"
        />

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Market Analysis">Market Analysis</SelectItem>
              <SelectItem value="Company News">Company News</SelectItem>
              <SelectItem value="Industry Insights">Industry Insights</SelectItem>
              <SelectItem value="Investment Tips">Investment Tips</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData(prev => ({...prev, content}))}
            placeholder="Write your article content here..."
            className="min-h-96"
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({...prev, featured: checked}))}
            />
            <Label htmlFor="featured">Featured Article</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData(prev => ({...prev, published: checked}))}
            />
            <Label htmlFor="published">Publish Article</Label>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {article ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {article ? 'Update Article' : 'Create Article'}
            </>
          )}
        </Button>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">News Management</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create News Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create News Article</DialogTitle>
              <DialogDescription>
                Create a new news article that will appear on the News page
              </DialogDescription>
            </DialogHeader>
            <NewsForm 
              onSubmit={handleCreateArticle}
              isLoading={createArticle.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {articles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No news articles found. Create your first article!</p>
            </CardContent>
          </Card>
        ) : (
          articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={article.featured ? "default" : "secondary"}>
                        {article.category}
                      </Badge>
                      {article.featured && (
                        <Badge variant="outline" className="text-primary border-primary">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge variant={article.published ? "default" : "secondary"}>
                        {article.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={previewArticle?.id === article.id} onOpenChange={(open) => !open && setPreviewArticle(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPreviewArticle(article)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{article.title}</DialogTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {article.createdAt.toDate().toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {article.readTime}
                            </div>
                          </div>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{article.description}</p>
                          {article.imageUrl && (
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          )}
                          <div 
                            className="prose prose-gray max-w-none"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={editingArticle?.id === article.id} onOpenChange={(open) => !open && setEditingArticle(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingArticle(article)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit News Article</DialogTitle>
                          <DialogDescription>
                            Update the news article details
                          </DialogDescription>
                        </DialogHeader>
                        <NewsForm 
                          article={editingArticle}
                          onSubmit={handleUpdateArticle}
                          isLoading={updateArticle.isPending}
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Article</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{article.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteArticle.mutate(article.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription>{article.description}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created: {article.createdAt.toDate().toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}