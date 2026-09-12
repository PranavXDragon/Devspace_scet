
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/services/axiosInstance';

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This will fetch from our new API once Supabase is connected
    const fetchProblems = async () => {
      try {
        const res = await axiosInstance.get('/coding/problems');
        setProblems(res.data || []);
      } catch (err) {
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold font-headline text-text'>Coding Problems</h1>
        <Link href='/student/ide' className='px-4 py-2 bg-primary text-text font-semibold rounded hover:bg-primary/90'>
          Open Free IDE
        </Link>
      </div>

      <div className='bg-card rounded-lg overflow-hidden border border-border-soft'>
        <table className='w-full text-left'>
          <thead className='bg-card-hover text-text-muted'>
            <tr>
              <th className='px-6 py-3 font-semibold'>Title</th>
              <th className='px-6 py-3 font-semibold'>Difficulty</th>
              <th className='px-6 py-3 font-semibold'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border-soft text-text'>
            {loading ? (
              <tr><td colSpan='3' className='px-6 py-4 text-center'>Loading problems...</td></tr>
            ) : problems.length === 0 ? (
              <tr><td colSpan='3' className='px-6 py-4 text-center'>No problems found. Start by adding some in the database!</td></tr>
            ) : (
              problems.map((p) => (
                <tr key={p.id} className='hover:bg-card-hover/50 transition-colors'>
                  <td className='px-6 py-4 font-medium'>{p.title}</td>
                  <td className='px-6 py-4'>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <Link href={`/student/ide?problem=${p.id}`} className='text-primary hover:underline font-semibold'>
                      Solve
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
