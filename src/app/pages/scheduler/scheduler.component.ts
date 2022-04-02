import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Notes } from "src/app/interfaces/Notes";
import { NoteLabel } from "src/app/interfaces/NoteLabel";
import { cloneDeep, parseInt, update } from 'lodash';
import { Note } from 'src/app/interfaces/Note';
import { UtilityService } from 'src/app/services/utility.service';
import { SchedulerService } from 'src/app/services/scheduler.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { NoteDetailsDialogComponent } from 'src/app/components/note-details-dialog/note-details-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { AlertDialogComponent } from 'src/app/components/alert-dialog/alert-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {
  notesObj: Notes;
  notesObjCopy: Notes;
  noteLabels: NoteLabel[];
  filteredLabels: NoteLabel[];
  notesJson: any = [];
  mainCounter = 0;
  draggedItemId = "";
  startDate: Date;
  endDate: Date;
  selectedLabel: number = 0;
  selectedLanguage: string = "en";
  days: any = [];
  arrayOfWeekdays: string[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  printObj: any;
  isLoading: boolean = false;
  isPageLoading: boolean = false;
  isSmall = false;
  lightTheme: boolean = true;
  constructor(
    private utilityService: UtilityService,
    private schedulerService: SchedulerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService) {
    this.printObj = {
      noteTitle: "",
      noteSummary: "",
      noteLabels: "",
      noteStartDate: "",
      noteEndDate: "",
      noteDays: null,
    };
    if (window.innerWidth < 800) {
      this.isSmall = true;
    }
  }

  onResize(event: any) {
    if (event.target.innerWidth < 800) {
      this.isSmall = true;
    }
    else {
      this.isSmall = false;
    }
  }

  selectTheme(event: MatSlideToggleChange): void {
    this.lightTheme = !this.lightTheme;
    document.body.classList.toggle("dark-theme");
  }

  selectLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit(): void {
    this.loadData();
  }

  startCurrentDateSelection() {
    let start = new Date();
    start.setDate(start.getDate() - start.getDay());
    this.startDate = start;
    if (!this.endDate) {
      this.endDateSelection();
    }
  }

  startDateSelection(el: any) {
    let start = new Date(this.startDate);
    start.setDate(start.getDate() - start.getDay());
    this.startDate = start;
    if (!this.endDate) {
      this.endDateSelection();
    }
  }

  endDateSelection(el?: any) {
    let start = new Date(this.startDate);
    let end = new Date(start);
    end.setDate(start.getDate() + 6);
    this.endDate = end;
    if (el) {
      setTimeout(() => {
        el.close();
        this.filterData();
      }, 200);
    }
    else {
      this.filterData();
    }
  }

  filterData() {
    this.days = [];
    var filteredLabelId: number;
    // IGNORE STARTING SUNDAY AND ENDING SATURDAY
    for (var i = 0; i < 5; i++) {
      var obj = {
        text: this.arrayOfWeekdays[this.utilityService.addDays(this.startDate, i + 1).getDay()],
        value: this.utilityService.addDays(this.startDate, i + 1)
      }
      this.days.push(obj);
    }
    if (this.selectedLabel) {
      this.filteredLabels = this.noteLabels.filter(x => x.id == this.selectedLabel);
      filteredLabelId = this.filteredLabels[0].id;
    }
    else {
      this.filteredLabels = this.noteLabels;
      filteredLabelId = 0;
    }
    if (this.startDate && this.endDate) {

      this.notesObj = cloneDeep(this.notesObjCopy);
      this.notesObj['notes'] = this.notesObj['notes'].filter(x => {
        if (filteredLabelId) {
          return (x.startDate >= this.startDate.getTime() / 1000 && x.startDate <= this.endDate.getTime() / 1000 ||
            x.endDate >= this.startDate.getTime() / 1000 && x.endDate <= this.endDate.getTime() / 1000) && x.labels.indexOf(filteredLabelId) > -1;
        }
        else {
          return x.startDate >= this.startDate.getTime() / 1000 && x.startDate <= this.endDate.getTime() / 1000 ||
            x.endDate >= this.startDate.getTime() / 1000 && x.endDate <= this.endDate.getTime() / 1000
        }

      });
    }
    this.dataManipulation();
  }

  allowDrop(ev: any) {
    var idDay = this.draggedItemId.split('-').reverse()[0];
    var idLabel = this.draggedItemId.split('-').reverse()[1];
    var id = this.draggedItemId.split('-').reverse()[2];
    var destDay = ev.target.parentElement.id.split('-').reverse()[0];
    var destLabel = ev.target.parentElement.id.split('-').reverse()[1];
    var alreadyExists = this.notesObj["notes"].find((x: Note) => x.id == parseInt(id))['labels'].indexOf(parseInt(destLabel)) > -1;
    if (idDay == destDay && idLabel != destLabel && !alreadyExists) {
      ev.preventDefault();
    }
  }

  drag(ev: any) {
    ev.dataTransfer.setData("text", ev.target.id);
    this.draggedItemId = ev.target.id;
  }

  drop(ev: any) {
    ev.preventDefault();

    var idDay = this.draggedItemId.split('-').reverse()[0];
    var idLabel = this.draggedItemId.split('-').reverse()[1];
    var id = this.draggedItemId.split('-').reverse()[2];
    var destDay = ev.target.parentElement.id.split('-').reverse()[0];
    var destLabel = ev.target.parentElement.id.split('-').reverse()[1];

    var currentItemDays = this.notesJson[idLabel].find((x: any) => x.id == id)['days'];

    var itemsWithDays = this.notesJson[destLabel].map((x: any): number[] => {
      return x.days.filter((day: number) => {
        return currentItemDays.includes(day)
      });

    })

    var allItemDays = [];
    if (itemsWithDays.length) {
      allItemDays = itemsWithDays.reduce((a: any, b: any) => a.concat(b));
    }

    // CHECK IF THE ITEM IS EXPANDED TO OTHER DAYS IF YES THEN GET THE MAX ITEMS ON OTHER DAYS
    var currentCount = this.utilityService.getMaxItemCount(allItemDays);

    if (currentCount < 3) {

      var objCopy = this.notesObjCopy['notes'].find((x: Note) => x.id == parseInt(id));
      objCopy['labels'].push(parseInt(destLabel));
      objCopy['labels'] = objCopy['labels'].filter((o) => o != parseInt(idLabel));

      var obj = this.notesObj['notes'].find((x: Note) => x.id == parseInt(id));
      obj['labels'] = obj['labels'].filter((o) => o != parseInt(idLabel));
      obj['labels'].push(parseInt(destLabel));
      this.dataManipulation();
    }
    else {
      this.showAlertDialog(this.translate.instant('NOTE_ALLOWED_MESSAGE'));
    }
  }

  loadData() {
    this.isPageLoading = true;
    forkJoin({
      notes: this.schedulerService.getNotes(),
      noteLabels: this.schedulerService.getLabels()
    })
      .subscribe(({ notes, noteLabels }) => {
        this.isPageLoading = false;
        this.notesObj = notes;
        this.notesObjCopy = notes;
        this.noteLabels = noteLabels;
        this.startCurrentDateSelection();
      });
  }

  dataManipulation() {
    this.notesJson = [];
    this.filteredLabels.forEach(noteLabel => {
      this.notesJson[noteLabel.id] = [];
    })
    this.notesObj['notes'] = this.notesObj['notes'].sort((a, b) => a.startDate - b.startDate);
    this.notesObj['notes'].forEach(item => {

      var startDate = new Date(item.startDate * 1000);
      var endDate = new Date(item.endDate * 1000);
      var originalDays = this.utilityService.workingDaysDifference(startDate, endDate);

      if (startDate < this.startDate) {
        startDate = this.utilityService.addDays(this.startDate, 1);
      }

      var daysCount = this.utilityService.workingDaysDifference(startDate, endDate);

      var startDay = startDate.getDay();
      var endDay = endDate.getDay();
      var days = this.utilityService.calculateDays(startDay, daysCount);
      if (daysCount + startDay > 6) {
        daysCount = 6 - startDay;
        endDay = 5;
      }
      else {
        endDay = daysCount + startDay - 1;
      }
      var obj = {
        "id": item.id,
        "title": item.title,
        "startDate": item.startDate,
        "endDate": item.endDate,
        "labels": item.labels,
        "summary": item.summary,
        "daysCount": daysCount,
        "startDay": startDay,
        "endDay": endDay,
        "days": days,
        "originalDays": originalDays
      }
      if (obj.startDay != 6 && obj.startDay != 7) {
        this.createNotesJson(obj);
      }
    })
  }

  createNotesJson(obj: any) {

    obj.labels.forEach((label: number) => {
      if (this.notesObj['notes'].length && this.notesJson[label]) {
        var selfCount = this.notesJson[label].filter((x: any) => x.startDay == obj.startDay).length;

        var filtered = this.notesJson[label].filter((x: any) => {
          var items = obj.days.filter((item: any) => {
            return x.days.indexOf(item) > -1;
          })
          if (items.length) {
            return true;
          }
          return false;
        });

        var counts = filtered.map((x: any) => x.count);
        var count = filtered.map((x: any) => x.count).sort(function (a: any, b: any) { return b - a });

        if (count.length) {
          for (var i = 0; i < count.length; i++) {
            if (counts.indexOf(counts[i] + 1) < 0) {
              count = counts[i];
              break;
            }
            else {
              count = count[0];
            }
          }
        }
        else {
          count = 0;
        }

        if (counts.indexOf(selfCount + 1) == -1) {
          count = selfCount;
        }
        obj['count'] = count + 1;
        obj['index'] = this.mainCounter++;
        obj['labelName'] = this.noteLabels.find(x => x.id == label)['text'];
        this.notesJson[label].push(JSON.parse(JSON.stringify(obj)));
      }

    });
  }

  editNote(note: any) {
    this.showNoteDialog("EDIT", note);
  }

  deleteNote(note: any) {
    this.showDeleteDialog(note);
  }

  printNote(note: any) {
    this.printWindow(note);
  }

  printWindow(note: any) {

    var labels = this.noteLabels.filter(x => note.labels.indexOf(x.id) > -1).map(y => y.text).join(', ');
    this.printObj = {
      id: note.id,
      noteTitle: note.title,
      noteSummary: note.summary,
      noteLabels: labels,
      noteStartDate: note.startDate,
      noteEndDate: note.endDate,
      noteDays: note.days.length,
    };
    setTimeout(() => {
      var printWindow = window.open('', 'PRINT', 'height=400,width=600');
      printWindow.document.write('<html><head><title> Print Event </title>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(document.getElementById('print-div').innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      return true;
    });
  }

  showDeleteDialog(note: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: this.translate.instant('DELETE_CONFIRMATION'),
        note: note,
        noteLabels: this.noteLabels.filter(x => note.labels.indexOf(x.id) > -1).map(y => y.text)
      },
      disableClose: true,
      width: "400px"
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response) {
        this.notesObjCopy['notes'] = this.notesObjCopy['notes'].filter(x => x.id != response.id);
        this.notesObj = cloneDeep(this.notesObjCopy);
        this.filterData();

        this.snackBar.open(this.translate.instant('NOTE_DELETE_SUCCESS'), 'Close', {
          duration: 2000,
        });
      }
    });
  }

  showAlertDialog(message: string) {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      data: {
        message: message
      },
      disableClose: true,
      width: "300px"
    })
    dialogRef.afterClosed().subscribe((response: any) => {

    });
  }

  showNoteDialog(state: string, note: Note = null) {
    const dialogRef = this.dialog.open(NoteDetailsDialogComponent, {
      data: {
        state: state,
        note: note
      },
      disableClose: true,
      width: "400px"
    });
    dialogRef.afterClosed().subscribe((updatedNote: any) => {
      if (updatedNote) {
        if (updatedNote.id) {

          if (this.checkIfUpdateAllowed(updatedNote)) {
            this.saveNote(updatedNote);
          }
          else {
            this.showAlertDialog("Event can not be adjusted in that label as it already have 3 events scheduled in a single day.");
          }
        }


      }
    });
  }

  checkIfUpdateAllowed(updatedNote: any) {

    var startDate = new Date(updatedNote['startDate'] * 1000);
    var endDate = new Date(updatedNote['endDate'] * 1000);
    var daysCount = this.utilityService.workingDaysDifference(startDate, endDate);
    var startDay = startDate.getDay();
    var days = this.utilityService.calculateDays(startDay, daysCount);

    // var currentItemDays = this.notesJson[idLabel].find((x: any) => x.id == id)['days'];
    var currentCount = 0;
    updatedNote.labels.forEach((label: number) => {
      var itemsWithDays = this.notesJson[label].map((x: any): number[] => {
        return x.days.filter((day: number) => {
          if (x.id != updatedNote.id) {
            return days.includes(day)
          }
          else {
            return false;
          }
        });
      })
      var allItemDays = itemsWithDays.reduce((a: any, b: any) => a.concat(b));
      var value = this.utilityService.getMaxItemCount(allItemDays);
      if (value > currentCount) {
        currentCount = value;
      }
    });

    // CHECK IF THE ITEM IS EXPANDED TO OTHER DAYS IF YES THEN GET THE MAX ITEMS ON OTHER DAYS

    if (currentCount < 3) {
      return true;
    }
    else {
      return false;
    }
  }

  saveNote(data: Note) {
    this.isLoading = true;
    this.schedulerService.postNote(data.id, data).subscribe((response: any) => {
      if (response) {
        var noteData = response['noteData'];
        this.notesObjCopy['notes'][this.notesObjCopy['notes'].findIndex(x => x.id == noteData.id)] = noteData;
        this.filterData();
        this.snackBar.open(this.translate.instant('NOTE_UPDATE_SUCCESS'), 'Close', {
          duration: 2000,
        });
        this.isLoading = false;
      }
    })
  }

}
