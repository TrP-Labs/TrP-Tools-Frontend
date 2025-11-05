import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";
import AccountSettingsClient from "./AccountSettingsClient";

const AccountSettings = async ({params} : {params: { lang: Locale }}) => {
    const { lang } = await params;
    const strings = await getStrings(lang);

    return <AccountSettingsClient lang={lang} strings={strings} />;
}

export default AccountSettings 
