import { Grupo } from './Grupo.model';

export interface Tag {
  id?: number;
  name: string;
  description?: string;
  group?: Grupo;
  groupId?: number;
}
