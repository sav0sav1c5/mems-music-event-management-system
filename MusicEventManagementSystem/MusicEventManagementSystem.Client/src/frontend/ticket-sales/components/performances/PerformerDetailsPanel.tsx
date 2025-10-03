import { Card } from "../../components/ui/card";
import { X, Music } from "lucide-react";
import type { PerformanceWithDetails } from "../../pages/Performances";

interface PerformerDetailsPanelProps {
  performance: PerformanceWithDetails;
  onClose: () => void;
  getGenreColor: (genre: string) => string;
}

const PerformerDetailsPanel = ({
  performance,
  onClose,
  getGenreColor
}: PerformerDetailsPanelProps) => {
  if (!performance.performer) return null;

  return (
    <div className="w-2/5 transition-all duration-300">
      <Card className="overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900/60 backdrop-blur-sm h-full">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-lime-400">Performer Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-1">
          {/* Performer Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-lime-500/20 rounded-xl border border-lime-500/30">
              <Music className="w-8 h-8 text-lime-400" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xl">
                {performance.performer.name}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getGenreColor(performance.performer.genre)}`}>
                  {performance.performer.genre}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  performance.performer.status === 'Active' 
                    ? 'text-green-400 bg-green-500/20 border-green-500/30' 
                    : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
                }`}>
                  {performance.performer.status}
                </span>
              </div>
            </div>
          </div>

          {/* Performer Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
              <span className="text-neutral-300 text-base">Popularity</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${performance.performer.popularity}%` }}
                  ></div>
                </div>
                <span className="text-yellow-400 text-base font-bold">
                  {performance.performer.popularity}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
              <span className="text-neutral-300 text-base">Price Range</span>
              <span className="text-green-400 text-base font-bold">
                ${performance.performer.minPrice.toLocaleString()} - ${performance.performer.maxPrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
              <span className="text-neutral-300 text-base">Email</span>
              <span className="text-white text-base">{performance.performer.email}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
              <span className="text-neutral-300 text-base">Contact</span>
              <span className="text-white text-base">{performance.performer.contact}</span>
            </div>

            {performance.performer.technicalRequirements && (
              <div className="p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
                <span className="text-neutral-300 text-base block mb-2">Technical Requirements</span>
                <p className="text-white text-sm">{performance.performer.technicalRequirements}</p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
              <span className="text-neutral-300 text-base">Average Response Time</span>
              <span className="text-white text-base">{performance.performer.averageResponseTime}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-neutral-800">
            <button 
              onClick={onClose}
              className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-all duration-200 border border-neutral-700 hover:border-neutral-500"
            >
              Close Details
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PerformerDetailsPanel;