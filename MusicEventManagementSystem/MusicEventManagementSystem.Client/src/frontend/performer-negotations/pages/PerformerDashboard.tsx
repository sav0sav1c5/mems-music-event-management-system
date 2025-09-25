import { useState, useEffect } from "react";
import { Music, FileText, Handshake, Layers, MessageSquare, ArrowUp, ArrowDown } from "lucide-react";
import { performerService } from "../services/performerService";
import { requirementService } from "../services/requirementService";
import { contractService } from "../services/contractService";
import { negotiationService } from "../services/negotiationService";
import { phaseService } from "../services/phaseService";
import { documentService } from "../services/documentService";
import { communicationService } from "../services/communicationService";

const PerformerDashboard = () => {
  const [stats, setStats] = useState({
    performers: 0,
    requirements: 0,
    contracts: 0,
    negotiations: 0,
    phases: 0,
    documents: 0,
    communications: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        performers,
        requirements,
        contracts,
        negotiations,
        phases,
        documents,
        communications
      ] = await Promise.all([
        performerService.getAllPerformers(),
        requirementService.getAllRequirements(),
        contractService.getAllContracts(),
        negotiationService.getAllNegotiations(),
        phaseService.getAllPhases(),
        documentService.getAllDocuments(),
        communicationService.getAllCommunications()
      ]);

      setStats({
        performers: performers.length,
        requirements: requirements.length,
        contracts: contracts.length,
        negotiations: negotiations.length,
        phases: phases.length,
        documents: documents.length,
        communications: communications.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const dashboardStats = [
    {
      title: "Performers",
      value: stats.performers.toString(),
      change: "+12.5%",
      trend: "up",
      icon: <Music className="w-5 h-5" />,
      color: "lime",
      description: "Total performers in the system"
    },
    {
      title: "Requirements",
      value: stats.requirements.toString(),
      change: "+8.2%",
      trend: "up",
      icon: <FileText className="w-5 h-5" />,
      color: "blue",
      description: "Project requirements tracked"
    },
    {
      title: "Contracts",
      value: stats.contracts.toString(),
      change: "+15.3%",
      trend: "up",
      icon: <FileText className="w-5 h-5" />,
      color: "purple",
      description: "Active contracts managed"
    },
    {
      title: "Negotiations",
      value: stats.negotiations.toString(),
      change: "+18.7%",
      trend: "up",
      icon: <Handshake className="w-5 h-5" />,
      color: "orange",
      description: "Ongoing negotiations"
    },
    {
      title: "Phases",
      value: stats.phases.toString(),
      change: "+10.1%",
      trend: "up",
      icon: <Layers className="w-5 h-5" />,
      color: "cyan",
      description: "Project phases defined"
    },
    {
      title: "Documents",
      value: stats.documents.toString(),
      change: "+22.3%",
      trend: "up",
      icon: <FileText className="w-5 h-5" />,
      color: "indigo",
      description: "Documents in repository"
    },
    {
      title: "Communications",
      value: stats.communications.toString(),
      change: "+14.8%",
      trend: "up",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "pink",
      description: "Total communications logged"
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading dashboard...</div>;

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Performer Subsystem Dashboard</h1>
        <p className="text-neutral-400 text-lg">
          Overview of all performer-related activities and data
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-lime-400/30 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg ${stat.color === 'lime' ? 'bg-lime-400/20 text-lime-400' : 
                                                stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                                                stat.color === 'purple' ? 'bg-purple-400/20 text-purple-400' :
                                                stat.color === 'orange' ? 'bg-orange-400/20 text-orange-400' :
                                                stat.color === 'cyan' ? 'bg-cyan-400/20 text-cyan-400' :
                                                stat.color === 'indigo' ? 'bg-indigo-400/20 text-indigo-400' :
                                                'bg-pink-400/20 text-pink-400'}`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-lime-400' : 'text-red-400'
              }`}>
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white group-hover:text-lime-400 transition-colors mb-1">
                {stat.value}
              </h3>
              <p className="text-neutral-300 text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-neutral-500 text-xs">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-6 hover:border-lime-400/30 transition-all duration-200">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/30 rounded-xl transition-all duration-200 group">
            <Music className="w-6 h-6 text-lime-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Add Performer</p>
          </button>
          <button className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all duration-200 group">
            <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Create Requirement</p>
          </button>
          <button className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all duration-200 group">
            <FileText className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">New Contract</p>
          </button>
          <button className="p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-all duration-200 group">
            <Handshake className="w-6 h-6 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Start Negotiation</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-6 hover:border-lime-400/30 transition-all duration-200">
        <h2 className="text-xl font-bold text-white mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Entity Distribution</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Performers</span>
                <span className="text-lime-400 font-semibold">{stats.performers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Requirements</span>
                <span className="text-blue-400 font-semibold">{stats.requirements}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Contracts</span>
                <span className="text-purple-400 font-semibold">{stats.contracts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Negotiations</span>
                <span className="text-orange-400 font-semibold">{stats.negotiations}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Supporting Data</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Phases</span>
                <span className="text-cyan-400 font-semibold">{stats.phases}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Documents</span>
                <span className="text-indigo-400 font-semibold">{stats.documents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Communications</span>
                <span className="text-pink-400 font-semibold">{stats.communications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Total Records</span>
                <span className="text-white font-semibold">
                  {stats.performers + stats.requirements + stats.contracts + stats.negotiations + stats.phases + stats.documents + stats.communications}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformerDashboard;
