import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';

import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from 'jslib-common/abstractions/cryptoFunction.service';
import { BroadcasterMessagingService } from 'src/services/broadcasterMessaging.service';
import { I18nService } from 'src/services/i18n.service';
import { WebPlatformUtilsService } from 'src/services/webPlatformUtils.service';
import { WebCryptoFunctionService } from 'jslib-common/services/webCryptoFunction.service';
import { AvatarComponent } from 'src/app/components/avatar.component';
import { ConsoleLogService } from 'jslib-common/services/consoleLog.service';
import { StateService } from 'jslib-common/services/state.service';
import { StateService as StateServiceAbstraction } from 'jslib-common/abstractions/state.service';


const cryptoFunctionFactory = () => {
    const i18nService = new I18nService(window.navigator.language, 'locales');
    const messagingService = new BroadcasterMessagingService(null); // TODO: Figure out why BroadcasterService causes ReferenceError
    const consoleLogService = new ConsoleLogService(false);
    const platformUtilsService = new WebPlatformUtilsService(i18nService, messagingService, consoleLogService);
    return new WebCryptoFunctionService(window, platformUtilsService);
}

export default {
    title: 'Web/Avatar',
    component: AvatarComponent,
    decorators: [
        moduleMetadata({
            providers: [
                { provide: CryptoFunctionServiceAbstraction, useFactory: cryptoFunctionFactory },
                { provide: StateServiceAbstraction, useClass: StateService },
            ],
            imports: [CommonModule],
        }),
    ],
    args: {
        data: 'robb.stark@bitwarden.pw',
        dynamic: true,
    },
} as Meta;

const Template: Story<AvatarComponent> = (args: AvatarComponent) => ({
    props: args,
});

export const Default = Template.bind({});

export const Circle = Template.bind({});
Circle.args = {
    data: 'robb.stark@bitwarden.pw',
    circle: true,
};
