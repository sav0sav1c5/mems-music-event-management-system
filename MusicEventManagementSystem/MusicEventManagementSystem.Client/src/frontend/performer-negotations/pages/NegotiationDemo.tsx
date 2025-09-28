import React from 'react';
import { 
  CheckCircle, 
  Workflow, 
  Users, 
  DollarSign,
  Calendar,
  MessageSquare,
  FileText,
  ArrowRight,
  Star,
  Clock
} from 'lucide-react';

const NegotiationDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎵 Complete Negotiation Workflow System
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            End-to-end performer negotiation management with full workflow automation
          </p>
          <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 inline-block">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Implementation Complete & Tested</span>
            </div>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">5-Phase Workflow</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Automated workflow with Initial Contact, Proposal Review, Contract Negotiation, Final Approval, and Event Preparation phases.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Sequential phase progression
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Requirement tracking
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Progress indicators
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Smart Management</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Complete CRUD operations with filtering, search, status tracking, and comprehensive error handling.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Real-time search & filtering
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Status-based organization
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Form validation
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Communication Hub</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Integrated communication log per negotiation with timestamped entries and conversation history.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Timestamped messages
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Conversation threading
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Type categorization
              </div>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-500" />
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Backend Architecture</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Repository Pattern with specialized interfaces</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Service Layer with workflow orchestration</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">RESTful API endpoints with comprehensive DTOs</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Automatic phase seeding and initialization</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Entity Framework with PostgreSQL</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Frontend Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Modern React with TypeScript</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Responsive design with Tailwind CSS</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Interactive workflow visualization</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Real-time progress tracking</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Comprehensive error handling</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Demo */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-500" />
            Workflow Process
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Initial Contact</h4>
                <p className="text-gray-400 text-sm">First contact and initial negotiations with the performer</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Proposal Review</h4>
                <p className="text-gray-400 text-sm">Review and evaluation of proposals and terms</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Contract Negotiation</h4>
                <p className="text-gray-400 text-sm">Detailed contract terms and conditions negotiation</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Final Approval</h4>
                <p className="text-gray-400 text-sm">Final approval and sign-off from all parties</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">5</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Event Preparation</h4>
                <p className="text-gray-400 text-sm">Final preparations and logistics before the event</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">🚀 Ready to Use!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Backend Running</h3>
              <div className="bg-black bg-opacity-20 rounded p-3 text-white font-mono text-sm">
                http://localhost:5255
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Frontend Running</h3>
              <div className="bg-black bg-opacity-20 rounded p-3 text-white font-mono text-sm">
                http://localhost:5173
              </div>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-white text-lg">
              ✅ Navigate to <strong>Artist Communication → Negotiations</strong> to start managing performer negotiations with the complete workflow system!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegotiationDemo;