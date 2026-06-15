import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login';
import { Cadastro } from './components/pages/cadastro/cadastro';
import { ColaboradorList } from './components/pages/colaborador-list/colaborador-list';
import { ColaboradorForm } from './components/pages/colaborador-form/colaborador-form';
import { Catalogo } from './components/pages/catalogo/catalogo';
import { Home } from './components/pages/home/home';
import { Relatorios } from './components/pages/relatorios/relatorios';
import { Layout } from './components/shared/layout/layout';
import { AuthGuard } from './core/guards/auth-guard';
import { AdminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: '',
        component: Layout,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: Home },
            { path: 'colaboradores', component: ColaboradorList },
            { path: 'colaboradores/novo', component: ColaboradorForm },
            { path: 'colaboradores/editar/:id', component: ColaboradorForm },
            { path: 'catalogo', component: Catalogo },
            { path: 'relatorios', component: Relatorios },
            { path: 'usuarios/cadastro', component: Cadastro, canActivate: [AdminGuard] },
        ]
    },
    { path: '**', redirectTo: '/login' }
];
