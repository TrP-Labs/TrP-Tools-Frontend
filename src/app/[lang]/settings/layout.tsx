import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";
import SettingsLayoutClient from "./SettingsLayoutClient";

const SettingsLayout = async ({ 
  children, 
  params 
}: { 
  children: React.ReactNode; 
  params: { lang: Locale } 
}) => {
  const { lang } = await params;
  const strings = await getStrings(lang);

  return (
    <SettingsLayoutClient lang={lang} strings={strings.settings.categories}>
      {children}
    </SettingsLayoutClient>
  );
};

export default SettingsLayout;
