import { BackButton } from './BackButton';
import { LogoutButton } from './LogoutButton';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import { SettingsButton } from './SettingsButton';
import Sidebar from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

interface PageLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const PageLayout = ({ children, activePath = '/' }: PageLayoutProps) => {
  const showBackButton = ['/play', '/detail'].includes(activePath);

  return (
    <div className='app-shell relative min-h-screen w-full overflow-x-clip'>
      <MobileHeader showBackButton={showBackButton} />

      <div className='flex min-h-screen w-full md:grid md:grid-cols-[auto_1fr]'>
        <div className='hidden md:contents'>
          <Sidebar activePath={activePath} />
        </div>

        <div className='relative min-w-0 flex-1'>
          <div className='pointer-events-none fixed left-0 right-0 top-0 z-40 hidden h-20 md:block'>
            {showBackButton && (
              <div className='desktop-back pointer-events-auto absolute top-4 transition-[left] duration-500'>
                <BackButton />
              </div>
            )}
            <div className='pointer-events-auto absolute right-5 top-4 flex items-center gap-2'>
              <SettingsButton />
              <LogoutButton />
              <ThemeToggle />
            </div>
          </div>

          <main
            className='min-h-screen pb-20 md:pb-8'
            style={{
              paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))',
            }}
          >
            {children}
          </main>
        </div>
      </div>

      <div className='md:hidden'>
        <MobileBottomNav activePath={activePath} />
      </div>
    </div>
  );
};

export default PageLayout;
