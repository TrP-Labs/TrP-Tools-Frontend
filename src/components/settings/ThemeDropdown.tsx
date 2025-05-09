"use client"
import LargeDropdown from "./LargeDropdown"
import Cookies from 'js-cookie'
import { useRouter } from "next/navigation"

type displaysettings = {
    [key: string]: { id: string; display: string };
  };

const ThemeDropdown = ({currentSelection, strings} : {currentSelection : string, strings : any}) => {
    const router = useRouter()

    const ThemeSettings: displaysettings = {
        'light': { id: 'light', display: strings.light },
        'vanilla': { id: 'vanilla', display: strings.vanilla },
        'dim': { id: 'dim', display: strings.dim },
        'midnight': { id: 'midnight', display: strings.midnight },
        'mint': { id: 'mint', display: strings.mint},
        'arctic': { id: 'arctic', display: strings.arctic }
    };

    const ChangeTheme= (result : string) => {
        Cookies.set('preferredTheme', result)
        router.refresh()
    }

    return <LargeDropdown currentSelection={currentSelection} selection={ThemeSettings} effect={ChangeTheme}/>
}

export default ThemeDropdown