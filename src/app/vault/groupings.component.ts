import {
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';

import { GroupingsComponent as BaseGroupingsComponent } from 'jslib/angular/components/groupings.component';

@Component({
    selector: 'app-vault-groupings',
    templateUrl: 'groupings.component.html',
})
export class GroupingsComponent extends BaseGroupingsComponent {
    @Output() onSearchTextChanged = new EventEmitter<string>();
    searchText: string = '';
    searchPlaceholder: string = null;

    constructor(collectionService: CollectionService, folderService: FolderService) {
        super(collectionService, folderService);
    }

    searchTextChanged() {
        this.onSearchTextChanged.emit(this.searchText);
    }
}
