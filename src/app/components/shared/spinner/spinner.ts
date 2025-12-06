import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../core/services/overlay-service';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrls: ['./spinner.css'],
})
export class SpinnerComponent {
  constructor(public overlayService: OverlayService) { }
}
