import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';

import { Cadastro } from './cadastro';

describe('Cadastro', () => {
  let component: Cadastro;
  let fixture: ComponentFixture<Cadastro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cadastro],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cadastro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
