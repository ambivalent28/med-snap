import type { Guideline } from '../types';

export const mockGuidelines: Guideline[] = [
  {
    id: '1',
    user_id: 'demo-user',
    title: '2024 Diabetes Foot Care',
    category: 'Endocrinology',
    tags: ['diabetes', 'foot care', 'wound'],
    notes: 'Updated pressure offloading section',
    source_url: 'https://example.org/diabetes-foot',
    file_path: 'guidelines/diabetes-foot.pdf',
    file_type: 'pdf',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'demo-user',
    title: 'Pediatric Asthma Quick Sheet',
    category: 'Pulmonology',
    tags: ['asthma', 'peds'],
    notes: 'Stepwise ladder summarized',
    source_url: null,
    file_path: 'guidelines/peds-asthma.png',
    file_type: 'image',
    created_at: new Date().toISOString()
  }
];

