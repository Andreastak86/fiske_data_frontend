"use client";

import { useEffect, useState } from "react";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface Summary {
    total_catches: number;
    unique_species: number;
    unique_locations: number;
    biggest_fish_kg: number | null;
    most_common_species: string | null;
    last_trip_date: string | null;
}

interface SpeciesCount {
    species: string;
    count: number;
}

interface Catch {
    id: number;
    date: string;
    location: string;
    species: string;
    length_cm: number | null;
    weight_kg: number | null;
    method: string | null;
    weather: string | null;
    water_temp_c: number | null;
    notes: string | null;
}

export default function HomePage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [speciesCounts, setSpeciesCounts] = useState<SpeciesCount[]>([]);
    const [catches, setCatches] = useState<Catch[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedSpecies, setSelectedSpecies] = useState<string>("");

    useEffect(() => {
        async function load() {
            try {
                const [summaryRes, speciesRes, catchesRes] = await Promise.all([
                    fetch(`${API_BASE}/api/summary`),
                    fetch(`${API_BASE}/api/species`),
                    fetch(`${API_BASE}/api/catches`),
                ]);

                const summaryData: Summary = await summaryRes.json();
                const speciesData: SpeciesCount[] = await speciesRes.json();
                const catchesData: Catch[] = await catchesRes.json();

                setSummary(summaryData);
                setSpeciesCounts(speciesData);
                setCatches(catchesData.slice(0, 15));
            } catch (err) {
                console.error("Feil ved henting av data:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    async function handleSpeciesChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const value = e.target.value;
        setSelectedSpecies(value);
        setLoading(true);
        try {
            const url =
                value === ""
                    ? `${API_BASE}/api/catches`
                    : `${API_BASE}/api/catches?species=${encodeURIComponent(
                          value
                      )}`;
            const res = await fetch(url);
            const data: Catch[] = await res.json();
            setCatches(data.slice(0, 15));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className='min-h-screen bg-sky-50 text-slate-900 flex flex-col items-center py-10 px-4'>
            <div className='w-full max-w-5xl space-y-8'>
                <header className='space-y-2'>
                    <h1 className='text-3xl md:text-4xl font-bold text-sky-900'>
                        Fangstdashboard 🎣
                    </h1>
                    <p className='text-sky-800'>Sol, sjø og statistikk</p>
                </header>

                {loading && !summary && (
                    <p className='text-sky-700'>Henter data fra fjorden… 🌊</p>
                )}

                {summary && (
                    <section className='grid gap-4 md:grid-cols-4'>
                        <Card
                            title='Totalt antall fangster'
                            value={summary.total_catches}
                        />
                        <Card
                            title='Unike arter'
                            value={summary.unique_species}
                        />
                        <Card
                            title='Unike områder'
                            value={summary.unique_locations}
                        />
                        <Card
                            title='Største fisk (kg)'
                            value={
                                summary.biggest_fish_kg
                                    ? summary.biggest_fish_kg.toFixed(1)
                                    : "–"
                            }
                        />
                    </section>
                )}

                {summary && (
                    <section className='grid gap-4 md:grid-cols-2'>
                        <Card
                            title='Mest vanlig art'
                            value={summary.most_common_species ?? "–"}
                        />
                        <Card
                            title='Siste tur'
                            value={summary.last_trip_date ?? "–"}
                        />
                    </section>
                )}

                <section className='space-y-4'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                        <h2 className='text-2xl font-semibold text-sky-900'>
                            Arter
                        </h2>
                        <div className='flex items-center gap-2'>
                            <label className='text-sm text-sky-800'>
                                Filtrer fangster på art:
                            </label>
                            <select
                                value={selectedSpecies}
                                onChange={handleSpeciesChange}
                                className='bg-white border border-sky-200 rounded px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400'
                            >
                                <option value=''>Alle arter</option>
                                {speciesCounts.map((s) => (
                                    <option key={s.species} value={s.species}>
                                        {s.species} ({s.count})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='grid gap-2 md:grid-cols-3'>
                        {speciesCounts.map((s) => (
                            <div
                                key={s.species}
                                className='bg-white border border-sky-100 rounded-lg px-4 py-3 shadow-sm'
                            >
                                <p className='font-semibold text-sky-900'>
                                    {s.species}
                                </p>
                                <p className='text-sm text-sky-700'>
                                    {s.count} fangster
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className='space-y-3'>
                    <h2 className='text-2xl font-semibold text-sky-900'>
                        Siste fangster
                    </h2>

                    {loading && (
                        <p className='text-sky-700 text-sm'>
                            Oppdaterer listen…
                        </p>
                    )}

                    <div className='overflow-x-auto rounded-xl border border-sky-200 shadow-sm bg-white'>
                        <table className='min-w-full text-sm'>
                            <thead className='bg-sky-100/80'>
                                <tr>
                                    <Th>Dato</Th>
                                    <Th>Sted</Th>
                                    <Th>Art</Th>
                                    <Th>Lengde (cm)</Th>
                                    <Th>Vekt (kg)</Th>
                                    <Th>Metode</Th>
                                    <Th>Notat</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {catches.map((c) => (
                                    <tr
                                        key={c.id}
                                        className='border-t border-sky-100 odd:bg-white even:bg-sky-50/60'
                                    >
                                        <Td>{c.date}</Td>
                                        <Td>{c.location}</Td>
                                        <Td>{c.species}</Td>
                                        <Td>{c.length_cm ?? "–"}</Td>
                                        <Td>{c.weight_kg ?? "–"}</Td>
                                        <Td>{c.method ?? "–"}</Td>
                                        <Td className='max-w-[220px] truncate'>
                                            {c.notes ?? "–"}
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Card({ title, value }: { title: string; value: string | number }) {
    return (
        <div className='bg-white border border-sky-100 rounded-xl px-4 py-3 flex flex-col gap-1 shadow-sm'>
            <span className='text-xs uppercase tracking-wide text-sky-600'>
                {title}
            </span>
            <span className='text-2xl font-semibold text-slate-900'>
                {value}
            </span>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th className='text-left px-3 py-2 text-xs font-semibold text-sky-900'>
            {children}
        </th>
    );
}

function Td({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <td
            className={`px-3 py-2 text-slate-900 text-xs md:text-sm ${
                className ?? ""
            }`}
        >
            {children}
        </td>
    );
}
