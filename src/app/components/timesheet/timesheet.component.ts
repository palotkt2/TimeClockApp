import { Component } from '@angular/core';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.css'],
})
export class TimesheetComponent {
  timesheetData: any[] = [];

  constructor(private exportService: ExportService) {}

  exportTimesheet() {
    this.exportService.exportToCSV(this.timesheetData, 'timesheet.csv');
  }
}
