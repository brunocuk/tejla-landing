import LandingClient from '@/components/LandingClient';
import { tejlaConfig } from '@/lib/config';

export default function Page() {
  return <LandingClient ctaMode={tejlaConfig.ctaMode} appUrl={tejlaConfig.appUrl} />;
}
