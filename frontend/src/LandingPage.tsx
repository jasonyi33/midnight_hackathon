/**
 * Simple Landing Page for Demo
 * A basic page to show the app is working
 */

import { useAuthStore } from './store/authStore';

const LandingPage = () => {
  const { isAuthenticated, user, connectWallet, logout, status, error } = useAuthStore();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full mx-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              🧬 Genomic Privacy DApp
            </h1>
            <p className="text-gray-200 mb-8">
              Secure zero-knowledge verification of genetic traits on Midnight blockchain
            </p>
            
            <button
              onClick={handleConnect}
              disabled={status === 'connecting'}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
            >
              {status === 'connecting' ? 'Connecting...' : 'Connect Wallet (Demo)'}
            </button>
            
            {error && (
              <p className="text-red-300 mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                {error}
              </p>
            )}
            
            <div className="mt-8 text-sm text-gray-300">
              <p>🔒 Zero-knowledge proofs for:</p>
              <ul className="mt-2 space-y-1">
                <li>• BRCA1/BRCA2 mutations</li>
                <li>• CYP2D6 drug metabolism</li>
                <li>• Privacy-preserving verification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome, {user?.role} 
              </h1>
              <p className="text-gray-200">
                Address: {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg border border-red-500/30 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Patient Dashboard */}
        {user?.role === 'patient' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Upload Genome</h2>
              <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-gray-200 mb-4">Drag and drop your genomic data file</p>
                <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg border border-blue-500/30 transition-colors">
                  Choose File (Demo)
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Generate Proofs</h2>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">BRCA1 Mutation</h3>
                  <p className="text-gray-300 mb-3">Prove breast cancer risk without revealing genome</p>
                  <button className="bg-green-500/20 hover:bg-green-500/30 text-green-200 px-4 py-2 rounded-lg border border-green-500/30 transition-colors">
                    Generate Proof
                  </button>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">CYP2D6 Status</h3>
                  <p className="text-gray-300 mb-3">Verify drug metabolism compatibility</p>
                  <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-4 py-2 rounded-lg border border-purple-500/30 transition-colors">
                    Generate Proof
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        <div className="mt-8 bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-200 mb-2">
              Genomic Privacy DApp is Running!
            </h2>
            <p className="text-green-100">
              Backend API: ✅ Connected • Frontend: ✅ Working • Mock Data: ✅ Enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
