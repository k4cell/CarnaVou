import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LOCAIS } from '../dados/locais';

@Component({
  selector: 'app-destaques',
  imports: [RouterLink],
  templateUrl: './destaques.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Destaques {
  protected readonly locais = LOCAIS;
}
