"use client"
import LargeDropdown from "./LargeDropdown"
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation';

type displaysettings = {
    [key: string]: { id: string; display: string };
};

type SettingsStrings = {
    categories: {
        appearance: string;
        account: string;
        language: string;
        theme: string;
    };
    themes: {
        light: string;
        vanilla: string;
        dim: string;
        midnight: string;
        mint: string;
        arctic: string;
    };
    languages: {
        auto: string;
        english: string;
        russian: string;
    };
};

const LanguageDropdown = ({currentSelection, strings} : {currentSelection : string, strings: SettingsStrings}) => {
    const router = useRouter()

    const LanguageSettings : displaysettings = {
        'browser' : {'id' : 'browser', 'display' : strings.languages.auto},
        'en' : {'id' : 'en', 'display' : strings.languages.english},
        'ru' : {'id' : 'ru', 'display' : strings.languages.russian}
    }

    const ChangeLanguage = (result : string) => {
        Cookies.set('preferredLanguage', result)
        router.refresh()
    }

    return <LargeDropdown currentSelection={currentSelection} selection={LanguageSettings} effect={ChangeLanguage}/>
}

export default LanguageDropdown