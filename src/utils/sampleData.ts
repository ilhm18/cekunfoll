import { AnalysisResult, InstagramUser } from '../types';
import { computeAnalysis } from './instagramParser';

const demoFollowing: InstagramUser[] = [
  { username: 'demounfoll', dateStr: '12 Jan 2024', timestamp: 1705017600 },
  { username: 'demomutuals', dateStr: '15 Jan 2024', timestamp: 1705276800 },
];

const demoFollowers: InstagramUser[] = [
  { username: 'demofollower', dateStr: '14 Feb 2024', timestamp: 1707868800 },
  { username: 'demomutuals', dateStr: '15 Jan 2024', timestamp: 1705276800 },
];

export function getSampleAnalysis(): AnalysisResult {
  return computeAnalysis(demoFollowing, demoFollowers, 'demo');
}
