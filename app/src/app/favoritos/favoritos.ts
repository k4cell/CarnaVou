import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

import { BLOCOS } from '../dados/blocos';

const CHAVE = 'carnavou.favoritos';

/**
 * Os blocos que a pessoa marcou com a estrela. Ficam só neste aparelho, sem conta e sem enviar nada.
 * Começa vazio e só lê o que foi guardado depois da primeira pintura (`iniciar`), para a página
 * pronta que vem do servidor e a primeira pintura saírem iguais.
 */
@Injectable({ providedIn: 'root' })
export class Favoritos {
  private readonly janela = inject(DOCUMENT).defaultView;
  private readonly ids = signal<ReadonlySet<string>>(new Set());

  readonly quantos = computed(() => this.ids().size);

  iniciar(): void {
    try {
      const guardados: unknown = JSON.parse(this.janela?.localStorage.getItem(CHAVE) ?? '[]');
      if (Array.isArray(guardados)) {
        // Os blocos que saíram da lista (de outro ano, por exemplo) não contam mais.
        this.ids.set(new Set(BLOCOS.map((bloco) => bloco.id).filter((id) => guardados.includes(id))));
      }
    } catch {
      // Sem acesso ao que fica guardado (navegação privada, por exemplo), a estrela vale só agora.
    }
  }

  tem(id: string): boolean {
    return this.ids().has(id);
  }

  trocar(id: string): void {
    const ids = new Set(this.ids());
    if (!ids.delete(id)) {
      ids.add(id);
    }
    this.ids.set(ids);
    try {
      this.janela?.localStorage.setItem(CHAVE, JSON.stringify([...ids]));
    } catch {
      // Sem espaço ou sem acesso: a estrela continua valendo enquanto o app estiver aberto.
    }
  }
}
