import { supportAutomationService } from '../services/supportAutomationService';

export interface LeadAnalytics {
  totalLeads: number;
  leadsWithPhone: number;
  leadsWithoutPhone: number;
  phonePercentage: number;
  phoneNumbers: string[];
  leadsByStatus: Record<string, number>;
  callableLeads: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    status: string;
  }>;
}

export function analyzeLeadDatabase(): LeadAnalytics {
  const allLeads = supportAutomationService.getAllLeads();
  
  const leadsWithPhone = allLeads.filter(lead => 
    lead.phone && 
    lead.phone.trim() !== '' && 
    lead.phone !== 'unknown'
  );
  
  const phoneNumbers = leadsWithPhone.map(lead => lead.phone);
  
  // Count leads by status
  const leadsByStatus: Record<string, number> = {};
  allLeads.forEach(lead => {
    const status = lead.status || 'new';
    leadsByStatus[status] = (leadsByStatus[status] || 0) + 1;
  });
  
  const callableLeads = leadsWithPhone.map(lead => ({
    id: lead.id,
    name: lead.name || 'Unknown',
    phone: lead.phone,
    email: lead.email || 'No email',
    status: lead.status || 'new'
  }));
  
  return {
    totalLeads: allLeads.length,
    leadsWithPhone: leadsWithPhone.length,
    leadsWithoutPhone: allLeads.length - leadsWithPhone.length,
    phonePercentage: allLeads.length > 0 ? Math.round((leadsWithPhone.length / allLeads.length) * 100) : 0,
    phoneNumbers,
    leadsByStatus,
    callableLeads
  };
}