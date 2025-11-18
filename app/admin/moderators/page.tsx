import { getModerators } from '@/actions/moderator-actions';
import ModeratorManagement from './components/ModeratorManagement';

export default async function ModeratorsPage() {
  const moderators = await getModerators();
  
  return <ModeratorManagement initialModerators={moderators} />;
}