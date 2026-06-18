import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tag } from '../../model/Tag.model';
import { HttpService } from '../http-service';
import { TAG_ENDPOINTS } from '../../config/api-routes';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly httpService = inject(HttpService);

  getAll(): Observable<Tag[]> {
    return this.httpService.get<Tag[]>(TAG_ENDPOINTS.GET_ALL);
  }

  getById(id: number): Observable<Tag> {
    return this.httpService.get<Tag>(TAG_ENDPOINTS.GET_BY_ID(id));
  }

  create(tag: Tag): Observable<Tag> {
    return this.httpService.post<Tag>(TAG_ENDPOINTS.CREATE, tag);
  }

  update(id: number, tag: Partial<Tag>): Observable<Tag> {
    return this.httpService.put<Tag>(TAG_ENDPOINTS.UPDATE(id), tag);
  }

  delete(id: number): Observable<void> {
    return this.httpService.delete<void>(TAG_ENDPOINTS.DELETE(id));
  }
}