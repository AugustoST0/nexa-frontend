import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'bordered' | 'elevated';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrls: ['./card.css'],
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() padding: boolean = true;
  @Input() hoverable: boolean = false;
}
