import React from 'react';

import AddBusiness from './views/Business/addBusiness';
import UpdateBusiness from './views/Business/updateBusiness';
import UpdateRadius from './views/User/updateRadius';
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Business = React.lazy(() => import('./views/Business/Business'));
const Category = React.lazy(() => import('./views/Category/Category'));
const CategoryForm = React.lazy(() => import('./views/Forms/CategoryForm'));
const LoginPage  = React.lazy(() => import('./components/LoginPage'));

const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/business', name: 'Business', component: Business },
  { path:'/addBusiness/:place_id/category/:category_id/auto/:auto_submit', name: 'AddBusiness', component: AddBusiness },
  { path:'/updateBusiness/:place_id/category/:category_id', name: 'UpdateBusiness', component: UpdateBusiness },
  { path:'/category', name: 'Category', component: Category },
  { path:'/user/updateRadius', name: 'updateRadius', component: UpdateRadius },  
  { path:'/categoryAdd/:id', name: 'CategoryForm', component: CategoryForm },
        
];

export default routes;
