import { Injectable } from '@angular/core';
import { SimpleSearchDTO } from '../dto/SimpleSearchDTO';
import { ValidationError, ParameterError } from '../errors/search-errors';

@Injectable({
  providedIn: 'root'
})
export class SearchValidationService {

  // Operadores válidos para busca avançada
  private readonly VALID_OPERATORS = ['E', 'OU', 'NÃO POSSUI'];

  /**
   * Valida parâmetros de busca comum seguindo FRONTEND_INTEGRATION_GUIDE.md
   */
  validateCommonSearchParams(params: SimpleSearchDTO): void {
    // 1. Pelo menos um parâmetro deve ser fornecido
    const hasValidParam = params.nome || params.matricula || params.email || params.cpf || params.cargo;
    if (!hasValidParam) {
      throw new ValidationError('Pelo menos um critério de busca deve ser fornecido');
    }

    // 2. Validação de comprimento
    if (params.nome && params.nome.length > 255) {
      throw new ParameterError('Nome deve ter no máximo 255 caracteres');
    }
    if (params.matricula && params.matricula.length > 50) {
      throw new ParameterError('Matrícula deve ter no máximo 50 caracteres');
    }
    if (params.email && params.email.length > 255) {
      throw new ParameterError('Email deve ter no máximo 255 caracteres');
    }
    if (params.cpf && params.cpf.length > 14) {
      throw new ParameterError('CPF deve ter no máximo 14 caracteres');
    }
    if (params.cargo && params.cargo.length > 255) {
      throw new ParameterError('Cargo deve ter no máximo 255 caracteres');
    }

    // 3. Validação de formato CPF (opcional no frontend)
    const cpfPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
    if (params.cpf && !cpfPattern.test(params.cpf)) {
      throw new ParameterError('CPF deve estar no formato 000.000.000-00 ou conter 11 dígitos');
    }

    // 4. Validação de matrícula (apenas alfanumérico)
    const matriculaPattern = /^[a-zA-Z0-9]+$/;
    if (params.matricula && !matriculaPattern.test(params.matricula)) {
      throw new ParameterError('Matrícula deve conter apenas letras e números');
    }
  }

  /**
   * Valida tokens de busca avançada seguindo FRONTEND_INTEGRATION_GUIDE.md
   */
  validateTokens(tokens: string[]): void {
    // 1. Tokens não podem ser nulos ou vazios
    if (!tokens || tokens.length === 0) {
      throw new ValidationError('Pelo menos um token deve ser fornecido');
    }

    // 2. Limite máximo de tokens (previne DoS)
    if (tokens.length > 50) {
      throw new ValidationError('Número máximo de tokens excedido (máximo: 50)');
    }

    // 3. Não pode terminar com operador
    const lastToken = tokens[tokens.length - 1];
    if (this.VALID_OPERATORS.includes(lastToken)) {
      throw new ValidationError('Busca não pode terminar com operador');
    }

    // 4. Não pode ter operadores consecutivos
    for (let i = 0; i < tokens.length - 1; i++) {
      if (this.VALID_OPERATORS.includes(tokens[i]) && this.VALID_OPERATORS.includes(tokens[i + 1])) {
        throw new ValidationError('Operadores consecutivos não são permitidos');
      }
    }

    // 5. Validar comprimento de cada token
    tokens.forEach(token => {
      if (token.length > 100) {
        throw new ValidationError('Token muito longo (máximo: 100 caracteres)');
      }
    });
  }

  /**
   * Sanitiza parâmetros de entrada removendo caracteres perigosos
   */
  sanitizeParams(params: SimpleSearchDTO): SimpleSearchDTO {
    const sanitize = (value: string | undefined): string | undefined => {
      if (!value) return value;
      // Remove caracteres perigosos e normaliza espaços
      return value.trim().replace(/[<>"';()&+\\]/g, '').replace(/\s+/g, ' ');
    };

    return {
      nome: sanitize(params.nome),
      matricula: sanitize(params.matricula),
      email: sanitize(params.email),
      cpf: sanitize(params.cpf),
      cargo: sanitize(params.cargo)
    };
  }

  /**
   * Sanitiza tokens removendo caracteres perigosos
   */
  sanitizeTokens(tokens: string[]): string[] {
    return tokens
      .filter(token => token && token.trim().length > 0)
      .map(token => token.trim().replace(/[<>"';()&+\\]/g, ''))
      .filter(token => token.length > 0);
  }

  /**
   * Valida ID de tag
   */
  validateTagId(tagId: number): void {
    if (!tagId || tagId <= 0) {
      throw new ParameterError('ID da tag deve ser um número positivo');
    }
  }

  /**
   * Valida nome para busca simples
   */
  validateNomeSearch(nome: string): void {
    if (!nome || nome.trim().length === 0) {
      throw new ValidationError('Nome é obrigatório para busca');
    }

    if (nome.length > 255) {
      throw new ParameterError('Nome deve ter no máximo 255 caracteres');
    }
  }
}