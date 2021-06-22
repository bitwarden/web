import { Injectable } from '@angular/core'

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { ProviderAddOrganizationRequest } from 'jslib-common/models/request/provider/providerAddOrganizationRequest';

@Injectable()
export class ProviderService {
    constructor(private cryptoService: CryptoService, private apiService: ApiService) {}
    
    async addOrganizationToProvider(providerId: string, organizationId: string) {
        const orgKey = await this.cryptoService.getOrgKey(organizationId);
        const providerKey = await this.cryptoService.getProviderKey(providerId);

        const encryptedOrgKey = await this.cryptoService.encrypt(orgKey.key, providerKey);
        
        const request = new ProviderAddOrganizationRequest();
        request.organizationId = organizationId;
        request.key = encryptedOrgKey.encryptedString;

        return await this.apiService.postProviderAddOrganization(providerId, request)
    }
}
