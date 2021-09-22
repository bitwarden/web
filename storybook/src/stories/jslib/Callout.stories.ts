// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { CommonModule } from '@angular/common';
import { Story, Meta } from '@storybook/angular/types-6-0';
import { moduleMetadata } from '@storybook/angular';

import { CalloutComponent } from 'jslib-angular/components/callout.component';
import { I18nService as I18nServiceAbstraction } from 'jslib-common/abstractions/i18n.service';
import { I18nService } from 'src/services/i18n.service';
import { APP_INITIALIZER } from '@angular/core';
import { ServicesModule } from 'src/app/services/services.module';

export default {
    title: 'Jslib/Callout',
    component: CalloutComponent,
    decorators: [
        moduleMetadata({
            
            imports: [CommonModule, ServicesModule],
        }),
    ],
    args: {
        content: 'Example content, can be a long string.',
    }
} as Meta;

const Template: Story<CalloutComponent> = (args: CalloutComponent) => ({
    template: '<app-callout [title]="title" [type]="type" [icon]="icon">{{content}}</app-callout>',
    props: args,
});

export const Info = Template.bind({});
Info.args = {
    type: 'info',
    title: 'Info',
};

export const Warning = Template.bind({});
Warning.args = {
    type: 'warning',
};

export const Danger = Template.bind({});
Danger.args = {
    type: 'danger',
};

export const Error = Template.bind({});
Error.args = {
    type: 'error',
};

export const Tip = Template.bind({});
Tip.args = {
    type: 'tip',
    title: 'Tip',
};
