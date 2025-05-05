import Sidebar from "@/components/settings/sidebar";
import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";

const SettingsLayout = async ({ children, params }: { children: React.ReactNode, params: { lang: Locale } }) => {
    const { lang } = params;
    const dictionary = await getStrings(lang);

    return <Sidebar strings={dictionary.settings}>{children}</Sidebar>;
};


export default SettingsLayout