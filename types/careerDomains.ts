// types/careerDomains.ts
export interface ICareerDomain {
  _id: string;
  name: string;
  description: string;
  skills: string[];
  projects: string[];
  tools: string[];
  roles: string[];
  averageSalary: {
    india: string;
    abroad: string;
  };
  resources: Array<{
    title: string;
    url: string;
    type?: string;
  }>;
  relatedDomains: string[];
  lastUpdated: Date;
}

export interface CreateCareerDomainFormData {
  name: string;
  description: string;
  skills: string;
  tools: string;
  projects: string;
  roles: string;
  salaryIndia: string;
  salaryAbroad: string;
  relatedDomains: string;
}

export interface ServerActionResponse {
  success: boolean;
  error?: string;
  domain?: ICareerDomain;
}

// ADD THESE NEW TYPES:
export interface BulkActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  domains?: ICareerDomain[];
  count?: number;
}

export interface CareerDomainsStats {
  totalDomains: number;
  domainsWithSalary: number;
  averageSkillsPerDomain: number;
  mostCommonSkills: string[];
}