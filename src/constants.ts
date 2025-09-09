import { Grievance, GrievanceCategory, GrievanceStatus } from './types';

export const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: 'JSS-5821',
    category: GrievanceCategory.PIPELINE_LEAKAGE,
    summary: 'Major pipeline leak near the main market square.',
    location: 'Sector 15, Chandigarh',
    status: GrievanceStatus.IN_PROGRESS,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'JSS-5820',
    category: GrievanceCategory.NO_WATER_SUPPLY,
    summary: 'No water supply for the past 3 days in our area.',
    location: 'Aundh, Pune',
    status: GrievanceStatus.RESOLVED,
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 'JSS-5819',
    category: GrievanceCategory.WATER_QUALITY,
    summary: 'Water is muddy and has a strange smell.',
    location: 'Indiranagar, Bangalore',
    status: GrievanceStatus.OPEN,
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'JSS-5818',
    category: GrievanceCategory.BILLING_ISSUE,
    summary: 'Received an incorrect water bill for this month.',
    location: 'Koramangala, Bangalore',
    status: GrievanceStatus.CLOSED,
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
];

export const INITIAL_BOT_MESSAGE = {
    id: 1,
    text: "Welcome to Jal Shakti Sahayak! I am your AI assistant for water-related grievances. How can I help you today? You can file a new complaint, or check the status of an existing one by providing the ID.",
    sender: 'bot' as const
};