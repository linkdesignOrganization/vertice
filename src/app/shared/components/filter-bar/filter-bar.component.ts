import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="input-group">
      <span class="input-group-text"><i class="bi bi-search"></i></span>
      <input class="form-control" [placeholder]="label" [(ngModel)]="value" (ngModelChange)="changed.emit(value)" />
    </div>
  `
})
export class FilterBarComponent {
  @Input() label = 'Buscar';
  @Input() value = '';
  @Output() changed = new EventEmitter<string>();
}
