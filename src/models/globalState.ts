import { ThemeType } from "jslib-common/enums/themeType";
import { GlobalState as BaseGlobalState } from "jslib-common/models/domain/globalState";

export class GlobalState extends BaseGlobalState {
  theme?: ThemeType = ThemeType.Light;
  rememberEmail = true;
}
