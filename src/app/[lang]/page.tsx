import { getCurrentSession } from "@/lib/auth/session";
import { UserService } from "@/lib/services/userService";
import { getStrings } from "@/app/strings";
import { Locale } from "@/../i18n-config";

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
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

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
          {strings.home.title}
        </h1>
        
        {user && userInfo ? (
          <div className="bg-[var(--background-secondary)] rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.home.welcomeBack.replace('{name}', userInfo.displayName)}
            </h2>
            <div className="flex items-center space-x-4">
              <img 
                src={userInfo.profileImage || '/icon.png'} 
                alt={`${userInfo.displayName}'s avatar`}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="text-[var(--text)] font-medium">@{userInfo.username}</p>
                <p className="text-[var(--text)] opacity-75">{strings.home.readyToManage}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--background-secondary)] rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.home.getStarted}
            </h2>
            <p className="text-[var(--text)] mb-4">
              {strings.home.signInDescription}
            </p>
            <a 
              href="/login" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {strings.home.signInButton}
            </a>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-[var(--text)] mb-3">{strings.home.features.groupManagement}</h3>
            <p className="text-[var(--text)] opacity-75">
              {strings.home.features.groupManagementDesc}
            </p>
          </div>
          
          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-[var(--text)] mb-3">{strings.home.features.shiftScheduling}</h3>
            <p className="text-[var(--text)] opacity-75">
              {strings.home.features.shiftSchedulingDesc}
            </p>
          </div>
          
          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-[var(--text)] mb-3">{strings.home.features.analytics}</h3>
            <p className="text-[var(--text)] opacity-75">
              {strings.home.features.analyticsDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
