import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";
import { cookies } from "next/headers";
import LanguageDropdown from "@/components/settings/LanguageDropdown";
import ThemeDropdown from "@/components/settings/ThemeDropdown";

const AppearanceSettings = async ({params} : {params: Promise<{ lang: Locale }>}) => {
    const { lang } = await params;
    const strings = await getStrings(lang);

    const cookieStore = await cookies()
    const preferredLanguage = cookieStore.get('preferredLanguage')
    const preferredTheme = cookieStore.get('preferredTheme')

    return (
        <div className="flex justify-center w-full">
            <div className="flex flex-col mx-auto w-8/12 p-4">
                <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
                    {strings.settings.categories.appearance}
                </h1>
                
                <div className="space-y-8">
                    <div className="bg-[var(--background-secondary)] rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
                            {strings.settings.categories.language}
                        </h2>
                        <p className="text-[var(--text)] opacity-75 mb-4">
                            {strings.settings.descriptions.language}
                        </p>
                        <LanguageDropdown 
                            currentSelection={preferredLanguage?.value || 'browser'}
                            strings={strings.settings}
                        />
                    </div>

                    <div className="bg-[var(--background-secondary)] rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
                            {strings.settings.categories.theme}
                        </h2>
                        <p className="text-[var(--text)] opacity-75 mb-4">
                            {strings.settings.descriptions.theme}
                        </p>
                        <ThemeDropdown 
                            currentSelection={preferredTheme?.value || 'dim'} 
                            strings={strings.settings.themes}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppearanceSettings