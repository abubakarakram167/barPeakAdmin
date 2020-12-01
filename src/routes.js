import React from 'react';

import AddBusiness from './views/Business/addBusiness';
import UpdateBusiness from './views/Business/updateBusiness';
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Business = React.lazy(() => import('./views/Business/Business'));
const Category = React.lazy(() => import('./views/Category/Category'));
const CategoryForm = React.lazy(() => import('./views/Forms/CategoryForm'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/business', name: 'Business', component: Business },
  { path:'/addBusiness/:place_id', name: 'AddBusiness', component: AddBusiness },
  { path:'/updateBusiness/:place_id', name: 'UpdateBusiness', component: UpdateBusiness },
  { path:'/category', name: 'Category', component: Category },
  { path:'/categoryAdd/:id', name: 'CategoryForm', component: CategoryForm }    
];

export default routes;
