import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserMenuModalService {
  private opened = false;

  get isOpen(): boolean {
    return this.opened;
  }

  open(): void {
    this.opened = true;
  }

  close(): void {
    this.opened = false;
  }
}
