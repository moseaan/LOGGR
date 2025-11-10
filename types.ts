export interface Visit {
  id: string;
  businessName: string;
  timestamp: string;
  lastModified?: string;
  contactPerson: string;
  ownerName: string;
  ownerContact?: string;
  numberOfPhones: number | null;
  estimatedMonthlyPayment: number | null;
  currentProvider: string;
  address: string;
  notes: string;
  visitType: 'Follow-Up' | 'Crawlback' | 'Call';
  revisitDate?: string;
  isRevisitSuccessful?: boolean;
}