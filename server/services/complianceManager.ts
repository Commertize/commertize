interface ComplianceRule {
  id: string;
  description: string;
  type: 'GDPR' | 'CCPA' | 'CAN_SPAM' | 'TCPA' | 'SEC';
  severity: 'warning' | 'error' | 'critical';
  checkFunction: (data: any) => boolean;
}

interface ComplianceViolation {
  ruleId: string;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  data: any;
  timestamp: string;
}

interface OptInPreference {
  email: string;
  optInDate: string;
  source: string;
  preferences: {
    emailMarketing: boolean;
    smsMarketing: boolean;
    callMarketing: boolean;
  };
  ipAddress?: string;
  userAgent?: string;
}

export class ComplianceManager {
  private optInRecords: OptInPreference[] = [];
  private violations: ComplianceViolation[] = [];
  
  private complianceRules: ComplianceRule[] = [
    {
      id: 'GDPR_CONSENT',
      description: 'GDPR requires explicit consent for data processing',
      type: 'GDPR',
      severity: 'critical',
      checkFunction: (data) => this.hasValidConsent(data.email)
    },
    {
      id: 'CCPA_OPT_OUT',
      description: 'CCPA requires opt-out mechanism',
      type: 'CCPA', 
      severity: 'error',
      checkFunction: (data) => this.hasOptOutMechanism(data)
    },
    {
      id: 'CAN_SPAM_UNSUBSCRIBE',
      description: 'CAN-SPAM requires unsubscribe link in emails',
      type: 'CAN_SPAM',
      severity: 'error',
      checkFunction: (data) => this.hasUnsubscribeLink(data.emailContent)
    },
    {
      id: 'TCPA_CONSENT',
      description: 'TCPA requires written consent for automated calls/texts',
      type: 'TCPA',
      severity: 'critical',
      checkFunction: (data) => this.hasCallConsent(data.phoneNumber)
    },
    {
      id: 'SEC_NO_GUARANTEES',
      description: 'SEC prohibits guaranteed return promises',
      type: 'SEC',
      severity: 'critical',
      checkFunction: (data) => this.noGuaranteedReturns(data.content)
    }
  ];

  /**
   * Record opt-in consent for lead
   */
  recordOptIn(preference: OptInPreference): void {
    // Remove existing record for this email
    this.optInRecords = this.optInRecords.filter(record => 
      record.email !== preference.email
    );
    
    // Add new record
    this.optInRecords.push({
      ...preference,
      optInDate: new Date().toISOString()
    });
    
    console.log(`✅ Consent recorded for ${preference.email}`);
  }

  /**
   * Check if email has valid marketing consent
   */
  hasValidConsent(email: string): boolean {
    const record = this.optInRecords.find(r => r.email === email);
    if (!record) return false;
    
    // Check if consent is recent (within 2 years for GDPR)
    const consentAge = Date.now() - new Date(record.optInDate).getTime();
    const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
    
    return consentAge < twoYears && record.preferences.emailMarketing;
  }

  /**
   * Check calling consent (TCPA compliance)
   */
  hasCallConsent(phoneNumber: string): boolean {
    const record = this.optInRecords.find(r => 
      r.preferences.callMarketing === true
    );
    return !!record;
  }

  /**
   * Validate outreach content for compliance
   */
  validateOutreach(type: 'email' | 'call' | 'sms', data: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    
    for (const rule of this.complianceRules) {
      try {
        const isCompliant = rule.checkFunction(data);
        
        if (!isCompliant) {
          const violation: ComplianceViolation = {
            ruleId: rule.id,
            severity: rule.severity,
            message: rule.description,
            data: { type, ...data },
            timestamp: new Date().toISOString()
          };
          
          violations.push(violation);
          this.violations.push(violation);
        }
      } catch (error) {
        console.error(`Compliance check failed for rule ${rule.id}:`, error);
      }
    }
    
    return violations;
  }

  /**
   * Handle unsubscribe requests
   */
  handleUnsubscribe(email: string, type: 'email' | 'sms' | 'call' | 'all'): boolean {
    const recordIndex = this.optInRecords.findIndex(r => r.email === email);
    
    if (recordIndex === -1) {
      console.log(`No opt-in record found for ${email}`);
      return false;
    }
    
    const record = this.optInRecords[recordIndex];
    
    switch (type) {
      case 'email':
        record.preferences.emailMarketing = false;
        break;
      case 'sms':
        record.preferences.smsMarketing = false;
        break;
      case 'call':
        record.preferences.callMarketing = false;
        break;
      case 'all':
        record.preferences = {
          emailMarketing: false,
          smsMarketing: false,
          callMarketing: false
        };
        break;
    }
    
    console.log(`✅ Unsubscribed ${email} from ${type}`);
    return true;
  }

  /**
   * Get compliance status for reporting
   */
  getComplianceStatus(): {
    totalOptIns: number;
    activeConsents: number;
    violations: number;
    criticalViolations: number;
    dataRetentionItems: number;
  } {
    const activeConsents = this.optInRecords.filter(r => 
      r.preferences.emailMarketing || 
      r.preferences.smsMarketing || 
      r.preferences.callMarketing
    ).length;
    
    const criticalViolations = this.violations.filter(v => 
      v.severity === 'critical'
    ).length;
    
    return {
      totalOptIns: this.optInRecords.length,
      activeConsents,
      violations: this.violations.length,
      criticalViolations,
      dataRetentionItems: this.getDataRetentionItems().length
    };
  }

  /**
   * Clean up old data (GDPR/CCPA requirement)
   */
  cleanupOldData(): number {
    const retentionItems = this.getDataRetentionItems();
    let cleanedCount = 0;
    
    // Remove opt-in records older than 3 years with no activity
    const threeYears = 3 * 365 * 24 * 60 * 60 * 1000;
    const cutoffDate = Date.now() - threeYears;
    
    this.optInRecords = this.optInRecords.filter(record => {
      const recordAge = Date.now() - new Date(record.optInDate).getTime();
      const shouldKeep = recordAge < cutoffDate;
      
      if (!shouldKeep) {
        cleanedCount++;
        console.log(`🗑️ Cleaned up old consent record: ${record.email}`);
      }
      
      return shouldKeep;
    });
    
    // Clean up old violations (keep for audit trail - 1 year)
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const violationCutoff = Date.now() - oneYear;
    
    this.violations = this.violations.filter(violation => {
      const violationAge = Date.now() - new Date(violation.timestamp).getTime();
      return violationAge < violationCutoff;
    });
    
    return cleanedCount;
  }

  /**
   * Generate compliance audit report
   */
  generateComplianceReport(): any {
    const status = this.getComplianceStatus();
    const recentViolations = this.violations
      .filter(v => {
        const age = Date.now() - new Date(v.timestamp).getTime();
        return age < (30 * 24 * 60 * 60 * 1000); // Last 30 days
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    
    return {
      generatedAt: new Date().toISOString(),
      summary: status,
      recentViolations: recentViolations.slice(0, 10),
      recommendations: this.getComplianceRecommendations(),
      dataRetentionSchedule: this.getDataRetentionSchedule()
    };
  }

  // Private helper methods
  private hasOptOutMechanism(data: any): boolean {
    // Check if unsubscribe mechanism is available
    return data.emailContent?.includes('unsubscribe') || 
           data.emailContent?.includes('opt-out');
  }

  private hasUnsubscribeLink(emailContent: string): boolean {
    if (!emailContent) return false;
    return emailContent.includes('unsubscribe') && 
           (emailContent.includes('http') || emailContent.includes('mailto:'));
  }

  private noGuaranteedReturns(content: string): boolean {
    if (!content) return true;
    
    const prohibitedTerms = [
      'guaranteed return',
      'guaranteed profit',
      'risk-free investment',
      'guaranteed income',
      'no risk'
    ];
    
    const lowerContent = content.toLowerCase();
    return !prohibitedTerms.some(term => lowerContent.includes(term));
  }

  private getDataRetentionItems(): any[] {
    const threeYears = 3 * 365 * 24 * 60 * 60 * 1000;
    const cutoffDate = Date.now() - threeYears;
    
    return this.optInRecords.filter(record => {
      const recordAge = Date.now() - new Date(record.optInDate).getTime();
      return recordAge > cutoffDate;
    });
  }

  private getComplianceRecommendations(): string[] {
    const recommendations = [];
    const status = this.getComplianceStatus();
    
    if (status.criticalViolations > 0) {
      recommendations.push("Address critical compliance violations immediately");
    }
    
    if (status.violations > 10) {
      recommendations.push("Review and improve compliance checking procedures");
    }
    
    if (status.dataRetentionItems > 50) {
      recommendations.push("Schedule data cleanup to meet retention policies");
    }
    
    recommendations.push("Regular compliance training for team members");
    recommendations.push("Quarterly audit of opt-in procedures");
    
    return recommendations;
  }

  private getDataRetentionSchedule(): any[] {
    const schedule = [];
    const retentionItems = this.getDataRetentionItems();
    
    if (retentionItems.length > 0) {
      schedule.push({
        action: "Clean up old opt-in records",
        itemCount: retentionItems.length,
        deadline: "Within 30 days",
        regulation: "GDPR Article 17"
      });
    }
    
    return schedule;
  }
}

export const complianceManager = new ComplianceManager();