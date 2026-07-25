import type { Metadata } from 'next';
import SavedGuidesClient from './SavedGuidesClient';

export const metadata: Metadata = {
  title: 'Saved Guides | Decryptica',
  description: 'Return to saved Decryptica guides and recent reading from this browser.',
  alternates: {
    canonical: '/saved',
  },
};

export default function SavedGuidesPage() {
  return <SavedGuidesClient />;
}
