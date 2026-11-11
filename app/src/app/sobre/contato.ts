/** O e-mail de contato do CarnaVou, nas páginas Sobre, Privacidade e Termos. */
export const EMAIL_DE_CONTATO = 'cassiel.okada@gmail.com';

/** Quando o texto da Privacidade e dos Termos de uso mudou pela última vez. */
export const TEXTOS_ATUALIZADOS_EM = '11 de novembro de 2026';

/** O estilo das páginas de texto (Sobre, Privacidade e Termos): linhas curtas, fáceis de ler. */
export const ESTILO_DAS_PAGINAS_DE_TEXTO = `
  :host {
    display: block;
    max-width: 680px;
  }

  p,
  li {
    line-height: 1.5;
  }

  ul {
    padding-left: 20px;
  }

  li + li {
    margin-top: 6px;
  }

  .atualizado {
    color: var(--texto-suave);
    font-size: 0.9375rem;
  }
`;
