import { motion } from "framer-motion";

export default function LocationsLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-6"
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        📍 <span className="ml-2">Training Location</span>
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <div>
            <div className="text-white font-medium">Bayfront Park</div>
            <div className="text-white/70">Outdoor recreation center</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
