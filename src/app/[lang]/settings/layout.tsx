import Sidebar from "@/components/settings/sidebar";
import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";

const SettingsLayout = async ({ children, params }: { children: React.ReactNode, params: { lang: Locale } }) => {
    const { lang } = params;
    const strings = await getStrings(lang);

    return <Sidebar strings={strings.settings.categories}>{children}</Sidebar>;
};


export default SettingsLayout