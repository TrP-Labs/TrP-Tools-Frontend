import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";

const NotFound = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params;
  const strings = await getStrings(lang);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-[var(--text)] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
            Page Not Found
          </h2>
          <p className="text-[var(--text)] opacity-75 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <a 
            href={`/${lang}`}
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Home
          </a>
          
          <div className="text-sm text-[var(--text)] opacity-75">
            <p>Or try one of these pages:</p>
            <div className="mt-2 space-x-4">
              <a href={`/${lang}/settings`} className="hover:text-blue-400 transition-colors">
                Settings
              </a>
              <a href={`/${lang}/about`} className="hover:text-blue-400 transition-colors">
                About
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound;