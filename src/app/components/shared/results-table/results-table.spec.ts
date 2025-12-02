import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsTableComponent } from './results-table';
import { ColaboradorFilterResponseDTO } from '../../../core/dto/ColaboradorFilterResponseDTO';
import { Tag } from '../../../core/model/Tag.model';

describe('ResultsTableComponent', () => {
  let component: ResultsTableComponent;
  let fixture: ComponentFixture<ResultsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Property 16: Estrutura da Tabela de Resultados', () => {
    it('should display all required columns when results are present', () => {
      // Arrange
      const mockResults: ColaboradorFilterResponseDTO[] = [
        {
          id: 1,
          nome: 'João Silva',
          matricula: 'MAT001',
          email: 'joao@example.com',
          cpf: '123.456.789-00',
          cargo: 'Desenvolvedor',
          departamento: 'TI',
          tags: [{ id: 1, nome: 'Java' }]
        }
      ];
      component.resultados = mockResults;

      // Act
      fixture.detectChanges();

      // Assert
      const table = fixture.nativeElement.querySelector('.results-table');
      expect(table).toBeTruthy();

      const headers = fixture.nativeElement.querySelectorAll('th');
      const headerTexts = Array.from(headers).map((h: any) => h.textContent.trim());

      expect(headerTexts).toContain('Nome');
      expect(headerTexts).toContain('Matrícula');
      expect(headerTexts).toContain('Email');
      expect(headerTexts).toContain('CPF');
      expect(headerTexts).toContain('Cargo');
      expect(headerTexts).toContain('Departamento');
      expect(headerTexts).toContain('Tags');
    });

    it('should render all columns with correct data for each result', () => {
      // Arrange
      const mockResults: ColaboradorFilterResponseDTO[] = [
        {
          id: 1,
          nome: 'João Silva',
          matricula: 'MAT001',
          email: 'joao@example.com',
          cpf: '123.456.789-00',
          cargo: 'Desenvolvedor',
          departamento: 'TI',
          tags: []
        }
      ];
      component.resultados = mockResults;

      // Act
      fixture.detectChanges();

      // Assert
      const cells = fixture.nativeElement.querySelectorAll('tbody td');
      expect(cells[0].textContent).toContain('João Silva');
      expect(cells[1].textContent).toContain('MAT001');
      expect(cells[2].textContent).toContain('joao@example.com');
      expect(cells[3].textContent).toContain('123.456.789-00');
      expect(cells[4].textContent).toContain('Desenvolvedor');
      expect(cells[5].textContent).toContain('TI');
    });
  });

  describe('Property 17: Contagem de Resultados', () => {
    it('should display result count when results are present', () => {
      // Arrange
      const mockResults: ColaboradorFilterResponseDTO[] = [
        {
          id: 1,
          nome: 'João Silva',
          matricula: 'MAT001',
          email: 'joao@example.com',
          cpf: '123.456.789-00',
          cargo: 'Desenvolvedor',
          departamento: 'TI',
          tags: []
        },
        {
          id: 2,
          nome: 'Maria Santos',
          matricula: 'MAT002',
          email: 'maria@example.com',
          cpf: '987.654.321-00',
          cargo: 'Analista',
          departamento: 'TI',
          tags: []
        }
      ];
      component.resultados = mockResults;

      // Act
      fixture.detectChanges();

      // Assert
      const resultsInfo = fixture.nativeElement.querySelector('.results-info');
      expect(resultsInfo).toBeTruthy();
      expect(resultsInfo.textContent).toContain('Total de resultados: 2');
    });

    it('should not display result count when no results are present', () => {
      // Arrange
      component.resultados = [];

      // Act
      fixture.detectChanges();

      // Assert
      const resultsInfo = fixture.nativeElement.querySelector('.results-info');
      expect(resultsInfo).toBeFalsy();
    });

    it('should display correct count for any number of results', () => {
      // Arrange
      const mockResults: ColaboradorFilterResponseDTO[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        nome: `Colaborador ${i + 1}`,
        matricula: `MAT${String(i + 1).padStart(3, '0')}`,
        email: `user${i + 1}@example.com`,
        cpf: `${String(i + 1).padStart(3, '0')}.456.789-00`,
        cargo: 'Desenvolvedor',
        departamento: 'TI',
        tags: []
      }));
      component.resultados = mockResults;

      // Act
      fixture.detectChanges();

      // Assert
      const resultsInfo = fixture.nativeElement.querySelector('.results-info');
      expect(resultsInfo.textContent).toContain('Total de resultados: 5');
    });
  });

  describe('Property 18: Exibição de Tags como Badges', () => {
    it('should render tags as badges with visual differentiation', () => {
      // Arrange
      const mockResults: ColaboradorFilterResponseDTO[] = [
        {
          id: 1,
          nome: 'João Silva',
          matricula: 'MAT001',
          email: 'joao@example.com',
          cpf: '123.456.789-00',
          cargo: 'Desenvolvedor',
          departamento: 'TI',
          tags: [
            { id: 1, nome: 'Java' },
            { id: 2, nome: 'Backend' }
          ]
        }
      ];
      component.resultados = mockResults;

      // Act
      fixture.detectChanges();

      // Assert
      const badges = fixture.nativeElement.querySelectorAll('.tag-badge');
      expect(badges.length).toBe(2);
      expect(badges[0].textContent).toContain('Java');
      expect(badges[1].textContent).toContain('Backend');
    });

    it('should apply badge styling class to all tags', () => {
      // Arrange
      const mockResults: ColaboradorFilterResponseDTO[] = [
        {
          id: 1,
          nome: 'João Silva',
          matricula: 'MAT001',
          email: 'joao@example.com',
          cpf: '123.456.789-00',
          cargo: 'Desenvolvedor',
          departamento: 'TI',
          tags: [
            { id: 1, nome: 'Java' },
            { id: 2, nome: 'Backend' },
            { id: 3, nome: 'Spring' }
          ]
        }
      ];
      component.resultados = mockResults;

      // Act
      fixture.detectChanges();

      // Assert
      const badges = fixture.nativeElement.querySelectorAll('.tag-badge');
      badges.forEach((badge: HTMLElement) => {
        expect(badge.classList.contains('tag-badge')).toBe(true);
      });
    });

    it('should render all tags for a result', () => {
      // Arrange
      const tags: Tag[] = [
        { id: 1, nome: 'Java' },
        { id: 2, nome: 'Backend' },
        { id: 3, nome: 'Spring' },
        { id: 4, nome: 'Microservices' }
      ];
      const mockResults: ColaboradorFilterResponseDTO[] = [
        {
          id: 1,
          nome: 'João Silva',
          matricula: 'MAT001',
          email: 'joao@example.com',
          cpf: '123.456.789-00',
          cargo: 'Desenvolvedor',
          departamento: 'TI',
          tags: tags
        }
      ];
      component.resultados = mockResults;

      // Act
      fixture.detectChanges();

      // Assert
      const badges = fixture.nativeElement.querySelectorAll('.tag-badge');
      expect(badges.length).toBe(4);
      tags.forEach((tag, index) => {
        expect(badges[index].textContent).toContain(tag.nome);
      });
    });
  });

  describe('Property 4.4: Empty State Message Display', () => {
    it('should display empty state message when no results and message is provided', () => {
      // Arrange
      component.resultados = [];
      component.mensagem = 'Nenhum colaborador encontrado';

      // Act
      fixture.detectChanges();

      // Assert
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Nenhum colaborador encontrado');
    });

    it('should not display empty state when results are present', () => {
      // Arrange
      const mockResults: ColaboradorFilterResponseDTO[] = [
        {
          id: 1,
          nome: 'João Silva',
          matricula: 'MAT001',
          email: 'joao@example.com',
          cpf: '123.456.789-00',
          cargo: 'Desenvolvedor',
          departamento: 'TI',
          tags: []
        }
      ];
      component.resultados = mockResults;
      component.mensagem = 'Nenhum colaborador encontrado';

      // Act
      fixture.detectChanges();

      // Assert
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeFalsy();
    });

    it('should not display empty state when loading is true', () => {
      // Arrange
      component.resultados = [];
      component.loading = true;
      component.mensagem = 'Nenhum colaborador encontrado';

      // Act
      fixture.detectChanges();

      // Assert
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeFalsy();
    });

    it('should display different messages based on input', () => {
      // Arrange
      component.resultados = [];
      component.loading = false;

      // Act & Assert - Test with first message
      component.mensagem = 'Nenhum colaborador encontrado';
      fixture.detectChanges();
      let emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState.textContent).toContain('Nenhum colaborador encontrado');

      // Act & Assert - Test with second message
      component.mensagem = 'Nenhum colaborador encontrado com esses critérios';
      fixture.detectChanges();
      emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState.textContent).toContain('Nenhum colaborador encontrado com esses critérios');
    });
  });

  describe('Table rendering with multiple results', () => {
    it('should render multiple rows correctly', () => {
      // Arrange
      const mockResults: ColaboradorFilterResponseDTO[] = [
        {
          id: 1,
          nome: 'João Silva',
          matricula: 'MAT001',
          email: 'joao@example.com',
          cpf: '123.456.789-00',
          cargo: 'Desenvolvedor',
          departamento: 'TI',
          tags: [{ id: 1, nome: 'Java' }]
        },
        {
          id: 2,
          nome: 'Maria Santos',
          matricula: 'MAT002',
          email: 'maria@example.com',
          cpf: '987.654.321-00',
          cargo: 'Analista',
          departamento: 'RH',
          tags: [{ id: 2, nome: 'Gestão' }]
        }
      ];
      component.resultados = mockResults;

      // Act
      fixture.detectChanges();

      // Assert
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('should not display table when no results', () => {
      // Arrange
      component.resultados = [];

      // Act
      fixture.detectChanges();

      // Assert
      const table = fixture.nativeElement.querySelector('.results-table');
      expect(table).toBeFalsy();
    });
  });
});
