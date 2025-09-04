import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileText, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LeadImport = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setImportResults(result);
        setPreviewData(result.preview || []);
        
        toast({
          title: "Import Successful!",
          description: `${result.imported} contacts added to RUNE.CTZ database.`,
        });
      } else {
        throw new Error('Failed to import leads');
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import contacts. Please check file format.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,phone,company,title,propertyType,investmentRange,location,leadSource,notes
John,Smith,john.smith@example.com,(555) 123-4567,Smith Properties,CEO,office,1m-5m,"New York, NY",networking,Met at CRE conference
Jane,Doe,jane.doe@example.com,(555) 987-6543,Doe Investments,Managing Director,multifamily,5m-10m,"Los Angeles, CA",linkedin,LinkedIn connection`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-logo font-light text-foreground mb-4">
            Bulk Lead Import
          </h1>
          <p className="text-xl text-foreground/70">
            Upload CSV or Excel files to add multiple contacts to RUNE.CTZ database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-primary" />
                Upload Contact List
              </CardTitle>
              <CardDescription>
                Import contacts from CSV or Excel files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <p className="text-foreground/70 mb-4">
                  Drop your CSV or Excel file here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    disabled={isUploading}
                    className="bg-gradient-to-r from-primary to-yellow-600 hover:from-primary/90 hover:to-yellow-600/90"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                </label>
              </div>

              {/* Template Download */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800 mb-1">
                      Need a template?
                    </h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Download our CSV template with the correct column format
                    </p>
                    <Button
                      onClick={downloadTemplate}
                      variant="outline"
                      size="sm"
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import Results */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Check className="h-6 w-6 text-green-600" />
                Import Results
              </CardTitle>
              <CardDescription>
                View the status of your last import
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importResults ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {importResults.imported}
                      </div>
                      <div className="text-sm text-green-700">Imported</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {importResults.failed}
                      </div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                  </div>
                  
                  {importResults.errors && importResults.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-800 mb-2">Errors:</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {importResults.errors.map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground/50">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No imports yet. Upload a file to see results.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Required Fields */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              CSV Column Requirements
            </CardTitle>
            <CardDescription>
              Your CSV file should include these columns for optimal import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Required Fields</h4>
                <div className="space-y-1">
                  <Badge variant="destructive">firstName</Badge>
                  <Badge variant="destructive">lastName</Badge>
                  <Badge variant="destructive">email</Badge>
                  <Badge variant="destructive">phone</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Professional Info</h4>
                <div className="space-y-1">
                  <Badge variant="secondary">company</Badge>
                  <Badge variant="secondary">title</Badge>
                  <Badge variant="secondary">location</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">CRE Specific</h4>
                <div className="space-y-1">
                  <Badge variant="outline">propertyType</Badge>
                  <Badge variant="outline">investmentRange</Badge>
                  <Badge variant="outline">leadSource</Badge>
                  <Badge variant="outline">notes</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Data */}
        {previewData.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Import Preview</CardTitle>
              <CardDescription>
                First 5 records from your uploaded file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Property Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 5).map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {contact.firstName} {contact.lastName}
                        </TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>{contact.company}</TableCell>
                        <TableCell>{contact.propertyType}</TableCell>
                        <TableCell>
                          <Badge variant={contact.imported ? "default" : "destructive"}>
                            {contact.imported ? "Imported" : "Failed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadImport;