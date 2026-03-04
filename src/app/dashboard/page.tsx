import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();

  // This should never happen because middleware protects /dashboard,
  // but it keeps the page safe if middleware is disabled.
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>You must be signed in to view this page.</p>
      </div>
    );
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-200 p-6">
          <div className="font-medium">Next steps</div>
          <ul className="mt-3 list-disc pl-5 text-gray-700 space-y-1">
            <li>Save scenarios to your account</li>
            <li>Load previously saved scenarios</li>
            <li>Add inflation/tax toggles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}