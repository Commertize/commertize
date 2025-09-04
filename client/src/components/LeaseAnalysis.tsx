import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LeaseAnalysisProps {
  propertyId: string;
}

interface LeaseData {
  walt: number;
  tenantStrength: {
    strong: number;
    moderate: number;
    weak: number;
  };
  rolloverRisk: {
    next12Months: number;
    next24Months: number;
    next36Months: number;
  };
  concentrationRisk: {
    topTenant: number;
    top3Tenants: number;
    top5Tenants: number;
  };
  tenantDetails: Array<{
    name: string;
    strength: 'strong' | 'moderate' | 'weak';
    leaseExpiry: string;
    rentPercentage: number;
    creditRating: string;
  }>;
  riskFlags: string[];
}

export default function LeaseAnalysis({ propertyId }: LeaseAnalysisProps) {
  const { data: leaseData } = useQuery<LeaseData>({
    queryKey: ['lease-analysis', propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/commertizer-x/lease-analysis/${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch lease analysis');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000
  });

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'strong': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'moderate': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'weak': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'weak': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!leaseData) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600">Analyzing lease portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Commertizer X analysis of tenant strength, lease rollover exposure, and concentration risk factors.
      </p>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-logo font-light text-[#be8d00] mb-1">
              {leaseData.walt}
            </div>
            <div className="text-sm text-gray-600">WALT (Years)</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-logo font-light text-[#be8d00] mb-1">
              {leaseData.concentrationRisk.topTenant}%
            </div>
            <div className="text-sm text-gray-600">Top Tenant Risk</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-logo font-light text-[#be8d00] mb-1">
              {leaseData.rolloverRisk.next12Months}%
            </div>
            <div className="text-sm text-gray-600">12-Month Rollover</div>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Strength Breakdown */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-logo font-light text-black mb-3">Tenant Strength Distribution</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Strong Credit Tenants</span>
              <div className="flex items-center space-x-2">
                <Progress value={leaseData.tenantStrength.strong} className="w-20" />
                <span className="text-sm font-light text-[#be8d00]">
                  {leaseData.tenantStrength.strong}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Moderate Credit Tenants</span>
              <div className="flex items-center space-x-2">
                <Progress value={leaseData.tenantStrength.moderate} className="w-20" />
                <span className="text-sm font-light text-[#be8d00]">
                  {leaseData.tenantStrength.moderate}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Weak Credit Tenants</span>
              <div className="flex items-center space-x-2">
                <Progress value={leaseData.tenantStrength.weak} className="w-20" />
                <span className="text-sm font-light text-[#be8d00]">
                  {leaseData.tenantStrength.weak}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Tenants */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-logo font-light text-black mb-3">Key Tenants Analysis</h4>
          <div className="space-y-3">
            {leaseData.tenantDetails.slice(0, 5).map((tenant, index) => (
              <div key={index} className="flex justify-between items-center p-2 border border-gray-200 rounded">
                <div className="flex items-center space-x-3">
                  {getStrengthIcon(tenant.strength)}
                  <div>
                    <p className="font-light text-black text-sm">{tenant.name}</p>
                    <p className="text-xs text-gray-600">Expires: {tenant.leaseExpiry}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-light text-[#be8d00]">{tenant.rentPercentage}%</p>
                  <p className="text-xs text-gray-600">{tenant.creditRating}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Flags */}
      {leaseData.riskFlags.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-logo font-light text-black mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
              Risk Flags
            </h4>
            <div className="space-y-2">
              {leaseData.riskFlags.map((flag, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-gray-700">{flag}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}