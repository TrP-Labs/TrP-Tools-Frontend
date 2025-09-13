"use client"
import LargeDropdown from "./LargeDropdown"
import Cookies from 'js-cookie'
import { useRouter } from "next/navigation"

type displaysettings = {
    [key: string]: { id: string; display: string };
};

type ThemeStrings = {
    light: string;
    vanilla: string;
    dim: string;
    midnight: string;
    mint: string;
    arctic: string;
};

const ThemeDropdown = ({currentSelection, strings} : {currentSelection : string, strings : ThemeStrings}) => {
    const router = useRouter()

    const ThemeSettings: displaysettings = {
        'light': { id: 'light', display: strings.light },
        'dim': { id: 'dim', display: strings.dim },
        'midnight': { id: 'midnight', display: strings.midnight },
    };

    const ChangeTheme= (result : string) => {
        Cookies.set('preferredTheme', result)
        router.refresh()
    }

    return <LargeDropdown currentSelection={currentSelection} selection={ThemeSettings} effect={ChangeTheme}/>
}

export default ThemeDropdown