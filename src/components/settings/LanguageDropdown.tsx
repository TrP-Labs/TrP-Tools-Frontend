"use client"
import LargeDropdown from "./LargeDropdown"
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation';

import { Locale } from "../../../i18n-config";

type displaysettings = {
    [key: string]: { id: string; display: string };
  };

const LanguageSettings : displaysettings = {
    'browser' : {'id' : 'browser', 'display' : "Auto"},
    'en' : {'id' : 'en', 'display' : 'English'},
    'ru' : {'id' : 'ru', 'display' : 'Русский'}
}

const LanguageDropdown = ({currentSelection} : {currentSelection : string}) => {
    const router = useRouter()

    const ChangeLanguage = (result : string) => {
        Cookies.set('preferredLanguage', result)
        router.refresh()
    }

    return <LargeDropdown currentSelection={currentSelection} selection={LanguageSettings} effect={ChangeLanguage}/>
}

export default LanguageDropdown