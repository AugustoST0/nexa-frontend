import { Injectable } from '@angular/core';
import { 
  ValidationError, 
  ParameterError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  InternalServerError, 
  NetworkError 
} from '../errors/search-errors';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  /**
   * Trata erros de resposta HTTP seguindo FRONTEND_INTEGRATION_GUIDE.md
   */
  async handleErrorResponse(response: Response): Promise<Error> {
    try {
      const errorData = await response.json();

      switch (response.status) {
        case 400:
          if (errorData.message === 'VALIDATION_ERROR') {
            return new ValidationError(errorData.code);
          } else if (errorData.message === 'INVALID_PARAMETERS') {
            return new ParameterError(errorData.code);
          }
          return new BadRequestError(errorData.code);

        case 401:
          return new UnauthorizedError('Token inválido ou expirado');

        case 403:
          return new ForbiddenError('Sem permissão para realizar esta operação');

        case 500:
          return new InternalServerError('Erro interno do servidor');

        default:
          return new NetworkError(`Erro HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (parseError) {
      return new NetworkError('Erro de comunicação com o servidor');
    }
  }

  /**
   * Trata erros de rede
   */
  handleNetworkError(error: any): Error {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new NetworkError('Erro de conexão com o servidor');
    }
    return error;
  }

  /**
   * Converte erro para mensagem amigável ao usuário
   */
  getErrorMessage(error: Error): string {
    switch (error.name) {
      case 'ValidationError':
        return error.message;
      case 'ParameterError':
        return error.message;
      case 'BadRequestError':
        return `Erro na requisição: ${error.message}`;
      case 'UnauthorizedError':
        return 'Sessão expirada. Faça login novamente.';
      case 'ForbiddenError':
        return 'Você não tem permissão para realizar esta operação.';
      case 'InternalServerError':
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      case 'NetworkError':
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      default:
        return 'Erro inesperado. Tente novamente.';
    }
  }
}