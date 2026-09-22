import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { RouterProviderContext } from '../main';

export const Route = createRootRouteWithContext<RouterProviderContext>()({
  component: () => (
    <div className="min-h-screen bg-paper text-ink">
      <Outlet />
    </div>
  ),
});
