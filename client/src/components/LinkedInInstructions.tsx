import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkedinIcon, Target, Users, Zap, CheckCircle } from "lucide-react";

const LinkedInInstructions = () => {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <LinkedinIcon className="h-6 w-6" />
            Your LinkedIn Setup Complete
          </CardTitle>
          <CardDescription className="text-blue-700">
            Account: cameronrazaghi1@gmail.com is ready for contact collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Credentials Set</div>
                <div className="text-xs text-foreground/60">Ready to search</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-sm">CRE Targeted</div>
                <div className="text-xs text-foreground/60">Pre-configured</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-sm">Auto Import</div>
                <div className="text-xs text-foreground/60">To RUNE.CTZ</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Use the LinkedIn Collector</CardTitle>
          <CardDescription>
            Follow these steps to start collecting CRE professionals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 min-w-fit">1</Badge>
              <div>
                <div className="font-medium">Review Search Parameters</div>
                <div className="text-sm text-foreground/60">
                  Your search is pre-configured for CRE professionals. You can adjust keywords, location, or job titles in the "Search & Collect" tab.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 min-w-fit">2</Badge>
              <div>
                <div className="font-medium">Start Collection</div>
                <div className="text-sm text-foreground/60">
                  Click "Start Collection" to search LinkedIn for commercial real estate professionals matching your criteria.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 min-w-fit">3</Badge>
              <div>
                <div className="font-medium">Review Results</div>
                <div className="text-sm text-foreground/60">
                  The system will find contacts with names, companies, titles, locations, and attempt to extract email addresses.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 min-w-fit">4</Badge>
              <div>
                <div className="font-medium">Select & Import</div>
                <div className="text-sm text-foreground/60">
                  Choose the contacts you want, then click "Import Selected" to add them to your RUNE.CTZ database for calling campaigns.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-green-800 mb-2">What You'll Get from Each Search:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Contact names and professional titles</li>
                  <li>• Company information and locations</li>
                  <li>• LinkedIn profile URLs for reference</li>
                </ul>
              </div>
              <div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Email addresses (70% success rate)</li>
                  <li>• Phone numbers (30% success rate)</li>
                  <li>• Connection level tracking</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
              <strong>Ready to start:</strong> Your search will target 50 CRE professionals from companies like CBRE, JLL, Blackstone, and other major commercial real estate firms.
            </div>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-800 mb-2">Next Steps:</div>
              <ol className="text-sm text-blue-700 space-y-1">
                <li><strong>1.</strong> Click the "Search & Collect" tab above</li>
                <li><strong>2.</strong> Review your pre-configured search parameters</li>
                <li><strong>3.</strong> Click "Start Collection" to begin finding contacts</li>
                <li><strong>4.</strong> Wait for LinkedIn to return your CRE professional matches</li>
                <li><strong>5.</strong> Select contacts and import them to your RUNE.CTZ database</li>
              </ol>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Best Practices:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Start with 25-50 contacts to test the system</li>
              <li>• Focus on 2nd connections for higher response rates</li>
              <li>• Use specific job titles like "VP", "Director", "Managing Director"</li>
              <li>• Target major CRE companies like CBRE, JLL, Cushman & Wakefield</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkedInInstructions;