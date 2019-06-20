import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {ContextMenuComponent} from './context-menu/context-menu.component';
import {Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  sub: Subscription;

  constructor(private overlay: Overlay) { }

  open(x, y) {
    const portal = new ComponentPortal(ContextMenuComponent);
    console.log(x);
    const positionStrategy = this.overlay.position().flexibleConnectedTo({x, y}).withPositions([
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
      }
    ]);
    const overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });
    overlayRef.attach(portal);
  }
}
