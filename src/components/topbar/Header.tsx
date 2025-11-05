import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";
import HeaderClient from "./HeaderClient";

export default async function Header({ params } : {params: { lang: Locale }}) {
    const { lang } = await params;
    const strings = await getStrings(lang);

    return (
        <HeaderClient
            lang={lang}
            topbarStrings={strings.topbar}
            menuStrings={strings.loginMenu}
            errorStrings={strings.errors}
        />
    );
}
