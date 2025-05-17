import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.75 }}
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div className="text-blue-800 font-bold text-2xl animate-pulse">FL Best Trainer</div>
    </motion.div>
  );
}