import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ContainerProps {
  className?: string;
  children: ReactNode;
}

const Container = ({ className = '', children }: ContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={` ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Container;
