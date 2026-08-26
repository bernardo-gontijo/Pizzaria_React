import { createBrowserRouter } from 'react-router';
import { Layout } from '../components/Layout';
import { CardapioPage }  from '../features/loja/pages/CardapioPage';
import { CategoriaPage } from '../features/loja/pages/CategoriaPage';
import { PizzaDetalhePage } from '../features/loja/pages/PizzaDetalhePage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {index: true, Component: HomePage},
            {path: 'cardapio', Component: CardapioPage},
            {path: 'categoria/:categoria', Component: CategoriaPage},
            {path: 'pizza/:slug', Component: PizzaDetalhePage},
            {path: '*', Component: NotFoundPage}
        ]
    }
]);