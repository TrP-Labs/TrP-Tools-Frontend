import { Locale } from "@/../i18n-config";
import { getStrings } from "@/app/strings";

const AboutPage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params;
  const strings = await getStrings(lang);

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
          {strings.about.title}
        </h1>
        
        <div className="space-y-8">
          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.about.whatIs}
            </h2>
            <p className="text-[var(--text)] opacity-75 leading-relaxed">
              {strings.about.whatIsDesc}
            </p>
          </div>

          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.about.keyFeatures}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-2">{strings.about.groupManagement}</h3>
                <p className="text-[var(--text)] opacity-75 text-sm">
                  {strings.about.groupManagementDesc}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-2">{strings.about.shiftScheduling}</h3>
                <p className="text-[var(--text)] opacity-75 text-sm">
                  {strings.about.shiftSchedulingDesc}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-2">{strings.about.analytics}</h3>
                <p className="text-[var(--text)] opacity-75 text-sm">
                  {strings.about.analyticsDesc}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-2">{strings.about.multiLanguage}</h3>
                <p className="text-[var(--text)] opacity-75 text-sm">
                  {strings.about.multiLanguageDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.about.techStack}
            </h2>
            <p className="text-[var(--text)] opacity-75 mb-4">
              {strings.about.techStackDesc}
            </p>
            <ul className="list-disc list-inside text-[var(--text)] opacity-75 space-y-2">
              <li>Next.js 15 with App Router</li>
              <li>TypeScript for type safety</li>
              <li>PostgreSQL database with Prisma ORM</li>
              <li>Tailwind CSS for styling</li>
              <li>Roblox OAuth integration</li>
              <li>Lucia Auth for secure authentication</li>
            </ul>
          </div>

          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.about.contactSupport}
            </h2>
            <p className="text-[var(--text)] opacity-75">
              {strings.about.contactSupportDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 