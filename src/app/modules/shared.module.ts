import { DragDropModule } from "@angular/cdk/drag-drop";
import { DatePipe, registerLocaleData, CommonModule } from "@angular/common";
import localeAf from "@angular/common/locales/af";
import localeAz from "@angular/common/locales/az";
import localeBe from "@angular/common/locales/be";
import localeBg from "@angular/common/locales/bg";
import localeBn from "@angular/common/locales/bn";
import localeBs from "@angular/common/locales/bs";
import localeCa from "@angular/common/locales/ca";
import localeCs from "@angular/common/locales/cs";
import localeDa from "@angular/common/locales/da";
import localeDe from "@angular/common/locales/de";
import localeEl from "@angular/common/locales/el";
import localeEnGb from "@angular/common/locales/en-GB";
import localeEnIn from "@angular/common/locales/en-IN";
import localeEo from "@angular/common/locales/eo";
import localeEs from "@angular/common/locales/es";
import localeEt from "@angular/common/locales/et";
import localeFi from "@angular/common/locales/fi";
import localeFil from "@angular/common/locales/fil";
import localeFr from "@angular/common/locales/fr";
import localeHe from "@angular/common/locales/he";
import localeHi from "@angular/common/locales/hi";
import localeHr from "@angular/common/locales/hr";
import localeHu from "@angular/common/locales/hu";
import localeId from "@angular/common/locales/id";
import localeIt from "@angular/common/locales/it";
import localeJa from "@angular/common/locales/ja";
import localeKa from "@angular/common/locales/ka";
import localeKm from "@angular/common/locales/km";
import localeKn from "@angular/common/locales/kn";
import localeKo from "@angular/common/locales/ko";
import localeLv from "@angular/common/locales/lv";
import localeMl from "@angular/common/locales/ml";
import localeNb from "@angular/common/locales/nb";
import localeNl from "@angular/common/locales/nl";
import localeNn from "@angular/common/locales/nn";
import localePl from "@angular/common/locales/pl";
import localePtBr from "@angular/common/locales/pt";
import localePtPt from "@angular/common/locales/pt-PT";
import localeRo from "@angular/common/locales/ro";
import localeRu from "@angular/common/locales/ru";
import localeSi from "@angular/common/locales/si";
import localeSk from "@angular/common/locales/sk";
import localeSl from "@angular/common/locales/sl";
import localeSr from "@angular/common/locales/sr";
import localeSv from "@angular/common/locales/sv";
import localeTr from "@angular/common/locales/tr";
import localeUk from "@angular/common/locales/uk";
import localeVi from "@angular/common/locales/vi";
import localeZhCn from "@angular/common/locales/zh-Hans";
import localeZhTw from "@angular/common/locales/zh-Hant";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { BadgeModule, ButtonModule, CalloutModule, MenuModule } from "@bitwarden/components";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { ToastrModule } from "ngx-toastr";

import { JslibModule } from "jslib-angular/jslib.module";

registerLocaleData(localeAf, "af");
registerLocaleData(localeAz, "az");
registerLocaleData(localeBe, "be");
registerLocaleData(localeBg, "bg");
registerLocaleData(localeBn, "bn");
registerLocaleData(localeBs, "bs");
registerLocaleData(localeCa, "ca");
registerLocaleData(localeCs, "cs");
registerLocaleData(localeDa, "da");
registerLocaleData(localeDe, "de");
registerLocaleData(localeEl, "el");
registerLocaleData(localeEnGb, "en-GB");
registerLocaleData(localeEnIn, "en-IN");
registerLocaleData(localeEo, "eo");
registerLocaleData(localeEs, "es");
registerLocaleData(localeEt, "et");
registerLocaleData(localeFi, "fi");
registerLocaleData(localeFil, "fil");
registerLocaleData(localeFr, "fr");
registerLocaleData(localeHe, "he");
registerLocaleData(localeHi, "hi");
registerLocaleData(localeHr, "hr");
registerLocaleData(localeHu, "hu");
registerLocaleData(localeId, "id");
registerLocaleData(localeIt, "it");
registerLocaleData(localeJa, "ja");
registerLocaleData(localeKa, "ka");
registerLocaleData(localeKm, "km");
registerLocaleData(localeKn, "kn");
registerLocaleData(localeKo, "ko");
registerLocaleData(localeLv, "lv");
registerLocaleData(localeMl, "ml");
registerLocaleData(localeNb, "nb");
registerLocaleData(localeNl, "nl");
registerLocaleData(localeNn, "nn");
registerLocaleData(localePl, "pl");
registerLocaleData(localePtBr, "pt-BR");
registerLocaleData(localePtPt, "pt-PT");
registerLocaleData(localeRo, "ro");
registerLocaleData(localeRu, "ru");
registerLocaleData(localeSi, "si");
registerLocaleData(localeSk, "sk");
registerLocaleData(localeSl, "sl");
registerLocaleData(localeSr, "sr");
registerLocaleData(localeSv, "sv");
registerLocaleData(localeTr, "tr");
registerLocaleData(localeUk, "uk");
registerLocaleData(localeVi, "vi");
registerLocaleData(localeZhCn, "zh-CN");
registerLocaleData(localeZhTw, "zh-TW");

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    InfiniteScrollModule,
    JslibModule,
    ReactiveFormsModule,
    RouterModule,
    BadgeModule,
    ButtonModule,
    CalloutModule,
    ToastrModule,
    BadgeModule,
    ButtonModule,
    MenuModule,
  ],
  exports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    InfiniteScrollModule,
    JslibModule,
    ReactiveFormsModule,
    RouterModule,
    BadgeModule,
    ButtonModule,
    CalloutModule,
    ToastrModule,
    BadgeModule,
    ButtonModule,
    MenuModule,
  ],
  providers: [DatePipe],
  bootstrap: [],
})
export class SharedModule {}
