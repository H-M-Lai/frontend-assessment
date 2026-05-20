'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCcw, Search } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'

type Country = {
  name: {
    common: string
  }
  capital?: string[]
  flags: {
    png?: string
    svg?: string
    alt?: string
  }
  population: number
  region: string
  cca3: string
}

const PAGE_SIZE = 24

export default function PublicApiPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Keep the raw fetch separate so initial load and retry can reuse it.
  async function getCountries() {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags,population,region,cca3')

    if (!response.ok) {
      throw new Error('Unable to load countries.')
    }

    const data = (await response.json()) as Country[]
    return data.sort((a, b) => a.name.common.localeCompare(b.name.common))
  }

  // Retry path resets UI state before requesting the public API again.
  async function fetchCountries() {
    setLoading(true)
    setError(null)

    try {
      const data = await getCountries()
      setCountries(data.sort((a, b) => a.name.common.localeCompare(b.name.common)))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load countries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load uses promise callbacks to satisfy the React Compiler lint rule.
    getCountries()
      .then((data) => {
        setCountries(data)
      })
      .catch((error) => {
        setError(error instanceof Error ? error.message : 'Unable to load countries.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filteredCountries = useMemo(() => {
    // Client-side search keeps the API request simple and responsive.
    return countries.filter((country) =>
      country.name.common.toLowerCase().includes(search.trim().toLowerCase()),
    )
  }, [countries, search])

  const totalPages = Math.max(1, Math.ceil(filteredCountries.length / PAGE_SIZE))
  const visibleCountries = filteredCountries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Countries</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Country flags, capitals, regions, and population from REST Countries.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCountries}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search countries..."
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
          />
        </div>
      </section>

      {loading ? <LoadingState message="Loading countries..." /> : null}

      {!loading && error ? (
        <ErrorState message={error} onRetry={fetchCountries} />
      ) : null}

      {!loading && !error && filteredCountries.length === 0 ? (
        <EmptyState title="No countries found" message="Try a different search term." />
      ) : null}

      {!loading && !error && filteredCountries.length > 0 ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCountries.map((country) => (
              <article key={country.cca3} className="rounded-md border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={country.flags.svg ?? country.flags.png}
                    alt={country.flags.alt ?? `${country.name.common} flag`}
                    className="h-12 w-16 rounded border border-slate-200 object-cover dark:border-slate-800"
                  />

                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-slate-950 dark:text-slate-100">
                      {country.name.common}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{country.region}</p>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">Capital</dt>
                    <dd className="text-right font-medium text-slate-800 dark:text-slate-200">
                      {country.capital?.join(', ') || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">Population</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-200">
                      {country.population.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>

          <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {visibleCountries.length} of {filteredCountries.length} countries
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </main>
  )
}
