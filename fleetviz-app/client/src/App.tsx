import { createBrowserRouter, RouterProvider } from 'react-router';
import { DeliveryMapDashboard } from './pages/DeliveryMapDashboard';

function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-3 shrink-0">
        <h1 className="text-lg font-semibold text-foreground">Fleetviz</h1>
        <p className="text-sm text-muted-foreground">Delivery tracking dashboard</p>
      </header>

      <main className="flex-1 p-6 flex flex-col min-h-0">
        <DeliveryMapDashboard />
      </main>
    </div>
  );
}

export default function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
    },
  ]);

  return <RouterProvider router={router} />;
}
