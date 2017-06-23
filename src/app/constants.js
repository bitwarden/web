angular.module('bit')
    .constant('constants', {
        rememberedEmailCookieName: 'bit.rememberedEmail',
        encType: {
            AesCbc256_B64: 0,
            AesCbc128_HmacSha256_B64: 1,
            AesCbc256_HmacSha256_B64: 2,
            Rsa2048_OaepSha256_B64: 3,
            Rsa2048_OaepSha1_B64: 4,
            Rsa2048_OaepSha256_HmacSha256_B64: 5,
            Rsa2048_OaepSha1_HmacSha256_B64: 6
        },
        orgUserType: {
            owner: 0,
            admin: 1,
            user: 2
        },
        orgUserStatus: {
            invited: 0,
            accepted: 1,
            confirmed: 2
        },
        twoFactorProvider: {
            authenticator: 0,
            email: 1,
            duo: 2,
            yubikey: 3,
            u2f: 4,
            remember: 5
        },
        twoFactorProviderInfo: [
            {
                type: 0,
                name: 'Authenticator App',
                description: 'Use an authenticator app (such as Authy or Google Authenticator) to generate time-based ' +
                'verification codes.',
                enabled: false,
                free: true,
                image: 'authapp.png'
            },
            {
                type: 3,
                name: 'YubiKey OTP Security Key',
                description: 'Use a YubiKey to access your account. Works with YubiKey 4, 4 Nano, 4C, and NEO devices.',
                enabled: false,
                image: 'yubico.png'
            },
            {
                type: 2,
                name: 'Duo',
                description: 'Verify with Duo Security using the Duo Mobile app, SMS, phone call, or U2F security key.',
                enabled: false,
                image: 'duo.png'
            },
            {
                type: 4,
                name: 'FIDO U2F Security Key',
                description: 'Use any FIDO U2F enabled security key to access your account.',
                enabled: false,
                image: 'fido.png'
            },
            {
                type: 1,
                name: 'Email',
                description: 'Verification codes will be emailed to you.',
                enabled: false,
                image: 'gmail.png'
            }
        ],
        plans: {
            free: {
                basePrice: 0,
                noAdditionalSeats: true,
                noPayment: true,
                upgradeSortOrder: -1
            },
            personal: {
                basePrice: 1,
                annualBasePrice: 12,
                baseSeats: 5,
                seatPrice: 1,
                annualSeatPrice: 12,
                maxAdditionalSeats: 5,
                annualPlanType: 'personalAnnually',
                upgradeSortOrder: 1
            },
            teams: {
                basePrice: 5,
                annualBasePrice: 60,
                monthlyBasePrice: 8,
                baseSeats: 5,
                seatPrice: 2,
                annualSeatPrice: 24,
                monthlySeatPrice: 2.5,
                monthPlanType: 'teamsMonthly',
                annualPlanType: 'teamsAnnually',
                upgradeSortOrder: 2
            },
            enterprise: {
                seatPrice: 3,
                annualSeatPrice: 36,
                monthlySeatPrice: 4,
                monthPlanType: 'enterpriseMonthly',
                annualPlanType: 'enterpriseAnnually',
                upgradeSortOrder: 3
            }
        }
    });
