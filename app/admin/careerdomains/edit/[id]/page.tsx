import { getCareerDomainById } from '@/actions/careerdomain-admin-actions';
import EditDomainForm from '../../components/EditDomainForm';
import { requireAdminAuth } from '@/actions/adminAuthActions';
import { notFound } from 'next/navigation';

interface EditDomainPageProps {
  params: {
    id: string;
  };
}

export default async function EditDomainPage({ params }: EditDomainPageProps) {
  await requireAdminAuth();
  const domain = await getCareerDomainById(params.id);

  if (!domain) {
    notFound();
  }

  return <EditDomainForm domain={domain} />;
}