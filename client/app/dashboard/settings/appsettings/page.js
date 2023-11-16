'use client';
import afterLogin from '@/app/hoc/afterLogin';

function AppSettings() {
  return <>Hello im app settings</>;
}

export default afterLogin(AppSettings);
