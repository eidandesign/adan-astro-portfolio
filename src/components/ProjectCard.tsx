import React from 'react';
import { motion } from 'framer-motion';
import { urlFor } from '@/utils/sanity';

interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  year: number;
  client: string;
  description: string;
  heroImage: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  role: string;
}

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index = 0 }) => {
  const imageUrl = urlFor(project.heroImage)
    .width(600)
    .height(400)
    .url();

  return (
    <motion.a
      href={`/portfolio/${project.slug.current}`}
      className="group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <div className="overflow-hidden rounded-lg mb-6">
        <motion.img
          src={imageUrl}
          alt={project.title}
          className="w-full h-64 object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-600 transition">
            {project.title}
          </h3>
          <span className="text-sm text-gray-600">{project.year}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {project.category}
          </span>
          {project.client && (
            <span className="text-sm text-gray-600">{project.client}</span>
          )}
        </div>

        <p className="text-gray-600 text-sm leading-relaxed pt-2">
          {project.description}
        </p>

        <div className="pt-4 flex items-center text-gray-700 group-hover:text-gray-900 transition">
          <span className="text-sm font-medium">View Case Study</span>
          <motion.svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </motion.svg>
        </div>
      </div>
    </motion.a>
  );
};
