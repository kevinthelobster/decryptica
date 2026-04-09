import AdminClient from './AdminClient';

export const metadata = {
  title: 'Admin — OpenClaw Prompt Library',
  description: 'Review and manage submitted prompts for the OpenClaw Prompt Library.',
};

export default function AdminPage() {
  return <AdminClient />;
}
