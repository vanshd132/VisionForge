'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            VisionForge
          </Link>
          <div className="flex space-x-6">
            <Link href="/" className={isActive('/')}>
              Home
            </Link>
            <Link href="/upload" className={isActive('/upload')}>
              Upload Model
            </Link>
            <Link href="/user-models" className={isActive('/user-models')}>
              My Models
            </Link>
            <Link href="/api-docs" className={isActive('/api-docs')}>
              API Docs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 