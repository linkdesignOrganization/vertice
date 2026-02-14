import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  styles: [
    'canvas { border: 1px solid #c7d5e5; border-radius: 0.6rem; width: 100%; max-width: 420px; touch-action: none; background: rgba(255,255,255,.7); display: block; margin-inline: auto; }',
    '.row-actions { display: flex; gap: 8px; align-items: center; margin-top: 8px; }',
    '@media (max-width: 991px) { .row-actions { justify-content: center; } }'
  ],
  template: `
    <canvas #canvas width="420" height="160"></canvas>
    <div class="row-actions">
      <button type="button" class="btn btn-outline-secondary btn-sm" (click)="clear()"><i class="bi bi-eraser"></i> Limpiar</button>
      <button type="button" class="btn btn-primary btn-sm" (click)="emitSignature()"><i class="bi bi-pen"></i> Usar firma</button>
    </div>
  `
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureChange = new EventEmitter<string>();

  private drawing = false;
  private ctx!: CanvasRenderingContext2D;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.ctx.lineWidth = 2;

    canvas.addEventListener('pointerdown', (e) => {
      this.drawing = true;
      this.ctx.beginPath();
      this.ctx.moveTo(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.drawing) return;
      this.ctx.lineTo(e.offsetX, e.offsetY);
      this.ctx.stroke();
    });
    canvas.addEventListener('pointerup', () => (this.drawing = false));
    canvas.addEventListener('pointerleave', () => (this.drawing = false));
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.signatureChange.emit('');
  }

  emitSignature(): void {
    this.signatureChange.emit(this.canvasRef.nativeElement.toDataURL('image/png'));
  }
}
