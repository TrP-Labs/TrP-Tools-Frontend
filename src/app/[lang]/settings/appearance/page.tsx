import LargeDropdown from "@/components/settings/LargeDropdown"
import SettingsPage from "@/components/settings/SettingsPage"
import { NextResponse } from 'next/server';
import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";

import LanguageDropdown from "@/components/settings/LanguageDropdown";
import ThemeDropdown from "@/components/settings/ThemeDropdown";

type displaysettings = {
    [key: string]: { id: string; display: string };
  };
  

const ThemeSettings: displaysettings = {
    'light': { id: 'light', display: 'Light' },
    'vanilla': { id: 'vanilla', display: 'Vanilla' },
    'dim': { id: 'dim', display: 'Dim' },
    'midnight': { id: 'midnight', display: 'Midnight' },
    'mint': { id: 'mint', display: 'Mint' },
    'arctic': { id: 'arctic', display: 'Arctic' }
};


// we cannot have these server functions passed to the client, figure out a better way to pass logic into there

async function changeLanguage(locale : string) {
    "use server"

    const response = NextResponse.json({ message: 'Language changed' });

    response.cookies.set('preferredLanguage', locale, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
  
    return response;
}

async function changeTheme(theme : string) {
    "use server"

    const response = NextResponse.json({ message: 'Theme changed' });

    response.cookies.set('preferredTheme', theme, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
  
    return response;
}

const AppearanceSettings = async ({params} : {params: { lang: Locale }}) => {
    const { lang }  : {lang : Locale} = await params;
    const strings = await getStrings(lang);

    const ThemeSettings: displaysettings = {
        'light': { id: 'light', display: strings.settings.themes.light },
        'vanilla': { id: 'vanilla', display: strings.settings.themes.vanilla },
        'dim': { id: 'dim', display: strings.settings.themes.dim },
        'midnight': { id: 'midnight', display: strings.settings.themes.midnight },
        'mint': { id: 'mint', display: strings.settings.themes.mint},
        'arctic': { id: 'arctic', display: strings.settings.themes.arctic }
    };

    return <SettingsPage name={strings.settings.categories.appearance}>
        <div>
            <h1 className="text-3xl mb-2">{strings.settings.categories.language}</h1>
            <LanguageDropdown currentSelection={lang}/>
        </div>

        <div className="mt-5">
            <h1 className="text-3xl mb-2">{strings.settings.categories.theme}</h1>
            <ThemeDropdown currentSelection={'dim'} strings={strings.settings.themes}/>
        </div>
    </SettingsPage>
}

export default AppearanceSettings