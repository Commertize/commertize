import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

interface FundingStatusModalProps {
  propertyId: string;
  onClose: () => void;
}

interface FundingStatusData {
  totalRaised: number;
  targetRaise: number;
  progressPercentage: number;
  investorCount: number;
  avgInvestment: number;
  milestones: Array<{
    name: string;
    completed: boolean;
  }>;
}

export default function FundingStatusModal({ propertyId, onClose }: FundingStatusModalProps) {
  const { data: fundingData } = useQuery<FundingStatusData>({
    queryKey: ['funding-status', propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/sponsor-dashboard/funding-status?property_id=${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch funding status');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-logo font-light text-black">Funding Status Overview</CardTitle>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {fundingData ? (
            <>
              <div className="text-center">
                <div className="text-4xl font-logo font-light text-[#be8d00] mb-2">
                  ${fundingData.totalRaised.toLocaleString()}
                </div>
                <p className="text-gray-600 mb-1">Total Raised</p>
                <p className="text-sm text-gray-500">
                  {fundingData.progressPercentage}% of ${fundingData.targetRaise.toLocaleString()} target
                </p>
                <Progress value={fundingData.progressPercentage} className="w-full mt-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-xl font-logo font-light text-[#be8d00]">
                    {fundingData.investorCount}
                  </div>
                  <div className="text-sm text-gray-600">Total Investors</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-xl font-logo font-light text-[#be8d00]">
                    ${fundingData.avgInvestment.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Investment</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-logo font-light text-black">Funding Milestones</h4>
                <div className="space-y-2">
                  {fundingData.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{milestone.name}</span>
                      <Badge className={milestone.completed ? "bg-[#be8d00] text-white" : ""} variant={milestone.completed ? "default" : "outline"}>
                        {milestone.completed ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading funding data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}