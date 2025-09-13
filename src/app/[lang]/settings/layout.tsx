import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";
import { getCurrentSession } from "@/lib/auth/session";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

const SettingsLayout = async ({ 
  children, 
  params 
}: { 
  children: React.ReactNode; 
  params: { lang: Locale } 
}) => {
  const { lang } = await params;
  const strings = await getStrings(lang);
  const { user } = await getCurrentSession();

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <SettingsSidebar 
        strings={strings.settings.categories} 
        isAuthenticated={user !== null}
        lang={lang}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default SettingsLayout;