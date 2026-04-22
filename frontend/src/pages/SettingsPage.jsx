import React from 'react';
import { Settings, Lock, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-primary-navy/5 rounded-3xl">
          <Settings className="w-8 h-8 text-primary-navy" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-primary-navy tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium">Manage your profile, notifications, and security</p>
        </div>
      </div>

      <div className="grid gap-8">
        <section className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-accent-amber" />
            <h2 className="text-xl font-bold text-primary-navy">Profile Information</h2>
          </div>
          <p className="text-slate-500">Profile editing is coming soon in the next update.</p>
        </section>

        <section className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-accent-amber" />
            <h2 className="text-xl font-bold text-primary-navy">Security</h2>
          </div>
          <button className="px-6 py-2.5 font-bold text-primary-navy border-2 border-primary-navy rounded-xl hover:bg-slate-50">
            Change Password
          </button>
        </section>

        <section className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-accent-amber" />
            <h2 className="text-xl font-bold text-primary-navy">Notifications</h2>
          </div>
          <p className="text-slate-500">Notification preferences management is under construction.</p>
        </section>
      </div>
    </div>
  );
}
