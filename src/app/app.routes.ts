import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login';
import { Cadastro } from './components/pages/cadastro/cadastro';
import { ColaboradorList } from './components/pages/colaborador-list/colaborador-list';
import { ColaboradorForm } from './components/pages/colaborador-form/colaborador-form';
import { Catalogo } from './components/pages/catalogo/catalogo';
import { Layout } from './components/shared/layout/layout';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'cadastro', component: Cadastro },
    {
        path: '',
        component: Layout,
        canActivate: [AuthGuard],
        children: [
            { path: 'colaboradores', component: ColaboradorList },
            { path: 'colaboradores/novo', component: ColaboradorForm },
            { path: 'colaboradores/editar/:id', component: ColaboradorForm },
            { path: 'catalogo', component: Catalogo },
        ]
    },
    { path: '**', redirectTo: '/login' }
];
