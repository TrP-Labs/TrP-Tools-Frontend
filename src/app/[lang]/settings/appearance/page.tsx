import SettingsPage from "@/components/settings/SettingsPage"
import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";
import { cookies } from "next/headers";

import LanguageDropdown from "@/components/settings/LanguageDropdown";
import ThemeDropdown from "@/components/settings/ThemeDropdown";

const AppearanceSettings = async ({params} : {params: { lang: Locale }}) => {
    const { lang }  : {lang : Locale} = await params;
    const strings = await getStrings(lang);

    const cookieStore = await cookies()
    const preferredLanguage = cookieStore.get('preferredLanguage')
    const preferredTheme = cookieStore.get('preferredTheme')

    return <SettingsPage name={strings.settings.categories.appearance}>
        <div>
            <h1 className="text-3xl mb-2">{strings.settings.categories.language}</h1>
            <LanguageDropdown currentSelection={preferredLanguage?.value || 'browser'}/>
        </div>

        <div className="mt-5">
            <h1 className="text-3xl mb-2">{strings.settings.categories.theme}</h1>
            <ThemeDropdown currentSelection={preferredTheme?.value || 'dim'} strings={strings.settings.themes}/>
        </div>
    </SettingsPage>
}

export default AppearanceSettings