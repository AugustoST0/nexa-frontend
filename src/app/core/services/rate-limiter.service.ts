import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RateLimiterService {
  private requests: number[] = [];
  private readonly maxRequests = 50; // Aumentado de 10 para 50
  private readonly timeWindow = 60000; // 1 minuto

  /**
   * Verifica se pode fazer uma nova requisição baseado no rate limiting
   */
  canMakeRequest(): boolean {
    const now = Date.now();

    // Remove requisições antigas
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    // Verifica se pode fazer nova requisição
    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  /**
   * Retorna quantas requisições restam no período atual
   */
  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  /**
   * Retorna quando o rate limit será resetado
   */
  getResetTime(): Date {
    if (this.requests.length === 0) {
      return new Date();
    }
    
    const oldestRequest = Math.min(...this.requests);
    return new Date(oldestRequest + this.timeWindow);
  }

  /**
   * Reseta o rate limiter (útil para desenvolvimento/testes)
   */
  reset(): void {
    this.requests = [];
    console.log('🔄 Rate limiter resetado');
  }
}