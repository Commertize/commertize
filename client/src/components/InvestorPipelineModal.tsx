import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface InvestorPipelineModalProps {
  onClose: () => void;
}

interface InvestorPipelineData {
  metrics: {
    interested: number;
    qualified: number;
    committed: number;
  };
  investors: Array<{
    id: string;
    name: string;
    type: string;
    commitment: string;
    status: string;
  }>;
}

export default function InvestorPipelineModal({ onClose }: InvestorPipelineModalProps) {
  const { data: pipelineData } = useQuery<InvestorPipelineData>({
    queryKey: ['investor-pipeline'],
    queryFn: async () => {
      const response = await fetch('/api/sponsor-dashboard/investor-pipeline?sponsor_id=demo_sponsor');
      if (!response.ok) throw new Error('Failed to fetch investor pipeline');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-logo font-light text-black">Investor Pipeline</CardTitle>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-logo font-light text-[#be8d00]">
                  {pipelineData?.metrics.interested || 0}
                </div>
                <div className="text-sm text-gray-600">Interested Investors</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-logo font-light text-[#be8d00]">
                  {pipelineData?.metrics.qualified || 0}
                </div>
                <div className="text-sm text-gray-600">Qualified Leads</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-logo font-light text-[#be8d00]">
                  {pipelineData?.metrics.committed || 0}
                </div>
                <div className="text-sm text-gray-600">Active Commitments</div>
              </div>
            </div>
            <div className="space-y-3">
              {pipelineData?.investors.map((investor) => (
                <div key={investor.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-black">{investor.name}</p>
                      <p className="text-sm text-gray-600">{investor.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#be8d00]">{investor.commitment}</p>
                      <Badge variant="outline" className="text-xs">
                        {investor.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )) || <p className="text-gray-600 text-center py-4">Loading investor data...</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}