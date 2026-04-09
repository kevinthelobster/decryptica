import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit a Prompt — OpenClaw Prompt Library',
  description: 'Share your OpenClaw automation setup with the community.',
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
