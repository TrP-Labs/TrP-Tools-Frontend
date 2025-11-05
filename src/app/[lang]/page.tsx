import { getStrings } from "@/app/strings";
import { Locale } from "@/../i18n-config";
import HomeContent from "./HomeContent";

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const strings = await getStrings(lang);

  return <HomeContent strings={strings} />;
}
