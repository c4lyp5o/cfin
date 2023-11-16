'use client';
import { Fragment, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  PlayIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';

import withAuth from '@/app/hoc/withAuth';
import Link from 'next/link';

function Dashboard() {
  return <>Hello</>;
}

export default withAuth(Dashboard);
