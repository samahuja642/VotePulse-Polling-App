import { useParams } from 'react-router-dom';

export default function PollDetail() {
  const { id } = useParams();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Poll Detail &mdash; {id}</h1>
    </div>
  );
}
