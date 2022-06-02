import { I18nService as BaseI18nService } from "jslib-common/services/i18n.service";

export class I18nService extends BaseI18nService {
  constructor(systemLanguage: string, localesDirectory: string) {
    super(systemLanguage || "en-US", localesDirectory, async (formattedLocale: string) => {
      const filePath =
        this.localesDirectory +
        "/" +
        formattedLocale +
        "/messages.json?cache=" +
        process.env.CACHE_TAG;
      const localesResult = await fetch(filePath);
      const locales = await localesResult.json();
      return locales;
    });

    // Please leave 'en' where it is, as it's our fallback language in case no translation can be found
    this.supportedTranslationLocales = [
      "en",
      "af",
      "az",
      "be",
      "bg",
      "bn",
      "bs",
      "ca",
      "cs",
      "da",
      "de",
      "el",
      "en-GB",
      "en-IN",
      "eo",
      "es",
      "et",
      "fi",
      "fil",
      "fr",
      "he",
      "hi",
      "hr",
      "hu",
      "id",
      "it",
      "ja",
      "ka",
      "km",
      "kn",
      "ko",
      "lv",
      "ml",
      "nb",
      "nl",
      "nn",
      "pl",
      "pt-PT",
      "pt-BR",
      "ro",
      "ru",
      "si",
      "sk",
      "sl",
      "sr",
      "sv",
      "tr",
      "uk",
      "vi",
      "zh-CN",
      "zh-TW",
    ];
  }
}
