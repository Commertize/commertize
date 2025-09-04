import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Twitter, TrendingUp, Users, MessageCircle, BarChart3, Send, Bot, Calendar } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

interface XMetrics {
  followers: number;
  following: number;
  tweets: number;
  listed: number;
}

interface XStatus {
  isRunning: boolean;
  xApiReady: boolean;
  scheduledPosts: Array<{
    time: string;
    type: string;
  }>;
}

export default function XManagement() {
  const { toast } = useToast();
  const [postText, setPostText] = useState('');
  const [marketTopic, setMarketTopic] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [enablePoll, setEnablePoll] = useState(false);

  // Fetch X status
  const { data: xStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/x/status'],
    queryFn: async () => {
      const response = await fetch('/api/x/status');
      if (!response.ok) throw new Error('Failed to fetch X status');
      const data = await response.json();
      return data.data as XStatus;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch X metrics
  const { data: xMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/x/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/x/metrics');
      if (!response.ok) throw new Error('Failed to fetch X metrics');
      const data = await response.json();
      return data.data as XMetrics;
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Post tweet mutation
  const postTweetMutation = useMutation({
    mutationFn: async (data: { text: string; poll?: { options: string[], duration_minutes: number } }) => {
      const response = await fetch('/api/x/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to post tweet');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tweet Posted",
        description: "Your tweet has been posted successfully to X.",
      });
      setPostText('');
      setPollOptions(['', '']);
      setEnablePoll(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post tweet",
        variant: "destructive",
      });
    }
  });

  // Market insight mutation
  const marketInsightMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await fetch('/api/x/market-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (!response.ok) throw new Error('Failed to generate market insight');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Market Insight Posted",
        description: "AI-generated market insight has been posted to X.",
      });
      setMarketTopic('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate market insight",
        variant: "destructive",
      });
    }
  });

  const handlePostTweet = () => {
    if (!postText.trim()) {
      toast({
        title: "Error",
        description: "Please enter tweet text",
        variant: "destructive",
      });
      return;
    }

    const postData: any = { text: postText };
    
    if (enablePoll && pollOptions.filter(opt => opt.trim()).length >= 2) {
      postData.poll = {
        options: pollOptions.filter(opt => opt.trim()),
        duration_minutes: 1440 // 24 hours
      };
    }

    postTweetMutation.mutate(postData);
  };

  const handleMarketInsight = () => {
    if (!marketTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a market topic",
        variant: "destructive",
      });
      return;
    }

    marketInsightMutation.mutate(marketTopic);
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-light">Automation Status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={xStatus?.isRunning ? "default" : "destructive"}>
                {statusLoading ? "Loading..." : xStatus?.isRunning ? "Active" : "Inactive"}
              </Badge>
              <Badge variant={xStatus?.xApiReady ? "default" : "outline"}>
                {xStatus?.xApiReady ? "API Ready" : "API Not Configured"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-light">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light">
              {metricsLoading ? "..." : xMetrics?.followers?.toLocaleString() || "0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-light">Following</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light">
              {metricsLoading ? "..." : xMetrics?.following?.toLocaleString() || "0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-light">Total Tweets</CardTitle>
            <Twitter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light">
              {metricsLoading ? "..." : xMetrics?.tweets?.toLocaleString() || "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="font-light">Compose Tweet</CardTitle>
              <CardDescription>
                Create and post custom content to X immediately
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tweet-text">Tweet Text</Label>
                <Textarea
                  id="tweet-text"
                  placeholder="What's happening in CRE tokenization today?"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  maxLength={280}
                  rows={4}
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {postText.length}/280 characters
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-poll"
                  checked={enablePoll}
                  onCheckedChange={setEnablePoll}
                />
                <Label htmlFor="enable-poll">Add Poll</Label>
              </div>

              {enablePoll && (
                <div className="space-y-2">
                  <Label>Poll Options</Label>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                      />
                      {pollOptions.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePollOption(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <Button variant="outline" size="sm" onClick={addPollOption}>
                      Add Option
                    </Button>
                  )}
                </div>
              )}

              <Button 
                onClick={handlePostTweet} 
                disabled={postTweetMutation.isPending || !postText.trim()}
                className="w-full"
              >
                {postTweetMutation.isPending ? (
                  "Posting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Tweet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="font-light">Automated Schedule</CardTitle>
              <CardDescription>
                RUNE.CTZ follows your content strategy automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {xStatus?.scheduledPosts?.map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-light">{post.type}</div>
                        <div className="text-sm text-muted-foreground">{post.time}</div>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="font-light">AI Market Insights</CardTitle>
              <CardDescription>
                Generate and post AI-powered market analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="market-topic">Market Topic</Label>
                <Input
                  id="market-topic"
                  placeholder="e.g., 'Rising cap rates impact on CRE tokenization'"
                  value={marketTopic}
                  onChange={(e) => setMarketTopic(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleMarketInsight}
                disabled={marketInsightMutation.isPending || !marketTopic.trim()}
                className="w-full"
              >
                {marketInsightMutation.isPending ? (
                  "Generating..."
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate & Post Market Insight
                  </>
                )}
              </Button>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-light mb-2">Quick Topics</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "CRE Tokenization Trends",
                    "Office Space Market Analysis", 
                    "Interest Rate Impact",
                    "Blockchain Adoption",
                    "Liquidity Market Updates",
                    "Investment Opportunities"
                  ].map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      onClick={() => setMarketTopic(topic)}
                      className="text-left font-light"
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="font-light">X Analytics</CardTitle>
              <CardDescription>
                Track your X account performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-light">Audience Growth</span>
                  </div>
                  <div className="text-2xl font-light">
                    {xMetrics?.followers || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Followers</div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="font-light">Engagement</span>
                  </div>
                  <div className="text-2xl font-light">Active</div>
                  <div className="text-sm text-muted-foreground">Auto-responses enabled</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-light mb-3">Content Strategy Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-light">Daily Content Generation</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-light">Engagement Responses</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-light">Weekly Analytics</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}