import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Notes } from "src/app/interfaces/Notes";
import { NoteLabel } from "src/app/interfaces/NoteLabel";
import { cloneDeep, parseInt } from 'lodash';
import { Note } from 'src/app/interfaces/Note';
import { UtilityService } from 'src/app/services/utility.service';
import { SchedulerService } from 'src/app/services/scheduler.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

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
  breakpoint: number;
  mainCounter = 0;
  draggedItemId = "";
  startDate: Date;
  endDate: Date;
  selectedLabel: number = 0;
  days: any = [];
  arrayOfWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  constructor(
    private utilityService: UtilityService,
    private schedulerService: SchedulerService) {
  }

  selectTheme(event: MatSlideToggleChange): void {
    document.body.classList.toggle("dark-theme");
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
    var itemsWithDays = this.notesJson[destLabel].map((x: any) => {
      return x.days.find(function (day: number) {
        return currentItemDays.includes(day);
      })
    })

    // CHECK IF THE ITEM IS EXPANDED TO OTHER DAYS IF YES THEN GET THE MAX ITEMS ON OTHER DAYS
    var currentCount = this.utilityService.getMaxItemCount(itemsWithDays);

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
      return;
    }
  }

  loadData() {
    forkJoin({
      notes: this.schedulerService.getNotes(),
      noteLabels: this.schedulerService.getLabels()
    })
      .subscribe(({ notes, noteLabels }) => {
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
        this.notesJson[label].push(JSON.parse(JSON.stringify(obj)));
      }

    });
  }

}
