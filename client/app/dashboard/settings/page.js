// pages/settings.js
'use client';
import afterLogin from '@/app/hoc/afterLogin';

function Settings() {
  return <div>Hello im settings</div>;
}

export default afterLogin(Settings);
