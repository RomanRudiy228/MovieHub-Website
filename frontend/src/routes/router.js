import { renderPopularPage } from '../pages/popular.js';
import { renderMoviePage } from '../pages/moviesDet.js';

const normalizePath = (path) => {
    return path.replace(/^\/frontend\/src/, '').replace(/\/$/, '') || '/';
};

export class Router {
    constructor(routes) {
        this.routes = routes;
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => {
            console.log('popstate triggered');
            this.route(); 
            location.reload(); 
        });
        this.route();  
    }

    route() {
        const path = normalizePath(window.location.pathname);
        console.log('Routing to:', path);

        const route = this.routes.find(r => r.path instanceof RegExp ? r.path.test(path) : r.path === path);

        if (route) {
            const params = route.path instanceof RegExp 
                ? [...route.path.exec(path)].slice(1) 
                : [];
            route.render(params);  
        } else {
            console.error('Route not found:', path);
            const notFoundRoute = this.routes.find(r => r.path === '/404');
            if (notFoundRoute) {
                notFoundRoute.render();
            }
        }
    }

    navigate(path) {
        if (normalizePath(window.location.pathname) === path) {
            console.log('Already on the requested path:', path);
            return;
        }
        console.log('Navigating to:', path);
        window.history.pushState(null, '', path);
        this.route();
    }
}

const routes = [
    // {
    //     path: '/index.html',
    //     render: () => {
    //         console.log('Rendering index page');
    //     },
    // },
    {
        path: '/',
        render: () => {
            console.log('Rendering home page');
        },
    },
    {
        path: '/popular',
        render: renderPopularPage,
    },
    {
        path: /^\/movies\/(\d+)$/,
        render: (params) => renderMoviePage(params[0]),
    },
    {
        path: '../pages/404',
        render: () => {
            console.log('Rendering 404 page');
        },
    },
];

export const router = new Router(routes);
