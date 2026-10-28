import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-pagina-em-breve',
  templateUrl: './pagina-em-breve.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaEmBreve {
  /** Vem da rota (data: { titulo }). */
  readonly titulo = input.required<string>();
}
