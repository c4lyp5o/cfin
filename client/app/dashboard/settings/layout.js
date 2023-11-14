'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const path = usePathname();

  const tabs = [
    {
      name: 'App Settings',
      href: '/dashboard/settings/appsettings',
      current: true,
    },
    {
      name: 'User Management',
      href: '/dashboard/settings/usermanagement',
      current: true,
    },
    {
      name: 'Shared Folders',
      href: '/dashboard/settings/sharedfolders',
      current: true,
    },
    { name: 'Sign Out', href: '/dashboard/settings/signout', current: true },
  ];

  return (
    <div>
      <div className='sm:hidden'>
        <label htmlFor='tabs' className='sr-only'>
          Select a tab
        </label>
        <select
          id='tabs'
          name='tabs'
          className='block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          defaultValue={tabs.find((tab) => tab.current).name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className='hidden sm:block'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex' aria-label='Tabs'>
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`${
                  path === tab.href
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium`}
                aria-current={path === tab.href ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
