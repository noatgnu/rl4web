import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss']
})
export class FileSelectorComponent implements OnInit {
  @Output() file = new EventEmitter();
  @Input() label;
  @Input() placeholder;
  constructor() { }

  ngOnInit() {
  }

  fileSelected(event) {
    if (event.target.files[0]) {
      this.placeholder = event.target.files[0].name;
      this.file.emit(event);
    }
  }
}
