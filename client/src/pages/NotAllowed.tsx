import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

const NotAllowed = () => {

  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="mb-8">You don't have permission to view this page.</p>
      <Button onClick={() => navigate('/', { replace : true })}>Return to Home</Button>
    </div>
  );
};

export default NotAllowed;
