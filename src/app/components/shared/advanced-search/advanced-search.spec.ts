import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancedSearchComponent } from './advanced-search';

describe('AdvancedSearchComponent', () => {
  let component: AdvancedSearchComponent;
  let fixture: ComponentFixture<AdvancedSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSearchComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Token Addition', () => {
    it('should add a token when addToken is called with valid input', () => {
      component.tokenInput = 'Java';
      component.addToken();
      expect(component.tokens).toContain('Java');
      expect(component.tokenInput).toBe('');
    });

    it('should emit tokensChange when a token is added', () => {
      spyOn(component.tokensChange, 'emit');
      component.tokenInput = 'Backend';
      component.addToken();
      expect(component.tokensChange.emit).toHaveBeenCalledWith(['Backend']);
    });

    it('should not add empty tokens', () => {
      component.tokenInput = '   ';
      component.addToken();
      expect(component.tokens.length).toBe(0);
    });

    it('should trim whitespace from tokens', () => {
      component.tokenInput = '  Java  ';
      component.addToken();
      expect(component.tokens[0]).toBe('Java');
    });

    it('should add token on Enter key press', () => {
      component.tokenInput = 'Python';
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      component.onKeyPress(event);
      expect(component.tokens).toContain('Python');
    });

    it('should not add token on other key press', () => {
      component.tokenInput = 'Python';
      const event = new KeyboardEvent('keypress', { key: 'a' });
      component.onKeyPress(event);
      expect(component.tokens.length).toBe(0);
    });
  });

  describe('Token Removal', () => {
    it('should remove a token at specified index', () => {
      component.tokens = ['Java', 'Python', 'Go'];
      component.removeToken(1);
      expect(component.tokens).toEqual(['Java', 'Go']);
    });

    it('should emit tokensChange when a token is removed', () => {
      component.tokens = ['Java', 'Python'];
      spyOn(component.tokensChange, 'emit');
      component.removeToken(0);
      expect(component.tokensChange.emit).toHaveBeenCalledWith(['Python']);
    });

    it('should handle removing the only token', () => {
      component.tokens = ['Java'];
      component.removeToken(0);
      expect(component.tokens.length).toBe(0);
    });
  });

  describe('Search Validation', () => {
    it('should return false when no tokens are present', () => {
      component.tokens = [];
      expect(component.isSearchValid()).toBe(false);
    });

    it('should return true when at least one token is present', () => {
      component.tokens = ['Java'];
      expect(component.isSearchValid()).toBe(true);
    });

    it('should display validation message when searching with no tokens', () => {
      component.tokens = [];
      component.onSearch();
      expect(component.validationMessage).toBe('Adicione pelo menos um token de busca');
    });

    it('should not emit search event when validation fails', () => {
      component.tokens = [];
      spyOn(component.search, 'emit');
      component.onSearch();
      expect(component.search.emit).not.toHaveBeenCalled();
    });

    it('should emit search event when validation passes', () => {
      component.tokens = ['Java'];
      spyOn(component.search, 'emit');
      component.onSearch();
      expect(component.search.emit).toHaveBeenCalledWith(['Java']);
    });

    it('should clear validation message on successful search', () => {
      component.validationMessage = 'Some error';
      component.tokens = ['Java'];
      component.onSearch();
      expect(component.validationMessage).toBe('');
    });
  });

  describe('Clear Functionality', () => {
    it('should clear all tokens', () => {
      component.tokens = ['Java', 'Python', 'Go'];
      component.onClear();
      expect(component.tokens.length).toBe(0);
    });

    it('should clear token input', () => {
      component.tokenInput = 'Java';
      component.onClear();
      expect(component.tokenInput).toBe('');
    });

    it('should clear validation message', () => {
      component.validationMessage = 'Some error';
      component.onClear();
      expect(component.validationMessage).toBe('');
    });

    it('should emit tokensChange when clearing', () => {
      component.tokens = ['Java'];
      spyOn(component.tokensChange, 'emit');
      component.onClear();
      expect(component.tokensChange.emit).toHaveBeenCalledWith([]);
    });

    it('should emit clear event', () => {
      spyOn(component.clear, 'emit');
      component.onClear();
      expect(component.clear.emit).toHaveBeenCalled();
    });
  });

  describe('Multiple Token Operations', () => {
    it('should handle adding multiple tokens sequentially', () => {
      component.tokenInput = 'Java';
      component.addToken();
      component.tokenInput = 'Backend';
      component.addToken();
      component.tokenInput = 'Senior';
      component.addToken();
      expect(component.tokens).toEqual(['Java', 'Backend', 'Senior']);
    });

    it('should maintain token order', () => {
      component.tokens = ['A', 'B', 'C', 'D'];
      component.removeToken(1);
      expect(component.tokens).toEqual(['A', 'C', 'D']);
    });

    it('should handle adding duplicate tokens', () => {
      component.tokenInput = 'Java';
      component.addToken();
      component.tokenInput = 'Java';
      component.addToken();
      expect(component.tokens).toEqual(['Java', 'Java']);
    });
  });

  describe('Help Text and Examples Display', () => {
    it('should display help section with operator explanations', () => {
      const compiled = fixture.nativeElement;
      const helpSection = compiled.querySelector('.help-section');
      expect(helpSection).toBeTruthy();
      
      const helpText = helpSection.textContent;
      expect(helpText).toContain('E');
      expect(helpText).toContain('OU');
      expect(helpText).toContain('NÃO POSSUI');
    });

    it('should display examples section with query examples', () => {
      const compiled = fixture.nativeElement;
      const examplesSection = compiled.querySelector('.examples-section');
      expect(examplesSection).toBeTruthy();
      
      const examplesText = examplesSection.textContent;
      expect(examplesText).toContain('Java');
      expect(examplesText).toContain('Backend');
      expect(examplesText).toContain('Frontend');
    });

    it('should include simple search example', () => {
      const compiled = fixture.nativeElement;
      const examplesSection = compiled.querySelector('.examples-section');
      const examplesText = examplesSection.textContent;
      
      // Simple search example: "Java"
      expect(examplesText).toMatch(/Java\s*-\s*Busca colaboradores com a tag/);
    });

    it('should include AND operator example', () => {
      const compiled = fixture.nativeElement;
      const examplesSection = compiled.querySelector('.examples-section');
      const examplesText = examplesSection.textContent;
      
      // AND example: "Java E Backend"
      expect(examplesText).toContain('E');
      expect(examplesText).toContain('AMBAS');
    });

    it('should include OR operator example', () => {
      const compiled = fixture.nativeElement;
      const examplesSection = compiled.querySelector('.examples-section');
      const examplesText = examplesSection.textContent;
      
      // OR example: "Java OU Python"
      expect(examplesText).toContain('OU');
      expect(examplesText).toContain('uma das tags');
    });

    it('should include exclusion example', () => {
      const compiled = fixture.nativeElement;
      const examplesSection = compiled.querySelector('.examples-section');
      const examplesText = examplesSection.textContent;
      
      // Exclusion example: "Java E NÃO POSSUI Trainee"
      expect(examplesText).toContain('NÃO POSSUI');
      expect(examplesText).toContain('mas sem');
    });

    it('should include combination example', () => {
      const compiled = fixture.nativeElement;
      const examplesSection = compiled.querySelector('.examples-section');
      const examplesText = examplesSection.textContent;
      
      // Combination example: "Backend OU Frontend E NÃO POSSUI Estagiário"
      expect(examplesText).toContain('Combinações complexas');
    });

    it('should have help section before token input', () => {
      const compiled = fixture.nativeElement;
      const helpSection = compiled.querySelector('.help-section');
      const tokenInputSection = compiled.querySelector('.token-input-section');
      
      expect(helpSection).toBeTruthy();
      expect(tokenInputSection).toBeTruthy();
      
      // Help section should appear before token input in DOM
      const helpIndex = Array.from(compiled.querySelectorAll('div')).indexOf(helpSection);
      const tokenIndex = Array.from(compiled.querySelectorAll('div')).indexOf(tokenInputSection);
      expect(helpIndex).toBeLessThan(tokenIndex);
    });

    it('should have examples section between help and token input', () => {
      const compiled = fixture.nativeElement;
      const helpSection = compiled.querySelector('.help-section');
      const examplesSection = compiled.querySelector('.examples-section');
      const tokenInputSection = compiled.querySelector('.token-input-section');
      
      expect(helpSection).toBeTruthy();
      expect(examplesSection).toBeTruthy();
      expect(tokenInputSection).toBeTruthy();
      
      // Order should be: help -> examples -> token input
      const allDivs = Array.from(compiled.querySelectorAll('div'));
      const helpIndex = allDivs.indexOf(helpSection);
      const examplesIndex = allDivs.indexOf(examplesSection);
      const tokenIndex = allDivs.indexOf(tokenInputSection);
      
      expect(helpIndex).toBeLessThan(examplesIndex);
      expect(examplesIndex).toBeLessThan(tokenIndex);
    });
  });
});
