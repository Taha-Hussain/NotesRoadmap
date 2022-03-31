import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteDetailsDialogComponent } from './note-details-dialog.component';

describe('NoteDetailsDialogComponent', () => {
  let component: NoteDetailsDialogComponent;
  let fixture: ComponentFixture<NoteDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoteDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
