"use client";

import { logoutStaffAction } from "@/app/staff/login/actions";

interface Props {
  staff: {
    full_name: string;
    email: string;
    job_title?: string | null;
    phone?: string | null;
  };
}

export function StaffPendingView({ staff }: Props) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-navy-100 p-8">
          <div className="w-14 h-14 bg-crimson-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-crimson-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="font-display text-2xl font-semibold text-navy-900 mb-2">
            Account Pending Approval
          </h1>
          <p className="text-navy-500 text-sm mb-6">
            Hi {staff.full_name}, your account has been registered. The super admin will review and activate it shortly. You&apos;ll receive an email once you&apos;re approved.
          </p>

          <div className="bg-navy-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Name</span>
              <span className="text-navy-800 font-medium">{staff.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Email</span>
              <span className="text-navy-800 font-medium">{staff.email}</span>
            </div>
            {staff.job_title && (
              <div className="flex justify-between text-sm">
                <span className="text-navy-400">Role</span>
                <span className="text-navy-800 font-medium">{staff.job_title}</span>
              </div>
            )}
          </div>

          <form action={logoutStaffAction}>
            <button
              type="submit"
              className="text-sm text-navy-400 hover:text-navy-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
