import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";
import { getCurrentSession } from "@/lib/auth/session";
import { UserService } from "@/lib/services/userService";
import LogoutButton from "@/components/settings/LogoutButton";

const AccountSettings = async ({params} : {params: { lang: Locale }}) => {
    const { lang } = await params;
    const strings = await getStrings(lang);
    const { user } = await getCurrentSession();

    let userInfo = null;
    if (user) {
        try {
            userInfo = await UserService.getRobloxUserInfo(user.robloxId);
        } catch (error) {
            console.error('Failed to fetch user info:', error);
        }
    }

    if (!user || !userInfo) {
        return (
            <div className="flex justify-center w-full">
                <div className="flex flex-col mx-auto w-8/12 p-4">
                    <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
                        {strings.settings.categories.account}
                    </h1>
                    <div className="bg-[var(--background-secondary)] rounded-lg p-6">
                        <p className="text-[var(--text)] opacity-75">
                            {strings.settings.messages.signInRequired}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full">
            <div className="flex flex-col mx-auto w-8/12 p-4">
                <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
                    {strings.settings.categories.account}
                </h1>
                
                <div className="space-y-8">
                    <div className="bg-[var(--background-secondary)] rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
                            {strings.settings.sections.profileInformation}
                        </h2>
                        <div className="flex items-center space-x-4 mb-6">
                            <img 
                                src={userInfo.profileImage || '/icon.png'} 
                                alt={`${userInfo.displayName}'s avatar`}
                                className="w-16 h-16 rounded-full"
                            />
                            <div>
                                <p className="text-[var(--text)] font-medium text-lg">{userInfo.displayName}</p>
                                <p className="text-[var(--text)] opacity-75">@{userInfo.username}</p>
                                <p className="text-[var(--text)] opacity-75 text-sm">Roblox ID: {user.robloxId}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[var(--background-secondary)] rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
                            {strings.settings.sections.accountActions}
                        </h2>
                        <div className="space-y-4">
                            <LogoutButton 
                                confirmMessage={strings.settings.messages.logoutConfirm}
                                errorMessage={strings.settings.messages.logoutFailed}
                                buttonText={strings.loginMenu.logout}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountSettings 