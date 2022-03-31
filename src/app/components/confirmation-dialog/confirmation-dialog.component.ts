import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {
  receivedData:any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {
    this.receivedData = data;
   }

  ngOnInit(): void {
  }

  save()
  {
    this.dialogRef.close(this.receivedData['note']);
  }

  cancel()
  {
    this.dialogRef.close(null);
  }

}
