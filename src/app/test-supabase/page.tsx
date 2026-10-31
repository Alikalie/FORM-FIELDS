import { Suspense } from "react";
import { createClient } from '@/lib/supabase/server'

async function SupabaseStatus() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  return (
    <main className="min-h-screen bg-slate-50 p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Supabase Connection Test
        </h1>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 p-6 text-red-700">
            <h2 className="font-bold">Connection failed</h2>
            <p className="mt-2">{error.message}</p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-bold text-green-700">
              Supabase connected successfully!
            </h2>

            <pre className="mt-6 overflow-auto rounded-lg bg-slate-100 p-4 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  )
}

export default function TestSupabase() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 p-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-slate-900">
              Supabase Connection Test
            </h1>
            <p className="mt-6 rounded-xl bg-white p-6 text-slate-600 shadow-sm">
              Checking Supabase connection...
            </p>
          </div>
        </main>
      }
    >
      <SupabaseStatus />
    </Suspense>
  );
}