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
            u2f: 4
        },
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
