import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NetworkService } from 'src/app/services/network.service';
import { environment } from 'src/environments/environment';
import { NoteLabel } from '../interfaces/NoteLabel';
import { Notes } from '../interfaces/Notes';

@Injectable({
    providedIn: 'root'
})
export class SchedulerService {

    constructor(private networkService: NetworkService) {

    }

    getLabels() {
        return this.networkService.get<NoteLabel[]>('noteLabels');
    }

    getNotes() {
        return this.networkService.get<Notes>('notes');
    }
}
