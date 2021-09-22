// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { CommonModule } from '@angular/common';
import { Story, Meta } from '@storybook/angular/types-6-0';
import { moduleMetadata } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { I18nPipe } from 'jslib-angular/pipes/i18n.pipe';

import { ServicesModule } from 'src/app/services/services.module';
import { VaultTimeoutInputComponent } from 'src/app/settings/vault-timeout-input.component';

export default {
    title: 'Jslib/VaultTimeoutInput',
    component: VaultTimeoutInputComponent,
    decorators: [
        moduleMetadata({
            declarations: [I18nPipe],
            imports: [FormsModule, ReactiveFormsModule, CommonModule, ServicesModule],
        }),
    ],
    args: {
        vaultTimeouts: [   
            { name: '1 minute', value: 1 },
            { name: '5 minutes', value: 5 },
            { name: '15 minutes', value: 15 },
            { name: '30 minutes', value: 30 },
            { name: '1 hour', value: 60 },
            { name: '4 hours', value: 240 },
            { name: 'On Refresh', value: -1 },
        ],
        value: 15,
    },
} as Meta;

const Template: Story<VaultTimeoutInputComponent> = (args: VaultTimeoutInputComponent) => ({
    template: '<app-vault-timeout-input [vaultTimeouts]="vaultTimeouts" [ngModel]="value" (ngModelChange)="change($event)" ngDefaultControl></app-vault-timeout-input>',
    props: {
        ...args,
        change: action('onModelChange'),
    },
});

export const Default = Template.bind({});
