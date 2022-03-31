import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NoteLabel } from 'src/app/interfaces/NoteLabel';
@Component({
  selector: 'app-note-card',
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss']
})
export class NoteCardComponent implements OnInit {
  @Input() note: any;
  @Input() noteLabels: NoteLabel[];
  @Input() label: any;
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<number> = new EventEmitter<number>();
  @Output() print: EventEmitter<number> = new EventEmitter<number>();
  isExpanded = false;
  constructor() { }

  ngOnInit(): void {
    
  }

  editClick() {
    this.edit.emit(this.note);
  }

  deleteClick() {
    this.delete.emit(this.note);
  }

  printClick() {
    this.print.emit(this.note);   
  }

  toggleExpandCollapse() {
    this.isExpanded = !this.isExpanded;
  }
}
