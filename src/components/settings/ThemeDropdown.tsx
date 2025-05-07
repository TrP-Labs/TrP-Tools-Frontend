"use client"
import LargeDropdown from "./LargeDropdown"
import Cookies from 'js-cookie'

type displaysettings = {
    [key: string]: { id: string; display: string };
  };

const LanguageSettings : displaysettings = {
    'en' : {'id' : 'en', 'display' : 'English'},
    'ru' : {'id' : 'ru', 'display' : 'Русский'}
}

const ChangeTheme = (result : string) => {
    Cookies.set('preferredTheme', result)
}

const ThemeDropdown = ({currentSelection, strings} : {currentSelection : string, strings : any}) => {
    const ThemeSettings: displaysettings = {
        'light': { id: 'light', display: strings.light },
        'vanilla': { id: 'vanilla', display: strings.vanilla },
        'dim': { id: 'dim', display: strings.dim },
        'midnight': { id: 'midnight', display: strings.midnight },
        'mint': { id: 'mint', display: strings.mint},
        'arctic': { id: 'arctic', display: strings.arctic }
    };

    return <LargeDropdown currentSelection={currentSelection} selection={ThemeSettings} effect={ChangeTheme}/>
}

export default ThemeDropdown