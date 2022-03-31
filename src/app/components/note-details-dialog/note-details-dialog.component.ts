import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Note } from 'src/app/interfaces/Note';
import { NoteLabel } from 'src/app/interfaces/NoteLabel';
import { SchedulerService } from 'src/app/services/scheduler.service';
import { cloneDeep } from 'lodash';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-note-details-dialog',
  templateUrl: './note-details-dialog.component.html',
  styleUrls: ['./note-details-dialog.component.scss']
})
export class NoteDetailsDialogComponent implements OnInit {
  state: string = "";
  noteLabels: NoteLabel[];
  duration: number = 1;
  noteObj: any = {};
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<NoteDetailsDialogComponent>,
    private schedulerService: SchedulerService,
    private utilityService: UtilityService
  ) {
    if (data) {
      this.state = data.state;
      if (data.note) {
        this.noteObj = this.loadNoteObj(data.note);
        // this.noteObj = cloneDeep(data.note);
        this.noteObj['startDate'] = new Date(this.noteObj['startDate'] * 1000);
        this.noteObj['endDate'] = new Date(this.noteObj['endDate'] * 1000);
        this.duration = this.utilityService.workingDaysDifference(this.noteObj['startDate'], this.noteObj['endDate']);
      }
    }
    this.dialogRef.updateSize('300vw', '300vw')
  }

  loadNoteObj(note: any) {
    return {
      id: note.id,
      title: note.title,
      startDate: note.startDate,
      endDate: note.endDate,
      labels: note.labels,
      summary: note.summary
    }
  }

  ngOnInit(): void {
    this.loadLabels();
  }

  loadLabels() {
    this.schedulerService.getLabels().subscribe(response => {
      this.noteLabels = response;
    })
  }

  save() {
    this.manipulateNote();
    this.dialogRef.close(this.noteObj);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  manipulateNote() {
    this.noteObj['endDate'] = this.utilityService.addBusinessDaysToDate(this.noteObj['startDate'], this.duration - 1).getTime() / 1000;
    this.noteObj['startDate'] = new Date(this.noteObj['startDate']).getTime() / 1000;
  }

}
