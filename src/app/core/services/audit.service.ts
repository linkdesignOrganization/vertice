import { Injectable } from '@angular/core';
import { AuditEvent } from '../models/entities';
import { SessionStoreService } from './session-store.service';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private readonly store: SessionStoreService) {}

  add(event: Omit<AuditEvent, 'id' | 'timestamp' | 'userId'>): void {
    const user = this.store.snapshot.currentUser;
    const next: AuditEvent = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user?.id ?? 'SISTEMA',
      ...event
    };
    this.store.updateState((s) => ({ ...s, audit: [next, ...s.audit] }));
  }
}
