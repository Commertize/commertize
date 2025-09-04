// Simple test component to debug image loading
const TeamSimple = () => {
  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl mb-8 text-black">Team Images Debug Test</h1>
      <div className="space-y-8">
        <div className="p-4 border border-gray-300 rounded">
          <h3 className="text-lg font-semibold mb-2 text-black">Cameron (CEO) - image3.png</h3>
          <img 
            src="/team/image3.png" 
            alt="Cameron" 
            className="w-64 h-64 object-cover border-2 border-red-500 rounded"
            style={{ display: 'block', maxWidth: '256px', maxHeight: '256px' }}
            onLoad={() => console.log('Cameron image loaded successfully')}
            onError={(e) => console.error('Cameron image failed:', e)}
          />
        </div>
        
        <div className="p-4 border border-gray-300 rounded">
          <h3 className="text-lg font-semibold mb-2 text-black">Ethan (VP Capital) - image4.png</h3>
          <img 
            src="/team/image4.png" 
            alt="Ethan" 
            className="w-64 h-64 object-cover border-2 border-blue-500 rounded"
            style={{ display: 'block', maxWidth: '256px', maxHeight: '256px' }}
            onLoad={() => console.log('Ethan image loaded successfully')}
            onError={(e) => console.error('Ethan image failed:', e)}
          />
        </div>
        
        <div className="p-4 border border-gray-300 rounded">
          <h3 className="text-lg font-semibold mb-2 text-black">All Team Images Grid</h3>
          <div className="grid grid-cols-3 gap-4">
            <img src="/team/image0.png" alt="Iman" className="w-32 h-32 object-cover border rounded" />
            <img src="/team/image1.png" alt="Hector" className="w-32 h-32 object-cover border rounded" />
            <img src="/team/image2.png" alt="Daniel" className="w-32 h-32 object-cover border rounded" />
            <img src="/team/image3.png" alt="Cameron" className="w-32 h-32 object-cover border rounded" />
            <img src="/team/image4.png" alt="Ethan" className="w-32 h-32 object-cover border rounded" />
            <img src="/team/image5.png" alt="Abba" className="w-32 h-32 object-cover border rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSimple;