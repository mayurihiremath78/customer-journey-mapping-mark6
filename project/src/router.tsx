import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import ComparePage from './pages/ComparePage';
import ReviewsPage from './pages/ReviewsPage';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import NotFound from './components/layout/NotFound';
import JourneyPage from './pages/JourneyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrandProductsPage from './components/products/BrandProductsPage';
import Brands from './components/products/BrandsPage';
import ProductJourneyDashboard from './components/products/ProductJourneyDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'compare',
        element: (
          <ProtectedRoute>
            <ComparePage />
          </ProtectedRoute>
        ),
      },
      
      {
        path: 'user',
        element: (
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: <AdminPage />   
      },
      {
        path: 'journey',
        element: (
          <ProtectedRoute>
            <JourneyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/journey/:productId',
        element: (
          <ProtectedRoute>
            <JourneyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      
      {
        path: 'register',
        element: <RegisterPage />,
      },
      
      
      {
        path:'brands/:brandId',
        element: <BrandProductsPage />,
      },
      {
        path:'brands',
        element: <Brands />,
      },
      {
        path:'productjourney',
        element: (
          <ProtectedRoute>
            <ProductJourneyDashboard />
          </ProtectedRoute>
        ),
      }, 
      {
        path:'reviews',
        element: <ReviewsPage />,
      },
      
    ],
  },
]);

export default router;