import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — OpenClaw Prompt Library',
  description: 'Review and approve community prompt submissions.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
