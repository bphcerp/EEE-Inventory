import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

const NotFound = () => {

  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8">Circuit Open! Looks like the path you’re looking for isn't connected.</p>
      <Button onClick={() => navigate('/', { replace : true })}>Return to Home</Button>
    </div>
  );
};

export default NotFound;
