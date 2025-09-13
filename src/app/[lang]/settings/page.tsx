import { redirect } from "next/navigation";
import { Locale } from "@/../i18n-config";

const SettingsPage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params;
  
  // Redirect to appearance settings by default
  redirect(`/${lang}/settings/appearance`);
};

export default SettingsPage;